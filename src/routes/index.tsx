import { createFileRoute, redirect } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import HomePage from "@/pages/Index";
import { detectPortal } from "@/lib/subdomain";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const portal = detectPortal();
    if (portal === "reseller") {
      throw redirect({ to: "/reseller/dashboard" });
    }
    if (portal === "admin") {
      throw redirect({ to: "/admin" });
    }
  },
  head: () => ({
    meta: [
      { title: "Apex Global Onlineshop - Simplified and Enhanced Commerce System for Everyone Everything Everywhere" },
      {
        name: "description",
        content:
          "Shop electronics, fashion, home, beauty and sports from verified reseller stores on Apex Global Onlineshop, with secure checkout and worldwide delivery.",
      },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { property: "og:title", content: "Apex Global Onlineshop - Simplified and Enhanced Commerce System for Everyone Everything Everywhere" },
      {
        property: "og:description",
        content:
          "Shop electronics, fashion, home, beauty and sports from verified reseller stores on Apex Global Onlineshop, with secure checkout and worldwide delivery.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://apexglobalonlineshop.com/" },
      { property: "og:image", content: "https://apexglobalonlineshop.com/brand/og-customer.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://apexglobalonlineshop.com/brand/og-customer.png" },
    ],
    links: [
      { rel: "canonical", href: "https://apexglobalonlineshop.com/" },
    ],
  }),
  component: HomeRoutePage,
});

function HomeRoutePage() {
  return <MainLayout><HomePage /></MainLayout>;
}
