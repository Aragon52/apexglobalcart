import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/auth/password-reset-forms";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Apex Global Cart" },
      { name: "description", content: "Get a link to reset your Apex Global Cart shopping account password." },
      { property: "og:title", content: "Reset your password — Apex Global Cart" },
      { property: "og:description", content: "Get a link to reset your Apex Global Cart shopping account password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <ForgotPasswordForm portalName="Apex Global Cart" resetPath="/reset-password" backPath="/cart/login" />,
});
