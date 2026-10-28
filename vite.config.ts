import { defineConfig, type UserConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Plain Vite config — no third-party wrapper. Reproduces the same behaviour
// the project used to get from its previous build-tool wrapper:
//   - Tailwind v4 (via @tailwindcss/vite)
//   - "@/..." path alias resolved to ./src
//   - TanStack Start, with the custom SSR error-wrapper entry (src/server.ts)
//   - Nitro, targeting Cloudflare Workers, but only during `vite build`
//     (kept out of `vite dev` so local dev stays fast and plain-Node)
export default defineConfig(async ({ command }) => {
  const plugins = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Keep using src/server.ts as the SSR entry (it wraps h3's error
      // handling so a crashed SSR render returns a friendly error page
      // instead of a raw 500 JSON blob).
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    viteReact(),
  ];

  if (command === "build") {
    // Imported lazily so a plain `vite dev` never needs the `nitro`
    // package loaded at all.
    const { nitro } = await import("nitro/vite");
    plugins.push(
      nitro({
        preset: "cloudflare-module",
        // Ime Workera na Cloudflareu, mora se poklapati s imenom projekta u
        // Workers & Pages (Workers Builds odbija deploy ako se razlikuju).
        // keep_vars: deploy ne briše varijable postavljene na dashboardu.
        cloudflare: { wrangler: { name: "brickup", keep_vars: true } },
      }),
    );
  }

  // Eksplicitni tip: bez njega TypeScript "transformer" proširi u obični
  // string, pa defineConfig ne prepozna nijedno preopterećenje (TS2769).
  const config: UserConfig = {
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    // Build uses Lightning CSS; matching it in dev keeps local preview
    // consistent with the production CSS output.
    css: { transformer: "lightningcss" },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    server: { port: 3000 },
    plugins,
  };

  return config;
});
