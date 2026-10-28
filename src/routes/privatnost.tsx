import { createFileRoute, Link } from "@tanstack/react-router";

import { absoluteUrl, business, company, dataController, hasCompany } from "@/lib/site";

// ---------------------------------------------------------------------------
// /privatnost
//
// Pravila privatnosti za obrazac s upitom. Obrazac prikuplja ime, telefon,
// email, grad i opis posla, pa GDPR traži da posjetitelj zna tko te podatke
// dobiva, zašto i koliko dugo se čuvaju.
//
// ⚠️  Ako dodaš Google Analytics ili drugo mjerenje s kolačićima, ovaj tekst
// i stranica trebaju i obavijest o kolačićima. Plausible kolačiće ne koristi.
// ---------------------------------------------------------------------------

const updated = "8. listopada 2026.";

export const Route = createFileRoute("/privatnost")({
  head: () => ({
    meta: [
      { title: `Pravila privatnosti | ${business.name}` },
      {
        name: "description",
        content: `Kako ${business.name} koristi podatke poslane kroz obrazac za upit.`,
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privatnost") }],
  }),
  component: Privacy,
});

function Privacy() {
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
          Pravila privatnosti
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Zadnja izmjena: {updated}</p>

        <div className="mt-10 space-y-8 leading-relaxed text-muted-foreground [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground">
          <section>
            <h2>Tko obrađuje vaše podatke</h2>
            <p>
              Voditelj obrade je {dataController}
              {hasCompany && company.address && `, ${company.address}`}
              {hasCompany && company.oib && `, OIB ${company.oib}`}. Za sva pitanja o vašim podacima
              pišite na{" "}
              <a className="text-foreground underline" href={`mailto:${business.email}`}>
                {business.email}
              </a>{" "}
              ili nazovite {business.phoneDisplay}.
            </p>
          </section>

          <section>
            <h2>Koje podatke prikupljamo</h2>
            <p>
              Kroz obrazac za upit: ime i prezime, broj telefona, email adresu (ako je upišete),
              grad, vrstu posla i opis posla. Ako nam se javite telefonom ili preko WhatsAppa,
              vidimo vaš broj i ono što nam pošaljete, uključujući fotografije prostora.
            </p>
          </section>

          <section>
            <h2>Zašto ih koristimo</h2>
            <p>
              Isključivo da bismo vam se javili, procijenili posao i poslali ponudu, a ako je
              prihvatite, da bismo izveli radove i izdali račun. Pravna osnova je poduzimanje radnji
              na vaš zahtjev prije sklapanja ugovora i izvršenje ugovora (članak 6. stavak 1. točka
              b) Opće uredbe o zaštiti podataka). Podatke ne prodajemo, ne koristimo za oglašavanje
              i ne šaljemo vam newsletter.
            </p>
          </section>

          <section>
            <h2>Tko još vidi podatke</h2>
            <p>
              Majstor koji izvodi vaš posao dobiva podatke potrebne za dolazak i izvođenje (ime,
              telefon, adresu i opis posla). Tehnički, upit putuje preko pružatelja usluge slanja
              emaila (Resend) i pružatelja smještaja stranice (Cloudflare), koji podatke obrađuju
              samo u naše ime.
            </p>
          </section>

          <section>
            <h2>Koliko dugo ih čuvamo</h2>
            <p>
              Upite koji nisu završili ugovorom brišemo najkasnije 12 mjeseci nakon zadnjeg
              kontakta. Ako izvedemo posao, podatke s računa i ugovora čuvamo onoliko koliko to
              traže porezni i računovodstveni propisi.
            </p>
          </section>

          <section>
            <h2>Vaša prava</h2>
            <p>
              Možete zatražiti uvid u svoje podatke, njihov ispravak ili brisanje te ograničenje
              obrade. Dovoljno je javiti se na gornju email adresu. Ako smatrate da su vaši podaci
              obrađeni protivno propisima, možete podnijeti prigovor Agenciji za zaštitu osobnih
              podataka (azop.hr).
            </p>
          </section>

          <section>
            <h2>Kolačići</h2>
            <p>
              Stranica ne postavlja kolačiće i ne koristi alate za praćenje ni oglašavanje. Fontovi
              i slike poslužuju se s naše domene, pa se pri posjetu ne šalju podaci trećim stranama.
              Ako kliknete na WhatsApp, otvara se aplikacija tvrtke Meta i na nju se primjenjuju
              njihova pravila privatnosti.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
