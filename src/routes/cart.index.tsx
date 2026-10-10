import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import Cart from "@/pages/Cart";

export const Route = createFileRoute("/cart/")({
  head: () => ({
    meta: [
      { title: "Cart — User portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: CartRoutePage,
});

function CartRoutePage() {
  return <MainLayout><Cart /></MainLayout>;
}
