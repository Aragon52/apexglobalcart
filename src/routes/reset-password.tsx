import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Apex Global Cart" },
      { name: "description", content: "Choose a new password for your Apex Global Cart shopping account." },
      { property: "og:title", content: "Set a new password — Apex Global Cart" },
      { property: "og:description", content: "Choose a new password for your Apex Global Cart shopping account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <ResetPasswordForm forgotPath="/forgot-password" donePath="/" />,
});
