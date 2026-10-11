// Adds the shared search and share tags (canonical, og:url, share image, Twitter card)
// to a public page's head, without overriding tags the page already sets.
export const SITE_ORIGIN = "https://apexglobalonlineshop.com";
export const SHOP_SHARE_IMAGE = `${SITE_ORIGIN}/brand/og-customer.png`;

type MetaTag = Record<string, string>;
interface PageHead {
  meta?: MetaTag[];
  links?: Array<Record<string, string>>;
  scripts?: Array<Record<string, string>>;
}

function hasTag(meta: MetaTag[], key: "name" | "property", value: string): boolean {
  return meta.some((m) => m[key] === value);
}

export function withPageSeo(path: string, head: PageHead, image: string = SHOP_SHARE_IMAGE): PageHead {
  const meta = [...(head.meta ?? [])];
  const url = `${SITE_ORIGIN}${path}`;
  const title = meta.find((m) => "title" in m)?.["title"];
  const description = meta.find((m) => m["name"] === "description")?.["content"];

  if (!hasTag(meta, "property", "og:url")) meta.push({ property: "og:url", content: url });
  if (!hasTag(meta, "property", "og:type")) meta.push({ property: "og:type", content: "website" });
  if (!hasTag(meta, "property", "og:site_name")) meta.push({ property: "og:site_name", content: "Apex Global Cart" });
  if (!hasTag(meta, "property", "og:image")) {
    meta.push(
      { property: "og:image", content: image },
      { property: "og:image:alt", content: title ?? "Apex Global Cart" },
    );
    if (image === SHOP_SHARE_IMAGE) {
      meta.push({ property: "og:image:width", content: "1200" }, { property: "og:image:height", content: "630" });
    }
  }
  if (!hasTag(meta, "name", "twitter:card")) meta.push({ name: "twitter:card", content: "summary_large_image" });
  if (!hasTag(meta, "name", "twitter:image")) meta.push({ name: "twitter:image", content: image });
  if (title && !hasTag(meta, "name", "twitter:title")) meta.push({ name: "twitter:title", content: title });
  if (description && !hasTag(meta, "name", "twitter:description")) meta.push({ name: "twitter:description", content: description });

  const links = [...(head.links ?? [])];
  if (!links.some((l) => l["rel"] === "canonical")) links.push({ rel: "canonical", href: url });

  return { ...head, meta, links };
}
