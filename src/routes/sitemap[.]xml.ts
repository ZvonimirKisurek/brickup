import { createFileRoute } from "@tanstack/react-router";

import { publishedPosts } from "@/lib/blog";
import { absoluteUrl, seo, siteUrl } from "@/lib/site";

// ---------------------------------------------------------------------------
// GET /sitemap.xml
//
// Stranica je jednostranična, pa je sitemap kratak, ali ga Google Search
// Console traži i preko njega prati kada je sadržaj zadnji put mijenjan.
// Slike su navedene kroz image-sitemap proširenje kako bi fotografije radova
// mogle završiti u Google Slikama.
//
// Nakon objave: prijavi adresu sitemapa u Google Search Console
// (Sitemaps → dodaj "sitemap.xml").
// ---------------------------------------------------------------------------

const lastmod = new Date().toISOString().slice(0, 10);

const images = [{ loc: absoluteUrl(seo.ogImage), caption: "Verdia, radovi na stanu" }];

const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
${images
  .map(
    (image) => `    <image:image>
      <image:loc>${image.loc}</image:loc>
      <image:caption>${image.caption}</image:caption>
    </image:image>`,
  )
  .join("\n")}
  </url>
  <url>
    <loc>${absoluteUrl("/blog")}</loc>
    <lastmod>${publishedPosts[0]?.updated ?? publishedPosts[0]?.date ?? lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
${publishedPosts
  .map(
    (post) => `  <url>
    <loc>${absoluteUrl(`/blog/${post.slug}`)}</loc>
    <lastmod>${post.updated ?? post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join("\n")}
  <url>
    <loc>${absoluteUrl("/pravne-informacije")}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>${absoluteUrl("/privatnost")}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
</urlset>
`;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
