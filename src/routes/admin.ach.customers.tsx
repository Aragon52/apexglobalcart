import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ACHCustomersPage from "@/pages/admin/ACHCustomersPage";

export const Route = createFileRoute("/admin/ach/customers")({
  head: () => ({
    meta: [
      { title: "Ach customers — Admin portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminAchCustomersRoutePage,
});

function AdminAchCustomersRoutePage() {
  return <AdminLayout><ACHCustomersPage /></AdminLayout>;
}
