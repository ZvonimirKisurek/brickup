/**
 * Strukturirani podaci (JSON-LD, schema.org).
 *
 * Ovo je dio koji tražilice i AI modeli čitaju umjesto da pogađaju iz teksta:
 * tko ste, što radite, gdje radite i kako vas se kontaktira. Google iz toga
 * gradi bogate rezultate (zvjezdice, pitanja, podaci o tvrtki), a jezični
 * modeli iz istog zapisa izvlače činjenice kad ih netko pita za majstora u
 * Zagrebu ili Slavoniji.
 *
 * Sve vrijednosti dolaze iz src/lib/site.ts kako bi zapis i vidljivi tekst
 * uvijek govorili isto, nesklad između to dvoje Google tretira kao signal
 * nepovjerenja.
 *
 * Provjera nakon objave: https://search.google.com/test/rich-results
 */

import type { BlogPost } from "./blog";
import {
  absoluteUrl,
  business,
  company,
  faq,
  hasCompany,
  processSteps,
  seo,
  serviceAreas,
  services,
  siteUrl,
} from "./site";

const BUSINESS_ID = `${siteUrl}/#business`;
const WEBSITE_ID = `${siteUrl}/#website`;
const WEBPAGE_ID = `${siteUrl}/#webpage`;

const areaServed = serviceAreas.flatMap((area) =>
  area.cities.map((city) => ({
    "@type": "City",
    name: city,
    address: { "@type": "PostalAddress", addressLocality: city, addressCountry: "HR" },
  })),
);

const openingHoursSpecification = business.openingHours.map((slot) => ({
  "@type": "OpeningHoursSpecification",
  dayOfWeek: slot.days,
  opens: slot.opens,
  closes: slot.closes,
}));

const serviceNodes = services.map((service) => ({
  "@type": "Service",
  "@id": `${siteUrl}/#usluga-${service.id}`,
  name: service.title,
  serviceType: service.title,
  description: service.long,
  provider: { "@id": BUSINESS_ID },
  areaServed,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: `${service.title}, pojedinačni radovi`,
    itemListElement: service.items.map((item) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: item },
    })),
  },
}));

/**
 * Glavni zapis stranice. Sve je u jednom @graph-u i povezano preko @id-jeva,
 * pa Google vidi jednu tvrtku s više usluga umjesto nekoliko nepovezanih
 * zapisa koji se natječu međusobno.
 */
export const homePageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Electrician i HousePainter su schema.org podvrste LocalBusinessa
      // konkretnija vrsta daje bolji rezultat za "električar Zagreb" nego
      // generički LocalBusiness.
      "@type": ["LocalBusiness", "Electrician", "HousePainter"],
      "@id": BUSINESS_ID,
      name: business.name,
      description: seo.description,
      slogan: business.tagline,
      ...(hasCompany && {
        legalName: company.legalName,
        ...(company.oib && { taxID: company.oib }),
      }),
      url: siteUrl,
      telephone: business.phoneE164,
      email: business.email,
      image: absoluteUrl(seo.ogImage),
      logo: absoluteUrl("/icon-512.png"),
      // Sjedište tvrtke iz company; pokrivenost područja ide kroz areaServed.
      address: {
        "@type": "PostalAddress",
        addressCountry: "HR",
        addressLocality: "Čepin",
        postalCode: "31431",
        streetAddress: "Ivana Gundulića 5",
      },
      areaServed,
      knowsLanguage: ["hr"],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: business.phoneE164,
        email: business.email,
        contactType: "customer service",
        areaServed: "HR",
        availableLanguage: ["Croatian"],
      },
      ...(openingHoursSpecification.length > 0 ? { openingHoursSpecification } : {}),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Usluge",
        itemListElement: services.map((service) => ({
          "@type": "Offer",
          itemOffered: { "@id": `${siteUrl}/#usluga-${service.id}` },
        })),
      },
    },
    ...serviceNodes,
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: siteUrl,
      name: business.name,
      inLanguage: "hr-HR",
      publisher: { "@id": BUSINESS_ID },
    },
    {
      "@type": "WebPage",
      "@id": WEBPAGE_ID,
      url: siteUrl,
      name: seo.title,
      description: seo.description,
      inLanguage: "hr-HR",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": BUSINESS_ID },
      primaryImageOfPage: absoluteUrl(seo.ogImage),
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#pitanja`,
      inLanguage: "hr-HR",
      isPartOf: { "@id": WEBPAGE_ID },
      mainEntity: faq.map((entry) => ({
        "@type": "Question",
        name: entry.q,
        acceptedAnswer: { "@type": "Answer", text: entry.a },
      })),
    },
    {
      "@type": "HowTo",
      "@id": `${siteUrl}/#kako-radimo`,
      name: "Kako do ponude i izvedbe radova",
      description: "Četiri koraka od upita do gotovog posla kod tvrtke Verdia, za Zagreb i Slavoniju.",
      inLanguage: "hr-HR",
      step: processSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.desc,
      })),
    },
  ],
};

/** JSON-LD za članak: BlogPosting + BreadcrumbList (+ FAQPage ako članak ima pitanja). */
export const blogPostJsonLd = (post: BlogPost) => {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        url,
        mainEntityOfPage: url,
        inLanguage: "hr-HR",
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        keywords: post.keywords.join(", "),
        image: absoluteUrl(seo.ogImage),
        author: { "@id": BUSINESS_ID },
        publisher: { "@id": BUSINESS_ID },
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": `${siteUrl}/#usluga-${post.service}` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: business.name, item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
      ...(post.faq?.length
        ? [
            {
              "@type": "FAQPage",
              inLanguage: "hr-HR",
              mainEntity: post.faq.map((entry) => ({
                "@type": "Question",
                name: entry.q,
                acceptedAnswer: { "@type": "Answer", text: entry.a },
              })),
            },
          ]
        : []),
    ],
  };
};
