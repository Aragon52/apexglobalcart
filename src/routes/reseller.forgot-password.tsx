import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/password-reset-forms";
import { resellerPath } from "@/lib/subdomain";

export const Route = createFileRoute("/reseller/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Reseller portal — Apex Global Cart" },
      { name: "description", content: "Get a link to reset your Apex Global Cart reseller password." },
      { property: "og:title", content: "Reset your password — Reseller portal — Apex Global Cart" },
      { property: "og:description", content: "Get a link to reset your Apex Global Cart reseller password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <ForgotPasswordForm
      portalName="reseller"
      resetPath={resellerPath("/reseller/reset-password")}
      backPath={resellerPath("/reseller/login")}
    />
  ),
});
