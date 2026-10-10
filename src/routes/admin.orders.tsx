import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Orders — Admin portal — Apex Global Cart" },
      { property: "og:description", content: "Secure portal for Apex Global Cart administrators and staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Apex Global Cart Admin Portal" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { title: "Orders — Admin portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminOrdersRoutePage,
});

function AdminOrdersRoutePage() {
  return <AdminLayout><AdminOrdersPage /></AdminLayout>;
}
