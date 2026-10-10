import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layout/MainLayout";
import ProductDetail from "@/pages/ProductDetail";
import { getProductSeo } from "@/lib/product-seo.functions";

const SITE = "Apex Global Cart";

export const Route = createFileRoute("/products/$id")({
  loader: async ({ params }) => {
    try {
      return { product: await getProductSeo({ data: { id: params.id } }) };
    } catch {
      return { product: null };
    }
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product ?? null;
    const title = p ? `${p.name} | ${SITE}` : `Product details & customer reviews | ${SITE}`;
    const summary = p?.description
      ? p.description.replace(/\s+/g, " ").trim().slice(0, 155)
      : p
        ? `Buy ${p.name} from verified reseller stores on ${SITE}, with secure checkout and worldwide delivery.`
        : `View product details, verified customer reviews and specifications on ${SITE}.`;
    const image = p?.image && /^https:\/\//.test(p.image) ? p.image : null;

    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: summary },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { property: "og:title", content: title },
      { property: "og:description", content: summary },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (image) {
      meta.push({ property: "og:image", content: image }, { name: "twitter:image", content: image });
    }

    const scripts = p
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: p.name,
              description: summary,
              ...(image ? { image } : {}),
              ...(p.category ? { category: p.category } : {}),
              ...(p.price != null
                ? {
                    offers: {
                      "@type": "Offer",
                      price: Number(p.price).toFixed(2),
                      priceCurrency: "USD",
                      availability: p.in_stock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                    },
                  }
                : {}),
            }),
          },
        ]
      : [];

    return { meta, scripts };
  },
  component: ProductsIdRoutePage,
});

function ProductsIdRoutePage() {
  return <MainLayout><ProductDetail /></MainLayout>;
}
