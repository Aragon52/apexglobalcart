import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminAlertsPage from "@/pages/admin/AdminAlertsPage";

export const Route = createFileRoute("/admin/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — Admin portal — Apex Global Onlineshop" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminAlertsRoutePage,
});

function AdminAlertsRoutePage() {
  return <AdminLayout><AdminAlertsPage /></AdminLayout>;
}
