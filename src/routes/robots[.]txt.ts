import { createFileRoute } from "@tanstack/react-router";

import { absoluteUrl } from "@/lib/site";

// ---------------------------------------------------------------------------
// GET /robots.txt
//
// Generira se iz koda, a ne kao statična datoteka u public/, da adresa
// sitemapa uvijek prati domenu postavljenu u src/lib/site.ts.
//
// Roboti AI modela navedeni su poimence i izričito dopušteni. Sve više
// odgovora ljudi dobivaju kroz ChatGPT, Claude, Perplexity i Google AI
// pregled umjesto kroz klasičnu listu rezultata, ako te robote blokiraš,
// tvoja tvrtka u tim odgovorima jednostavno ne postoji.
// ---------------------------------------------------------------------------

const AI_CRAWLERS = [
  "GPTBot", // OpenAI, ChatGPT
  "OAI-SearchBot", // OpenAI, pretraživanje unutar ChatGPT-a
  "ChatGPT-User", // OpenAI, dohvat stranice na zahtjev korisnika
  "ClaudeBot", // Anthropic, Claude
  "Claude-User",
  "PerplexityBot", // Perplexity
  "Perplexity-User",
  "Google-Extended", // Google Gemini / AI pregled
  "Applebot-Extended", // Apple Intelligence
  "meta-externalagent", // Meta AI
  "Bingbot", // Microsoft Bing / Copilot
  "DuckAssistBot",
];

const body = [
  "# robots.txt, Verdia",
  "",
  "User-agent: *",
  "Allow: /",
  "Disallow: /api/",
  "Disallow: /admin",
  "",
  "# Roboti AI asistenata i tražilica, izričito dopušteni",
  ...AI_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, "Allow: /", ""]),
  `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
  "",
].join("\n");

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
