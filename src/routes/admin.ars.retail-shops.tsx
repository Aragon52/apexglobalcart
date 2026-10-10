import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import ARSRetailShopsPage from "@/pages/admin/ARSRetailShopsPage";

export const Route = createFileRoute("/admin/ars/retail-shops")({
  head: () => ({
    meta: [
      { title: "Retail shops — Admin portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminArsRetailShopsRoutePage,
});

function AdminArsRetailShopsRoutePage() {
  return <AdminLayout><ARSRetailShopsPage /></AdminLayout>;
}
