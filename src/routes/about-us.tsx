import { createFileRoute } from "@tanstack/react-router";
import { withPageSeo } from "@/lib/page-seo";
import MainLayout from "@/components/layout/MainLayout";
import AboutUs from "@/pages/AboutUs";

export const Route = createFileRoute("/about-us")({
  head: () => withPageSeo("/about-us", {
    meta: [
      { title: "About Us | Apex Global Cart Online Shop" },
      { name: "description", content: "Corporate profile, registration credentials, and security standards for Apex Global Cart International Pte. Ltd." },
      { property: "og:title", content: "About Us | Apex Global Cart Online Shop" },
      { property: "og:description", content: "Learn about Apex Global Cart International Pte. Ltd.  and our verified marketplace standards." },
    ],
  }),
  component: () => (
    <MainLayout>
      <AboutUs />
    </MainLayout>
  ),
});
