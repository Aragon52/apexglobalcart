import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/reseller/$")({
  head: () => ({
    meta: [
      { title: "Reseller Portal — Apex Global Onlineshop" },
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
