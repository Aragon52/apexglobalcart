import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerShopCustomization from "@/pages/reseller/ResellerShopCustomization";

export const Route = createFileRoute("/reseller/profile_/customize")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Customize shop — Reseller portal — Apex Global Cart" },
      { property: "og:description", content: "Run your own online shop with Apex Global Cart: pick products, manage orders and grow your earnings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Apex Global Cart Reseller Portal" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
      { title: "Customize shop — Reseller portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: ResellerProfileCustomizeRoutePage,
});

function ResellerProfileCustomizeRoutePage() {
  return <ResellerLayout><ResellerShopCustomization /></ResellerLayout>;
}
