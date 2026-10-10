import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminSessionsPage from "@/pages/admin/AdminSessionsPage";
import { RoleGuard } from "@/components/admin/RoleGuard";

export const Route = createFileRoute("/admin/system/sessions")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Admin Sessions & IP Log — Apex Global Cart" },
      { property: "og:description", content: "Secure portal for Apex Global Cart administrators and staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Apex Global Cart Admin Portal" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { title: "Admin Sessions & IP Log — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSystemSessionsRoutePage,
});

function AdminSystemSessionsRoutePage() {
  return (
    <RoleGuard path="/admin/system/sessions">
      <AdminLayout>
        <AdminSessionsPage />
      </AdminLayout>
    </RoleGuard>
  );
}
