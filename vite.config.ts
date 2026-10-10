// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

const SUPABASE_REST = /^https:\/\/[a-z0-9]+\.supabase\.co\/rest\/v1\//;

export default defineConfig({
  // Pin the production artifact to the Netlify function used by netlify.toml.
  // Lovable builds override this to their configured Cloudflare preset.
  nitro: {
    preset: "netlify",
  },
  vite: {
    plugins: [
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        // Registration happens only in src/lib/pwa-register.ts.
        injectRegister: null,
        // Manifests are hand-maintained in /public (one per portal).
        manifest: false,
        filename: "sw.js",
        devOptions: { enabled: false },
        workbox: {
          globPatterns: ["**/*.{js,css,woff2,svg,png,ico}", "offline.html"],
          globIgnores: ["screenshots/**", "playstore/**", "badges/**", "images/**"],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              // Pages: always try the network first; fall back to cache, then the offline page.
              urlPattern: ({ request, url }) =>
                request.mode === "navigate" && !url.pathname.startsWith("/~oauth") && !url.pathname.startsWith("/api/"),
              handler: "NetworkFirst",
              options: {
                cacheName: "pages",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 40, maxAgeSeconds: 7 * 24 * 60 * 60 },
                plugins: [
                  {
                    handlerDidError: async () => (await caches.match("/offline.html")) ?? Response.error(),
                  },
                ],
              },
            },
            {
              // Product photos and other images.
              urlPattern: ({ request }) => request.destination === "image",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "images",
                expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Catalogue reads stay viewable offline.
              urlPattern: ({ url, request }) =>
                request.method === "GET" && SUPABASE_REST.test(url.href) && /\/rest\/v1\/(products|categories|seasonal_themes)/.test(url.pathname),
              handler: "NetworkFirst",
              method: "GET",
              options: {
                cacheName: "catalog-data",
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
                cacheableResponse: { statuses: [200] },
              },
            },
            {
              // Chat and support messages sent while offline are retried when the connection returns.
              urlPattern: ({ url }) =>
                SUPABASE_REST.test(url.href) && /\/rest\/v1\/(support_messages|reseller_chat_messages)/.test(url.pathname),
              handler: "NetworkOnly",
              method: "POST",
              options: {
                backgroundSync: { name: "message-outbox", options: { maxRetentionTime: 12 * 60 } },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        // Force React Email's parser onto entities v4.5.0 (v5+ removed lib/decode.js).
        "entities/lib/decode.js": path.resolve(process.cwd(), "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(process.cwd(), "node_modules/entities/lib/encode.js"),
      },
    },
    server: {
      allowedHosts: true,
    },
    optimizeDeps: {
      include: ["@tanstack/react-store", "@tanstack/react-router"],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    client: { entry: "client" },
  },
});
