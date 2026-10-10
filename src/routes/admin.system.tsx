import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import SLASystemPage from "@/pages/admin/SLASystemPage";

export const Route = createFileRoute("/admin/system")({
  head: () => ({
    meta: [
      { title: "System — Admin portal — Apex Global Onlineshop" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminSystemRoutePage,
});

function AdminSystemRoutePage() {
  return <AdminLayout><SLASystemPage /></AdminLayout>;
}
