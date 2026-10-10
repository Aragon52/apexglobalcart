import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Apex Global Onlineshop Online Shop" },
      { name: "description", content: "Privacy policy, data protection, and GDPR/CCPA/PDPA compliance for Apex Global Onlineshop International Pte. Ltd." },
      { property: "og:title", content: "Privacy Policy | Apex Global Onlineshop Online Shop" },
      { property: "og:description", content: "Privacy policy and international data protection standards at Apex Global Onlineshop." },
    ],
  }),
  component: () => (
    <MainLayout>
      <PrivacyPolicy />
    </MainLayout>
  ),
});
