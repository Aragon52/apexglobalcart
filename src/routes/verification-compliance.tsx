import { createFileRoute } from "@tanstack/react-router";
import { withPageSeo } from "@/lib/page-seo";
import MainLayout from "@/components/layout/MainLayout";
import VerificationCompliance from "@/pages/VerificationCompliance";

export const Route = createFileRoute("/verification-compliance")({
  head: () => withPageSeo("/verification-compliance", {
    meta: [
      { title: "Verification & Compliance | Apex Global Cart" },
      { name: "description", content: "Learn how Apex Global Cart verifies sellers, reviews orders and payments, and protects marketplace trust." },
      { property: "og:title", content: "Verification & Compliance | Apex Global Cart" },
      { property: "og:description", content: "Learn how Apex Global Cart protects marketplace trust and safety." },
    ],
  }),
  component: () => <MainLayout><VerificationCompliance /></MainLayout>,
});
