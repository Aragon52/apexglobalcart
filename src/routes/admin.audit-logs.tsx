import { createFileRoute } from "@tanstack/react-router";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminAuditLogsPage from "@/pages/admin/AdminAuditLogsPage";

export const Route = createFileRoute("/admin/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit logs — Admin portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: AdminAuditLogsRoutePage,
});

function AdminAuditLogsRoutePage() {
  return <AdminLayout><AdminAuditLogsPage /></AdminLayout>;
}
