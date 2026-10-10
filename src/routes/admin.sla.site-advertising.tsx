import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SiteFrontAdvertisingPage from "@/pages/admin/SiteFrontAdvertisingPage";

export const Route = createFileRoute("/admin/sla/site-advertising")({
  head: () => ({
    meta: [
      { title: "Sla site advertising — Admin portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSlaSiteAdvertisingRoutePage,
});

function AdminSlaSiteAdvertisingRoutePage() {
  return <AdminLayout><SiteFrontAdvertisingPage /></AdminLayout>;
}
