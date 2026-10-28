# --- vite.config.ts ---
@'
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(async ({ command }) => {
  const plugins = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    viteReact(),
  ];

  if (command === "build") {
    const { nitro } = await import("nitro/vite");
    plugins.push(nitro({ preset: "cloudflare-module" }));
  }

  return {
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
    css: { transformer: "lightningcss" },
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    server: { port: 3000 },
    plugins,
  };
});
'@ | Set-Content -Path "vite.config.ts" -Encoding UTF8

# --- package.json ---
@'
{
  "name": "brickup",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.8",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tailwindcss/vite": "^4.2.1",
    "@tanstack/react-query": "^5.101.1",
    "@tanstack/react-router": "^1.170.16",
    "@tanstack/react-start": "^1.168.26",
    "@tanstack/router-plugin": "^1.168.18",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.575.0",
    "react": "^19.2.0",
    "react-day-picker": "^9.14.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.71.2",
    "react-resizable-panels": "^4.6.5",
    "recharts": "^2.15.4",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.2.1",
    "tw-animate-css": "^1.3.4",
    "vaul": "^1.1.2",
    "vite-tsconfig-paths": "^6.0.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@types/node": "^22.16.5",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.2.0",
    "eslint": "^9.32.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "lightningcss": "^1.30.0",
    "nitro": "3.0.260603-beta",
    "prettier": "^3.7.3",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.56.1",
    "vite": "^8.0.16"
  }
}
'@ | Set-Content -Path "package.json" -Encoding UTF8

# --- bunfig.toml ---
@'
[install]
# 24h supply-chain guard: skip package versions published less than a day ago.
minimumReleaseAge = 86400
'@ | Set-Content -Path "bunfig.toml" -Encoding UTF8

# --- AGENTS.md ---
@'
# Verdia - agent notes

This is a TanStack Start (React) site for a craftsman/handyman business
serving Zagreb and Slavonia. See `README.md` for the file-based routing
conventions used in `src/routes/`.

Key pieces:

- `src/routes/index.tsx` - the single-page marketing site and lead form.
- `src/routes/api/contact.ts` - server route that validates and emails new
  leads via Resend. Requires the `RESEND_API_KEY` environment variable
  (see setup notes shared with this codebase).
- `src/server.ts` / `src/start.ts` - SSR error-handling wrapper so a crashed
  render returns a friendly HTML error page instead of a raw 500 response.

Deployment target is Cloudflare Workers (`nitro` with the
`cloudflare-module` preset, configured in `vite.config.ts`, build-only).
'@ | Set-Content -Path "AGENTS.md" -Encoding UTF8

