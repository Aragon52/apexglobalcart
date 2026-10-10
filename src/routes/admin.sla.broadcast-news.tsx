import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import BroadcastNewsPage from "@/pages/admin/BroadcastNewsPage";

export const Route = createFileRoute("/admin/sla/broadcast-news")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Broadcast news — Admin portal — Apex Global Cart" },
      { property: "og:description", content: "Secure portal for Apex Global Cart administrators and staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Apex Global Cart Admin Portal" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { title: "Broadcast news — Admin portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSlaBroadcastNewsRoutePage,
});

function AdminSlaBroadcastNewsRoutePage() {
  return <AdminLayout><BroadcastNewsPage /></AdminLayout>;
}
