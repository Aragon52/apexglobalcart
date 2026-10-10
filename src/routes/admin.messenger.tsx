import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminMessengerPage from "@/pages/admin/AdminMessengerPage";

export const Route = createFileRoute("/admin/messenger")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Messenger — Admin portal — Apex Global Cart" },
      { property: "og:description", content: "Secure portal for Apex Global Cart administrators and staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Apex Global Cart Admin Portal" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-admin.png" },
      { title: "Messenger — Admin portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminMessengerRoutePage,
});

function AdminMessengerRoutePage() {
  return <AdminLayout><AdminMessengerPage /></AdminLayout>;
}
