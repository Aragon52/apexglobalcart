import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import VerificationCompliance from "@/pages/VerificationCompliance";

export const Route = createFileRoute("/verification-compliance")({
  head: () => ({
    meta: [
      { title: "Verification & Compliance | Apex Global Onlineshop" },
      { name: "description", content: "Learn how Apex Global Onlineshop verifies sellers, reviews orders and payments, and protects marketplace trust." },
      { property: "og:title", content: "Verification & Compliance | Apex Global Onlineshop" },
      { property: "og:description", content: "Learn how Apex Global Onlineshop protects marketplace trust and safety." },
    ],
  }),
  component: () => <MainLayout><VerificationCompliance /></MainLayout>,
});
