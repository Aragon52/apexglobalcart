import { createFileRoute } from "@tanstack/react-router";
import ResellerLayout from "@/components/reseller/ResellerLayout";
import AdBoostService from "@/pages/reseller/AdBoostService";

export const Route = createFileRoute("/reseller/ad-boost")({
  head: () => ({
    meta: [
      { title: "Ad boost — User portal — Apex Global Cart" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),
  component: ResellerAdBoostRoutePage,
});

function ResellerAdBoostRoutePage() {
  return <ResellerLayout><AdBoostService /></ResellerLayout>;
}
