# Verdia — agent notes

This is a TanStack Start (React) site for a craftsman/handyman business
serving Zagreb and Slavonia. See `README.md` for the file-based routing
conventions used in `src/routes/`.

Key pieces:

- `src/lib/site.ts` — **single source of truth** for every business fact:
  phone, email, services, service areas, FAQ, and the canonical site URL.
  Page copy, structured data and the SEO routes all read from here, so a
  detail changed in one place stays consistent everywhere. Change business
  facts here, not in the components.
- `src/lib/structured-data.ts` — schema.org JSON-LD (`LocalBusiness`/
  `Electrician`, `Service`, `FAQPage`, `HowTo`, `WebSite`, `WebPage`),
  injected via the route's `script:ld+json` meta entry.
- `src/routes/index.tsx` — the single-page marketing site and lead form.
- `src/routes/api/contact.ts` — server route that validates and emails new
  leads via Resend. Requires the `RESEND_API_KEY` environment variable
  (see `.env.example`). The `website` field is a honeypot: the schema must
  stay permissive so the handler can drop spam silently with a fake 200.
- `src/routes/admin.tsx` — internal founders' panel (Dugovi, Troškovnik,
  Portfolio, Kalendar), served on `admin.<domain>` (`src/server.ts` redirects that
  subdomain's root to `/admin`). Tables are defined once in `src/lib/admin.ts`
  (drives both the UI and server validation) and in
  `supabase/migrations/`; data goes through `src/routes/api/admin/*` to
  Supabase with the service role key. Kalendar reads both founders' Google
  Calendars read-only via their secret iCal URLs (`GCAL_ICS_*`,
  `src/lib/server/calendar.ts`). Login is `ADMIN_USERNAME` (default
  `admin`) + `ADMIN_PASSWORD`. Needs `ADMIN_PASSWORD`,
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. The 20 % founders' share
  rule and founder names live in `FOUNDERS` / `FOUNDERS_SHARE`.
- `src/routes/robots[.]txt.ts`, `sitemap[.]xml.ts`, `llms[.]txt.ts` —
  generated rather than static so they always track the configured domain.
  The `[.]` in the filename is TanStack's escape for a literal dot.
- `src/server.ts` / `src/start.ts` — SSR error-handling wrapper so a crashed
  render returns a friendly HTML error page instead of a raw 500 response.
- `scripts/optimize-images.mjs` (`bun run images`) — converts raw photos
  dropped into `public/images/<folder>/` to WebP (full + thumb), renames
  them to `<folder>-<n>`, and moves the originals to `original-images/`.
  Update the matching `imageCount` in `src/lib/site.ts` afterwards.

Copy is Croatian; keep the diacritics. Business claims on the page (24-hour
response, free quote, 2-year warranty) are mirrored in the FAQ and JSON-LD
— if the terms change, change all three.

Deployment target is Cloudflare Workers (`nitro` with the
`cloudflare-module` preset, configured in `vite.config.ts`, build-only).
