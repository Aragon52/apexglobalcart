import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/reseller/$")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Reseller Portal — Apex Global Cart" },
      { property: "og:description", content: "Run your own online shop with Apex Global Cart: pick products, manage orders and grow your earnings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Apex Global Cart Reseller Portal" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-reseller.png" },
      { title: "Reseller Portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  beforeLoad: ({ params }) => {
    const splat = (params as any)?._splat || "";
    if (splat.startsWith("store/") || splat === "store") {
      throw redirect({ to: `/${splat}` });
    }
    throw redirect({ to: "/reseller/login" });
  },
});
