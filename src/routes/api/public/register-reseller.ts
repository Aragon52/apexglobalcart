import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const googleSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  shopName: z.string().trim().max(80).optional(),
  referralCode: z.string().trim().max(40).optional(),
  viaGoogle: z.literal(true),
});

const bodySchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  emailOrPhone: z.string().trim().min(5).max(120),
  password: z.string().min(6).max(128),
  shopName: z.string().trim().max(80).optional(),
  referralCode: z.string().trim().min(3).max(40),
  isPhone: z.boolean().optional(),
});

interface ReferralOwner {
  referredByStaffId: string | null;
  memberOfAdminId: string | null;
  code: string;
}

/** Accepts the new short invite codes and the older long codes from previously shared links. */
async function resolveReferral(supabase: SupabaseClient, rawCode: string): Promise<ReferralOwner | null> {
  const code = rawCode.trim().toUpperCase();
  const staffQuery = await supabase
    .from("sla_staff")
    .select("id, created_by_admin_id, invite_code, status")
    .or(`invite_code.eq.${code},referral_id.eq.${code},staff_id.eq.${code}`)
    .limit(1)
    .maybeSingle();
  const staff = staffQuery.data as { id: string; created_by_admin_id: string | null; invite_code: string | null; status: string | null } | null;
  if (staff && staff.status !== "Suspended") {
    return { referredByStaffId: staff.id, memberOfAdminId: staff.created_by_admin_id, code: staff.invite_code ?? code };
  }

  const adminQuery = await supabase
    .from("sla_admins")
    .select("id, invite_code, status")
    .or(`invite_code.eq.${code},account_id.eq.${code}`)
    .limit(1)
    .maybeSingle();
  const admin = adminQuery.data as { id: string; invite_code: string | null; status: string | null } | null;
  if (admin && admin.status !== "Suspended") {
    return { referredByStaffId: null, memberOfAdminId: admin.id, code: admin.invite_code ?? code };
  }
  return null;
}

const INVALID_CODE = "To join as a reseller, please open the referral link from your admin first.";

