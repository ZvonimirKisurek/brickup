import { createFileRoute } from "@tanstack/react-router";

import { publishedPosts } from "@/lib/blog";
import { absoluteUrl, business, faq, seo, serviceAreas, services, siteUrl } from "@/lib/site";

// ---------------------------------------------------------------------------
// GET /llms.txt
//
// llms.txt je nastajući dogovor (llmstxt.org): kratak, čist Markdown sažetak
// stranice namijenjen jezičnim modelima. Model koji ga pročita ne mora
// pogađati činjenice iz HTML-a punog oznaka i stilova, nego dobiva gotov
// odgovor na "tko su, što rade, gdje rade i kako ih se zove".
//
// Nije službeni standard i Google ga ne koristi za rangiranje, ali košta
// jednu datoteku, a povećava šansu da AI asistent kod pitanja tipa
// "trebam električara u Zagrebu" navede baš ovu tvrtku.
// ---------------------------------------------------------------------------

const body = `# ${business.name}

> ${seo.description}

${business.name} je tim od više od 5 majstora koji izvodi električarske radove i završne obrte za privatne
osobe i tvrtke na području Zagreba i Slavonije. Radove izvode provjereni registrirani majstori, a klijent ima jednu osobu za kontakt.

## Kontakt

- Telefon: ${business.phoneDisplay} (${business.phoneE164})
- Email: ${business.email}
- Web: ${siteUrl}
- Jezik poslovanja: hrvatski

## Usluge

${services
  .map(
    (service) => `### ${service.title}

${service.long}

${service.items.map((item) => `- ${item}`).join("\n")}`,
  )
  .join("\n\n")}

## Područja rada

${serviceAreas.map((area) => `- **${area.region}:** ${area.cities.join(", ")}`).join("\n")}

## Kako do ponude

Upit se šalje kroz obrazac na ${siteUrl}/#kontakt ili pozivom na ${business.phoneDisplay}.
Ponuda je besplatna i bez obveze, a odgovor stiže unutar 24 sata.

## Članci

${publishedPosts.map((post) => `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)}): ${post.description}`).join("\n")}

## Česta pitanja

${faq.map((entry) => `**${entry.q}**\n\n${entry.a}`).join("\n\n")}
`;

export const Route = createFileRoute("/llms.txt")({
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
