import { createFileRoute } from "@tanstack/react-router";
import AdminSignIn from "@/pages/admin/AdminSignIn";

export const Route = createFileRoute("/admin/auth/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — Admin portal — Apex Global Cart" },
      { property: "og:title", content: "Admin portal — Apex Global Cart" },
      { property: "og:description", content: "Secure sign-in for Apex Global Cart administrators and staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Apex Global Cart Admin Portal" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminAuthSignInRoutePage,
});

function AdminAuthSignInRoutePage() {
  return <AdminSignIn />;
}
