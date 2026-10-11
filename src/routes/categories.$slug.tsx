import { createFileRoute } from "@tanstack/react-router";
import { withPageSeo } from "@/lib/page-seo";
import MainLayout from "@/components/layout/MainLayout";
import CategoryDetail from "@/pages/CategoryDetail";

function categoryName(slug: string): string {
  return decodeURIComponent(slug)
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const Route = createFileRoute("/categories/$slug")({
  head: ({ params }) => {
    const name = categoryName(params.slug);
    const title = `${name} — Shop deals & new arrivals | Apex Global Cart`;
    const description = `Shop top rated ${name.toLowerCase()} products, new arrivals and special promotions from verified reseller stores on Apex Global Cart.`;
    return withPageSeo(`/categories/${params.slug}`, {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${name} | Apex Global Cart`,
            description,
          }),
        },
      ],
    });
  },
  component: CategoriesSlugRoutePage,
});

function CategoriesSlugRoutePage() {
  return <MainLayout><CategoryDetail /></MainLayout>;
}
