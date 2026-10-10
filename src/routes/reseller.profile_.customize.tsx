import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import ResellerShopCustomization from "@/pages/reseller/ResellerShopCustomization";

export const Route = createFileRoute("/reseller/profile_/customize")({
  head: () => ({
    meta: [
      { title: "Profile_ customize — User portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: ResellerProfileCustomizeRoutePage,
});

function ResellerProfileCustomizeRoutePage() {
  return <ResellerLayout><ResellerShopCustomization /></ResellerLayout>;
}
