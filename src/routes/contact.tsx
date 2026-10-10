import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import ContactUs from "@/pages/ContactUs";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Apex Global Onlineshop Online Shop" },
      { name: "description", content: "Contact 24/7 customer support and the official corporate desk at Apex Global Onlineshop International Pte. Ltd." },
      { property: "og:title", content: "Contact Us | Apex Global Onlineshop Online Shop" },
      { property: "og:description", content: "24/7 customer support and corporate inquiry desk for Apex Global Onlineshop." },
    ],
  }),
  component: () => (
    <MainLayout>
      <ContactUs />
    </MainLayout>
  ),
});
