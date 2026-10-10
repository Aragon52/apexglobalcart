import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";
import { resellerPath } from "@/lib/subdomain";

export const Route = createFileRoute("/reseller/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Reseller portal — Apex Global Cart" },
      { name: "description", content: "Choose a new password for your Apex Global Cart reseller account." },
      { property: "og:title", content: "Set a new password — Reseller portal — Apex Global Cart" },
      { property: "og:description", content: "Choose a new password for your Apex Global Cart reseller account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <ResetPasswordForm forgotPath={resellerPath("/reseller/forgot-password")} donePath={resellerPath("/reseller/dashboard")} />
  ),
});
