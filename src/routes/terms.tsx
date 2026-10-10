import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import TermsOfService from "@/pages/TermsOfService";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Apex Global Onlineshop Online Shop" },
      { name: "description", content: "Terms of service, buyer protection rules, and merchant guidelines for Apex Global Onlineshop International Pte. Ltd." },
      { property: "og:title", content: "Terms of Service | Apex Global Onlineshop Online Shop" },
      { property: "og:description", content: "User terms of service, merchant policies, and buyer guarantees at Apex Global Onlineshop." },
    ],
  }),
  component: () => (
    <MainLayout>
      <TermsOfService />
    </MainLayout>
  ),
});
