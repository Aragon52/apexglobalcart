// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Pin the production artifact to the Netlify function used by netlify.toml.
  // Lovable builds override this to their configured Cloudflare preset.
  nitro: {
    preset: "netlify",
  },
  vite: {
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
