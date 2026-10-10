import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerDashboard from "@/pages/reseller/ResellerDashboard";

export const Route = createFileRoute("/reseller/")({
  head: () => ({
    meta: [
      { title: "Reseller dashboard — Apex Global Cart" },
      { name: "description", content: "Open your own online shop with Apex Global Cart: pick products from our catalogue, manage orders and grow your earnings worldwide." },
      { property: "og:title", content: "Reseller dashboard — Apex Global Cart" },
      { property: "og:description", content: "Open your own online shop with Apex Global Cart: pick products from our catalogue, manage orders and grow your earnings worldwide." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Apex Global Cart Reseller Portal" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
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
