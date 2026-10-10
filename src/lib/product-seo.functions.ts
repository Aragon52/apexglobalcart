import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export interface ProductSeo {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image: string | null;
  rating: number | null;
  in_stock: boolean | null;
  category: string | null;
}

// Public, read-only lookup of a product's search details (products are publicly readable).
export const getProductSeo = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => ({ id: String(input.id).slice(0, 100) }))
  .handler(async ({ data }): Promise<ProductSeo | null> => {
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
      const { data: row } = await client
        .from("products")
        .select("id, name, description, price, image, rating, in_stock, category")
        .eq("id", data.id)
        .maybeSingle();
      return (row as ProductSeo | null) ?? null;
    } catch {
      return null;
    }
  });
