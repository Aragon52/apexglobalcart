import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import AboutUs from "@/pages/AboutUs";

export const Route = createFileRoute("/about-us")({
  head: () => ({
    meta: [
      { title: "About Us | Apex Global Onlineshop Online Shop" },
      { name: "description", content: "Corporate profile, registration credentials, and security standards for Apex Global Onlineshop International Pte. Ltd." },
      { property: "og:title", content: "About Us | Apex Global Onlineshop Online Shop" },
      { property: "og:description", content: "Learn about Apex Global Onlineshop International Pte. Ltd. (GCOS) and our verified marketplace standards." },
    ],
  }),
  component: () => (
    <MainLayout>
      <AboutUs />
    </MainLayout>
  ),
});
