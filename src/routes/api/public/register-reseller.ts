import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

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

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "shop";
}

export const Route = createFileRoute("/api/public/register-reseller")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
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
