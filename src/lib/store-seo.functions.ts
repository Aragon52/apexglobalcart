import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export interface StoreSeo {
  shopName: string;
  logo: string | null;
  banner: string | null;
  level: string | null;
  rating: number | null;
}

// Public, read-only lookup of a shop's public details for search and share previews.
export const getStoreSeo = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug).slice(0, 120) }))
  .handler(async ({ data }): Promise<StoreSeo | null> => {
    const url = process.env["SUPABASE_URL"];
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
    if (!url || !key) return null;
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    try {
      const { data: rows } = await client.rpc("get_public_reseller_profile", { _key: data.slug });
      const row = Array.isArray(rows) ? rows[0] : null;
      if (!row?.shop_name) return null;
      return {
        shopName: row.shop_name,
        logo: row.shop_logo ?? null,
        banner: row.shop_hero_banner ?? null,
        level: row.level ?? null,
        rating: row.star_rating != null ? Number(row.star_rating) : null,
      };
    } catch {
      return null;
    }
  });
