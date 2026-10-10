import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminInventoryPage from "@/pages/admin/AdminInventoryPage";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Admin portal — Apex Global Onlineshop" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminInventoryRoutePage,
});

function AdminInventoryRoutePage() {
  return <AdminLayout><AdminInventoryPage /></AdminLayout>;
}
