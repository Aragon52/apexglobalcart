import { createFileRoute } from "@tanstack/react-router";
import ResellerLogin from "@/pages/reseller/ResellerLogin";

export const Route = createFileRoute("/reseller/login")({
  head: () => ({
    meta: [
      { title: "Reseller Partner Sign In | Apex Global Onlineshop" },
      {
        name: "description",
        content:
          "Sign in to your Apex Global Onlineshop reseller partner portal to manage your storefront, track product inventory, view earnings, and process orders.",
      },
      { name: "robots", content: "index, follow" },
      { name: "googlebot", content: "index, follow" },
      { property: "og:title", content: "Reseller Partner Sign In | Apex Global Onlineshop" },
      {
        property: "og:description",
        content: "Sign in to your Apex Global Onlineshop reseller partner portal to manage your storefront and earnings.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://apexglobalonlineshop.com/reseller/login" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://apexglobalonlineshop.com/reseller/login" },
    ],
  }),
  component: ResellerLoginRoutePage,
});

function ResellerLoginRoutePage() {
  return <ResellerLogin />;
}