# --- src/routes/__root.tsx ---
@'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Verdia - Vas dom, nas zanat. Majstori za Zagreb i Slavoniju" },
      { name: "description", content: "Keramika, gletanje, soboslikarstvo, struja i kucni majstor - tim majstora za Zagreb i Slavoniju." },
      { name: "author", content: "Verdia" },
      { property: "og:title", content: "Verdia - Vas dom, nas zanat." },
      { property: "og:description", content: "Tim majstora za zavrsne radove. Zagreb i Slavonija." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
'@ | Set-Content -Path "src\routes\__root.tsx" -Encoding UTF8

# --- src/routes/api/contact.ts ---
New-Item -ItemType Directory -Force -Path "src\routes\api" | Out-Null
@'
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const DEFAULT_NOTIFY_EMAIL = "brickupdoo@gmail.com";
const DEFAULT_FROM_EMAIL = "Verdia <onboarding@resend.dev>";

const leadSchema = z.object({
  ime: z.string().trim().min(2, "Unesite ime i prezime.").max(120),
  telefon: z.string().trim().min(6, "Unesite telefon.").max(30),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || z.string().email().safeParse(v).success, {
      message: "Email nije valjan.",
    }),
  grad: z.string().trim().min(2, "Odaberite grad.").max(60),
  vrsta: z.string().trim().min(2, "Odaberite vrstu posla.").max(60),
  opis: z.string().trim().min(5, "Opisite posao malo detaljnije.").max(2000),
  website: z.string().max(0).optional().or(z.literal("")),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function resolveEnvVar(name: string): Promise<string | undefined> {
  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return process.env[name];
  }
  try {
    const specifier = ["cloudflare", "workers"].join(":");
    const cf: any = await import(/* @vite-ignore */ specifier);
    return cf?.env?.[name];
  } catch {
    return undefined;
  }
}

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
        }

        const parsed = leadSchema.safeParse(payload);
        if (!parsed.success) {
          const firstIssue = parsed.error.issues[0]?.message ?? "Provjerite podatke u formi.";
          return Response.json({ ok: false, error: firstIssue }, { status: 400 });
        }
        const data = parsed.data;

        if (data.website) {
          return Response.json({ ok: true });
        }

        const apiKey = await resolveEnvVar("RESEND_API_KEY");
        if (!apiKey) {
          console.error("[api/contact] RESEND_API_KEY is not configured.");
          return Response.json(
            { ok: false, error: "Slanje trenutno nije dostupno. Nazovite nas izravno." },
            { status: 500 },
          );
        }

        const toEmail = (await resolveEnvVar("LEAD_NOTIFY_EMAIL")) || DEFAULT_NOTIFY_EMAIL;
        const fromEmail = (await resolveEnvVar("LEAD_FROM_EMAIL")) || DEFAULT_FROM_EMAIL;

        const subject = "Novi upit - " + data.vrsta + " (" + data.grad + ")";
        const html = "<h2 style=\"font-family:sans-serif\">Novi upit s Verdia stranice</h2>" +
          "<table style=\"font-family:sans-serif;font-size:14px;border-collapse:collapse\">" +
          "<tr><td style=\"padding:4px 12px 4px 0\"><strong>Ime i prezime</strong></td><td>" + escapeHtml(data.ime) + "</td></tr>" +
          "<tr><td style=\"padding:4px 12px 4px 0\"><strong>Telefon</strong></td><td>" + escapeHtml(data.telefon) + "</td></tr>" +
          "<tr><td style=\"padding:4px 12px 4px 0\"><strong>Email</strong></td><td>" + escapeHtml(data.email ?? "-") + "</td></tr>" +
          "<tr><td style=\"padding:4px 12px 4px 0\"><strong>Grad</strong></td><td>" + escapeHtml(data.grad) + "</td></tr>" +
          "<tr><td style=\"padding:4px 12px 4px 0\"><strong>Vrsta posla</strong></td><td>" + escapeHtml(data.vrsta) + "</td></tr>" +
          "</table>" +
          "<p style=\"font-family:sans-serif;font-size:14px\"><strong>Opis posla:</strong></p>" +
          "<p style=\"font-family:sans-serif;font-size:14px\">" + escapeHtml(data.opis).replace(/\n/g, "<br/>") + "</p>";

        try {
          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: "Bearer " + apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [toEmail],
              reply_to: data.email || undefined,
              subject,
              html,
            }),
          });

          if (!resendRes.ok) {
            const errBody = await resendRes.text();
            console.error("[api/contact] Resend error:", resendRes.status, errBody);
            return Response.json(
              { ok: false, error: "Slanje nije uspjelo. Nazovite nas izravno." },
              { status: 502 },
            );
          }
        } catch (err) {
          console.error("[api/contact] Failed to reach Resend:", err);
          return Response.json(
            { ok: false, error: "Slanje nije uspjelo. Nazovite nas izravno." },
            { status: 502 },
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
'@ | Set-Content -Path "src\routes\api\contact.ts" -Encoding UTF8

# --- ukloni stari Lovable fajl ---
Remove-Item -Path "src\lib\lovable-error-reporting.ts" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Gotovo! Sad jos treba zamijeniti src\routes\index.tsx (slijedi u sljedecoj poruci - taj fajl je velik)."
