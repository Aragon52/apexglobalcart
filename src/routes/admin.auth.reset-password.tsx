import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";
import { adminPath } from "@/lib/subdomain";

export const Route = createFileRoute("/admin/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Admin portal — Apex Global Cart" },
      { name: "description", content: "Choose a new password for your Apex Global Cart admin account." },
      { property: "og:title", content: "Set a new password — Admin portal — Apex Global Cart" },
      { property: "og:description", content: "Choose a new password for your Apex Global Cart admin account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <ResetPasswordForm forgotPath={adminPath("/admin/auth/forgot-password")} donePath={adminPath("/admin")} />,
});
