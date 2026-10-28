import { createFileRoute, Link } from "@tanstack/react-router";

import { absoluteUrl, business, company } from "@/lib/site";

// ---------------------------------------------------------------------------
// /pravne-informacije
//
// Podaci o pružatelju usluge (Zakon o elektroničkoj trgovini, čl. 6.) i
// način podnošenja pisanog prigovora (Zakon o zaštiti potrošača, čl. 10.).
// Svi podaci dolaze iz `company` i `business` u src/lib/site.ts.
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/pravne-informacije")({
  head: () => ({
    meta: [
      { title: `Podaci o tvrtki i prigovori | ${business.name}` },
      {
        name: "description",
        content: `Podaci o tvrtki koja pruža usluge ${business.name}, jamstvo i način podnošenja prigovora.`,
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/pravne-informacije") }],
  }),
  component: LegalInfo,
});

function LegalInfo() {
  const rows: Array<[string, string]> = [
    ["Tvrtka", company.legalName],
    ["Sjedište", company.address],
    ["OIB", company.oib],
    ["Registar", company.registry],
    ["Direktor", company.director],
    ["Telefon", business.phoneDisplay],
    ["Email", business.email],
  ].filter(([, value]) => value) as Array<[string, string]>;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-xl font-extrabold tracking-tight">
            {business.name}
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Natrag na početnu
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Podaci o tvrtki i prigovori
        </h1>

        <div className="mt-10 space-y-8 leading-relaxed text-muted-foreground [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground">
          <section>
            <h2>Pružatelj usluge</h2>
            <p>
              {business.name} je naziv pod kojim posluje {company.legalName || business.name}
              {company.legalName.endsWith(".") ? "" : "."} Radove izvode registrirani obrtnici i
              tvrtke s kojima surađujemo, a za dogovor, ponudu i komunikaciju s vama odgovaramo mi.
            </p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="font-medium text-foreground">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2>Cijene</h2>
            <p>
              Cijene navedene na stranici su okvirne i služe za orijentaciju. Obvezujuća je pisana
              ponuda koju dobivate prije početka radova, s iznosom po stavkama.
            </p>
          </section>

          <section>
            <h2>Jamstvo</h2>
            <p>
              Za izvedene radove odgovaramo 2 godine od predaje. Ako se u tom roku pojavi nedostatak
              zbog izvedbe, vraćamo se i popravljamo ga bez naplate. Time se ne ograničavaju vaša
              prava iz Zakona o obveznim odnosima i Zakona o zaštiti potrošača.
            </p>
          </section>

          <section>
            <h2>Prigovori</h2>
            <p>
              Ako niste zadovoljni uslugom, pisani prigovor možete poslati emailom na{" "}
              <a className="text-foreground underline" href={`mailto:${business.email}`}>
                {business.email}
              </a>
              {company.address && ` ili poštom na adresu ${company.legalName}, ${company.address}`}.
              Primitak prigovora potvrđujemo bez odgađanja, a pisani odgovor šaljemo najkasnije u
              roku od 15 dana od primitka.
            </p>
          </section>

          <section>
            <h2>Privatnost</h2>
            <p>
              Kako postupamo s podacima iz obrasca opisano je u{" "}
              <Link to="/privatnost" className="text-foreground underline">
                pravilima privatnosti
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
