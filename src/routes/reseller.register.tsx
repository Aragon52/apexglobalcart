import { createFileRoute } from "@tanstack/react-router";
import ResellerRegister from "@/pages/reseller/ResellerRegister";

export const Route = createFileRoute("/reseller/register")({
  head: () => ({
    meta: [
      { title: "Become a Verified Reseller Partner | Apex Global Cart" },
      {
        name: "description",
        content:
          "Register as an Apex Global Cart reseller partner today. Launch your custom online store with zero inventory risk, competitive margins, and automated logistics.",
      },
      { name: "robots", content: "index, follow" },
      { name: "googlebot", content: "index, follow" },
      { property: "og:title", content: "Become a Verified Reseller Partner | Apex Global Cart" },
      {
        property: "og:description",
        content: "Register as an Apex Global Cart reseller partner today. Launch your custom online shop with zero inventory risk.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://apexglobalonlineshop.com/reseller/register" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Apex Global Cart Reseller Portal" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
    ],
    links: [
      { rel: "canonical", href: "https://apexglobalonlineshop.com/reseller/register" },
    ],
  }),
  component: ResellerRegisterRoutePage,
});

function ResellerRegisterRoutePage() {
  return <ResellerRegister />;
}
