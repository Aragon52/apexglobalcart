import { resellerPrefix } from "@/lib/subdomain";

const PRODUCTION_RESELLER_ORIGIN = "https://reseller.apexglobalonlineshop.com";

/** Builds the reseller sign-up link that pre-fills an admin or staff invite code. */
export function buildReferralLink(code: string): string {
  const encoded = encodeURIComponent(code);
  if (typeof window === "undefined") return `${PRODUCTION_RESELLER_ORIGIN}/register?ref=${encoded}`;
  const host = window.location.hostname;
  if (host.endsWith("apexglobalonlineshop.com")) return `${PRODUCTION_RESELLER_ORIGIN}/register?ref=${encoded}`;
  return `${window.location.origin}${resellerPrefix()}/register?ref=${encoded}`;
}
