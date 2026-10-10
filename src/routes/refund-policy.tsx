import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import ReturnRefundPolicy from "@/pages/ReturnRefundPolicy";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Return & Refund Policy | Apex Global Onlineshop Online Shop" },
      { name: "description", content: "Learn about Apex Global Onlineshop 14-day return guarantees, refund processing, and consumer buyer protection." },
      { property: "og:title", content: "Return & Refund Policy | Apex Global Onlineshop Online Shop" },
      { property: "og:description", content: "Complete guidelines on returns, refunds, and replacements at Apex Global Onlineshop." },
    ],
  }),
  component: () => (
    <MainLayout>
      <ReturnRefundPolicy />
    </MainLayout>
  ),
});
