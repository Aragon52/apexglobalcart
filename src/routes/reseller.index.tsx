import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerDashboard from "@/pages/reseller/ResellerDashboard";

export const Route = createFileRoute("/reseller/")({
  head: () => ({
    meta: [
      { title: "Reseller dashboard — Apex Global Cart" },
      { name: "description", content: "Shop electronics, fashion, home, beauty and sports from verified reseller stores on Apex Global Cart, with secure checkout and worldwide delivery." },
      { property: "og:title", content: "Reseller dashboard — Apex Global Cart" },
      { property: "og:description", content: "Shop electronics, fashion, home, beauty and sports from verified reseller stores on Apex Global Cart, with secure checkout and worldwide delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResellerIndexRoutePage,
});

function ResellerIndexRoutePage() {
  return (
    <ResellerLayout>
      <ResellerDashboard />
    </ResellerLayout>
  );
}