function serviceClient(): SupabaseClient {
  return createClient(process.env["SUPABASE_URL"] ?? "", process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** First Google sign-in on the reseller portal: the account already exists, so only the shop is set up. */
async function handleGoogleSignup(request: Request, raw: unknown): Promise<Response> {
  const parsed = googleSchema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Missing sign-up details." }, { status: 400 });
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token) return Response.json({ error: "Please sign in with Google again." }, { status: 401 });

  const supabase = serviceClient();
  const { data: userResult, error: userError } = await supabase.auth.getUser(token);
  const authUser = userResult?.user;
  if (userError || !authUser) return Response.json({ error: "Please sign in with Google again." }, { status: 401 });

  const code = parsed.data.referralCode ?? "";
  if (!/^[A-Za-z0-9-]{3,40}$/.test(code)) return Response.json({ error: INVALID_CODE }, { status: 400 });
  const referral = await resolveReferral(supabase, code);
  if (!referral) return Response.json({ error: INVALID_CODE }, { status: 400 });

  const { data: existingProfile } = await supabase.from("reseller_profiles").select("id").eq("id", authUser.id).maybeSingle();
  if (existingProfile) return Response.json({ success: true, userId: authUser.id });

  const result = await createResellerRecords(supabase, {
    userId: authUser.id,
    email: authUser.email ?? null,
    phone: null,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    shopName: parsed.data.shopName || `${parsed.data.firstName}'s Shop`,
    referral,
  });
  if (!result.ok) return Response.json({ error: "We couldn't finish setting up your shop. Please try again." }, { status: 500 });
  return Response.json({ success: true, userId: authUser.id });
}

interface NewReseller {
  userId: string;
  email: string | null;
  phone: string | null;
  firstName: string;
  lastName: string;
  shopName: string;
  referral: ReferralOwner;
}

async function createResellerRecords(supabase: SupabaseClient, r: NewReseller): Promise<{ ok: boolean }> {
  const now = new Date().toISOString();
  const { data: existingUser } = await supabase.from("users").select("id, role").eq("id", r.userId).maybeSingle();
  if (!existingUser) {
    const { error } = await supabase.from("users").insert({
      id: r.userId, email: r.email, phone: r.phone, first_name: r.firstName, last_name: r.lastName, role: "reseller", created_at: now,
    });
    if (error) return { ok: false };
  } else if ((existingUser as { role: string | null }).role === "customer" || !(existingUser as { role: string | null }).role) {
    await supabase.from("users").update({ role: "reseller" }).eq("id", r.userId);
  }

  const { data: lastReseller } = await supabase
    .from("reseller_profiles")
    .select("reseller_id")
    .order("reseller_id", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  const newResellerId = ((lastReseller as { reseller_id?: number } | null)?.reseller_id ?? 25030) + 1;
  const shopSlug = `${slugify(r.shopName)}-${Math.random().toString(36).substring(2, 6)}`;

  const { error: profileError } = await supabase.from("reseller_profiles").insert({
    id: r.userId, email: r.email, phone: r.phone, first_name: r.firstName, last_name: r.lastName,
    shop_name: r.shopName, shop_slug: shopSlug,
    referral_id: "GC-" + r.userId.substring(0, 4).toUpperCase(),
    referral_code: r.referral.code,
    referred_by_staff_id: r.referral.referredByStaffId,
    member_of_admin_id: r.referral.memberOfAdminId,
    balance: 0, total_deposits: 0, total_withdrawals: 0, total_earnings: 0, total_orders: 0,
    level: "VIP-0", product_limit: 20, credit_score: 100, star_rating: 2.0, verified: true,
    reseller_id: newResellerId, registration_date: now,
  });
  if (profileError) return { ok: false };

  await supabase.from("retail_shops").insert({
    id: r.userId, reseller_id: newResellerId, shop_name: r.shopName, shop_slug: shopSlug,
    level: "VIP-0", product_limit: 20, star_rating: 2.0, credit_score: 100, created_at: now,
  });
  return { ok: true };
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shop";
}

export const Route = createFileRoute("/api/public/register-reseller")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw: unknown = await request.json().catch(() => null);
        if (raw && typeof raw === "object" && (raw as { viaGoogle?: unknown }).viaGoogle === true) {
          return handleGoogleSignup(request, raw);
        }
        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json({ error: "Please fill in every field, including a valid invite code." }, { status: 400 });
        }
        const body = parsed.data;
        // Only allow safe characters in the code before it reaches a filter string.
        if (!/^[A-Za-z0-9-]+$/.test(body.referralCode)) {
          return Response.json({ error: "This invite code isn't valid. Please ask your admin for a new link." }, { status: 400 });
        }

        const supabase = createClient(
          process.env["SUPABASE_URL"] ?? "",
          process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "",
          { auth: { persistSession: false, autoRefreshToken: false } },
        );

        const referral = await resolveReferral(supabase, body.referralCode);
        if (!referral) {
          return Response.json({ error: "This invite code isn't valid. Please ask your admin for a new link." }, { status: 400 });
        }

        const isPhone = body.isPhone === true;
        const identifier = isPhone ? body.emailOrPhone.replace(/\s+/g, "") : body.emailOrPhone.toLowerCase();
        if (!isPhone && !z.string().email().safeParse(identifier).success) {
          return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
        }

        const { data: authData, error: authError } = await supabase.auth.admin.createUser(
          isPhone
            ? { phone: identifier, password: body.password, phone_confirm: true }
            : { email: identifier, password: body.password, email_confirm: true },
        );
        if (authError || !authData.user) {
          const exists = authError?.message.toLowerCase().includes("already");
          return Response.json(
            { error: exists ? "An account with these details already exists. Please sign in instead." : "We couldn't create your account. Please try again." },
            { status: exists ? 409 : 500 },
          );
        }

        const userId = authData.user.id;
        const email = isPhone ? null : identifier;
        const shopName = body.shopName || `${body.firstName}'s Shop`;
        const now = new Date().toISOString();

        try {
          const { error: userError } = await supabase.from("users").insert({
            id: userId,
            email,
            phone: isPhone ? identifier : null,
            first_name: body.firstName,
            last_name: body.lastName,
            role: "reseller",
            created_at: now,
          });
          if (userError) throw userError;

          const { data: lastReseller } = await supabase
            .from("reseller_profiles")
            .select("reseller_id")
            .order("reseller_id", { ascending: false, nullsFirst: false })
            .limit(1)
            .maybeSingle();
          const newResellerId = ((lastReseller as { reseller_id?: number } | null)?.reseller_id ?? 25030) + 1;
          const shopSlug = `${slugify(shopName)}-${Math.random().toString(36).substring(2, 6)}`;

          const { error: profileError } = await supabase.from("reseller_profiles").insert({
            id: userId,
            email,
            phone: isPhone ? identifier : null,
            first_name: body.firstName,
            last_name: body.lastName,
            shop_name: shopName,
            shop_slug: shopSlug,
            referral_id: "GC-" + userId.substring(0, 4).toUpperCase(),
            referral_code: referral.code,
            referred_by_staff_id: referral.referredByStaffId,
            member_of_admin_id: referral.memberOfAdminId,
            balance: 0,
            total_deposits: 0,
            total_withdrawals: 0,
            total_earnings: 0,
            total_orders: 0,
            level: "VIP-0",
            product_limit: 20,
            credit_score: 100,
            star_rating: 2.0,
            verified: true,
            reseller_id: newResellerId,
            registration_date: now,
          });
          if (profileError) throw profileError;

          await supabase.from("retail_shops").insert({
            id: userId,
            reseller_id: newResellerId,
            shop_name: shopName,
            shop_slug: shopSlug,
            level: "VIP-0",
            product_limit: 20,
            star_rating: 2.0,
            credit_score: 100,
            created_at: now,
          });

          return Response.json({ success: true, userId });
        } catch {
          // Roll back the half-created account so the person can try again.
          await supabase.from("reseller_profiles").delete().eq("id", userId);
          await supabase.from("users").delete().eq("id", userId);
          await supabase.auth.admin.deleteUser(userId);
          return Response.json({ error: "We couldn't finish setting up your shop. Please try again." }, { status: 500 });
        }
      },
    },
  },
});
