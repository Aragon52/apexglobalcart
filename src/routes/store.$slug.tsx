import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import ResellerStorefront from "@/pages/ResellerStorefront";
import { withPageSeo } from "@/lib/page-seo";
import { getStoreSeo } from "@/lib/store-seo.functions";

const ROBOTS = "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";

export const Route = createFileRoute("/store/$slug")({
  loader: async ({ params }) => {
    try {
      return { store: await getStoreSeo({ data: { slug: params.slug } }) };
    } catch {
      return { store: null };
    }
  },
  head: ({ params, loaderData }) => {
    const s = loaderData?.store ?? null;
    const title = s ? `${s.shopName} — Verified reseller store | Apex Global Cart` : "Verified Reseller Storefront | Apex Global Cart";
    const description = s
      ? `Shop products from ${s.shopName}, a verified reseller store on Apex Global Cart, with secure checkout and worldwide delivery.`
      : "Shop exclusive collections, authentic brands, and verified inventory directly from this independent reseller partner store on Apex Global Cart.";
    const pick = (u: string | null) => (u && /^https:\/\//.test(u) ? u : null);
    const image = pick(s?.banner ?? null) ?? pick(s?.logo ?? null);
    const scripts = s
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: s.shopName,
              url: `https://apexglobalonlineshop.com/store/${params.slug}`,
              ...(pick(s.logo) ? { logo: pick(s.logo) } : {}),
              parentOrganization: { "@type": "Organization", name: "Apex Global Cart", url: "https://apexglobalonlineshop.com" },
            }),
          },
        ]
      : [];
    return withPageSeo(
      `/store/${params.slug}`,
      {
        meta: [
          { title },
          { name: "description", content: description },
          { name: "robots", content: s ? ROBOTS : "noindex, follow" },
          { property: "og:title", content: title },
          { property: "og:description", content: description },
          { property: "og:type", content: "website" },
        ],
        scripts,
      },
      image ?? undefined,
    );
  },
  component: StoreSlugRoutePage,
});

function StoreSlugRoutePage() {
  return <MainLayout><ResellerStorefront /></MainLayout>;
}
