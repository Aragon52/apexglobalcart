import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import ContactUs from "@/pages/ContactUs";

export const Route = createFileRoute("/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact Us | Apex Global Cart Online Shop" },
      { name: "description", content: "Contact 24/7 customer support and the official corporate desk at Apex Global Cart International Pte. Ltd." },
      { property: "og:title", content: "Contact Us | Apex Global Cart Online Shop" },
      { property: "og:description", content: "24/7 customer support and corporate inquiry desk for Apex Global Cart." },
    ],
  }),
  component: () => (
    <MainLayout>
      <ContactUs />
    </MainLayout>
  ),
});
