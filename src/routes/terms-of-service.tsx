import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import TermsOfService from "@/pages/TermsOfService";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Apex Global Cart Online Shop" },
      { name: "description", content: "Terms of service, buyer protection rules, and merchant guidelines for Apex Global Cart International Pte. Ltd." },
      { property: "og:title", content: "Terms of Service | Apex Global Cart Online Shop" },
      { property: "og:description", content: "User terms of service, merchant policies, and buyer guarantees at GCOS." },
    ],
  }),
  component: () => (
    <MainLayout>
      <TermsOfService />
    </MainLayout>
  ),
});
