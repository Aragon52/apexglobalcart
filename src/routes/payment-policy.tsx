import { createFileRoute } from "@tanstack/react-router";
import { withPageSeo } from "@/lib/page-seo";
import MainLayout from "@/components/layout/MainLayout";
import PaymentPolicy from "@/pages/PaymentPolicy";

export const Route = createFileRoute("/payment-policy")({
  head: () => withPageSeo("/payment-policy", {
    meta: [
      { title: "Payment Security & PCI-DSS Policy | Apex Global Cart Online Shop" },
      { name: "description", content: "Details on payment encryption, PCI-DSS Level 1 compliance, 3D Secure, and fraud prevention at Apex Global Cart." },
      { property: "og:title", content: "Payment Security Policy | Apex Global Cart Online Shop" },
      { property: "og:description", content: "PCI-DSS Level 1 security and payment safeguards at Apex Global Cart." },
    ],
  }),
  component: () => (
    <MainLayout>
      <PaymentPolicy />
    </MainLayout>
  ),
});
