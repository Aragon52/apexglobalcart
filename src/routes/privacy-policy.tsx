import { createFileRoute } from "@tanstack/react-router";
import { withPageSeo } from "@/lib/page-seo";
import MainLayout from "@/components/layout/MainLayout";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

export const Route = createFileRoute("/privacy-policy")({
  head: () => withPageSeo("/privacy-policy", {
    meta: [
      { title: "Privacy Policy | Apex Global Cart Online Shop" },
      { name: "description", content: "Privacy policy, data protection, and GDPR/CCPA/PDPA compliance for Apex Global Cart International Pte. Ltd." },
      { property: "og:title", content: "Privacy Policy | Apex Global Cart Online Shop" },
      { property: "og:description", content: "Privacy policy and international data protection standards at Apex Global Cart." },
    ],
  }),
  component: () => (
    <MainLayout>
      <PrivacyPolicy />
    </MainLayout>
  ),
});
