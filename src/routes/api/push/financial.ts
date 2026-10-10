import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";
const bodySchema = z.object({
  table: z.enum(["deposit_requests", "withdrawal_requests"]),
  id: z.string().uuid(),
});

interface RequestRow {
  id: string;
  resellerDocId: string | null;
  amount: number | null;
  status: string | null;
  remark: string | null;
}

async function sendToTokens(
  admin: SupabaseClient,
  tokens: string[],
  title: string,
  body: string,
  path: string,
): Promise<number> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connKey = process.env["FIREBASE_MESSAGING_API_KEY"];
  if (!lovableKey || !connKey || tokens.length === 0) return 0;
  let sent = 0;
  await Promise.all(
    tokens.map(async (token) => {
      const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": connKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            data: { path },
            webpush: { fcm_options: { link: path }, notification: { icon: "/icons/icon-192.png" } },
          },
        }),
      });
      if (res.ok) {
        sent += 1;
        return;
      }
      const text = await res.text();
      // Stale device: forget it instead of retrying.
      if (res.status === 404 || (res.status === 400 && /INVALID_ARGUMENT|UNREGISTERED/.test(text))) {
        await admin.from("push_tokens").delete().eq("token", token);
      } else {
        console.error(`Push send failed [${res.status}]: ${text}`);
      }
    }),
  );
  return sent;
}

export const Route = createFileRoute("/api/push/financial")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

        const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const url = process.env["SUPABASE_URL"];
        const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!url || !serviceKey) return Response.json({ error: "Unavailable" }, { status: 503 });
        const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

        const { data: caller } = await admin.auth.getUser(token);
        const callerId = caller.user?.id;
        if (!callerId) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const { data: row } = await admin
          .from(parsed.data.table)
          .select('id, "resellerDocId", amount, status, remark')
          .eq("id", parsed.data.id)
          .maybeSingle<RequestRow>();
        if (!row?.resellerDocId) return Response.json({ error: "Not found" }, { status: 404 });

        const kind = parsed.data.table === "deposit_requests" ? "deposit" : "withdrawal";
        const amount = `$${Number(row.amount ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
        const status = String(row.status ?? "").toLowerCase();

        if (status === "pending") {
          // New request: only the reseller who owns it may announce it; notify their admin, staff and the Owner.
          if (callerId !== row.resellerDocId) return Response.json({ error: "Forbidden" }, { status: 403 });
          const { data: profile } = await admin
            .from("reseller_profiles")
            .select("shop_name, member_of_admin_id, referred_by_staff_id")
            .eq("id", row.resellerDocId)
            .maybeSingle();
          const { data: owners } = await admin.from("users").select("id").eq("role", "owner");
          const recipients = [
            ...(owners ?? []).map((o) => o.id as string),
            profile?.member_of_admin_id,
            profile?.referred_by_staff_id,
          ].filter((v): v is string => Boolean(v));
          const { data: tokens } = await admin
            .from("push_tokens")
            .select("token")
            .eq("portal", "admin")
            .in("user_id", recipients);
          const sent = await sendToTokens(
            admin,
            (tokens ?? []).map((t) => t.token as string),
            `New ${kind} request`,
            `${profile?.shop_name ?? "A reseller"} requested a ${kind} of ${amount}.`,
            kind === "deposit" ? "/admin/ars/deposit" : "/admin/ars/withdrawal",
          );
          return Response.json({ sent });
        }

        // Status change: only admin/staff/Owner may announce it; notify the reseller.
        const { data: isSla } = await admin.rpc("is_sla_user", { user_id: callerId });
        if (!isSla) return Response.json({ error: "Forbidden" }, { status: 403 });
        const approved = status === "approved" || status === "completed";
        const rejected = status === "rejected" || status === "failed";
        if (!approved && !rejected) return Response.json({ sent: 0 });
        const { data: tokens } = await admin
          .from("push_tokens")
          .select("token")
          .eq("user_id", row.resellerDocId);
        const sent = await sendToTokens(
          admin,
          (tokens ?? []).map((t) => t.token as string),
          approved ? `${kind === "deposit" ? "Deposit" : "Withdrawal"} approved` : `${kind === "deposit" ? "Deposit" : "Withdrawal"} rejected`,
          approved
            ? `Your ${kind} of ${amount} has been approved.`
            : `Your ${kind} of ${amount} was rejected.${row.remark ? ` Reason: ${row.remark}` : ""}`,
          "/reseller/profile",
        );
        return Response.json({ sent });
      },
    },
  },
});
