import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import FAQ from "@/pages/FAQ";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ & Trust Center | Apex Global Cart Online Shop" },
      { name: "description", content: "Frequently asked questions about Apex Global Cart payment security, buyer protection, shipping, and seller verification." },
      { property: "og:title", content: "FAQ & Trust Center | Apex Global Cart Online Shop" },
      { property: "og:description", content: "Frequently asked questions and trust center information for Apex Global Cart." },
    ],
  }),
  component: () => (
    <MainLayout>
      <FAQ />
    </MainLayout>
  ),
});
