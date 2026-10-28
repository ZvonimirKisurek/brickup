import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  PaintBucket,
  Brush,
  Zap,
  Wrench,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Users,
  ClipboardCheck,
  Building2,
  ShieldCheck,
  Receipt,
  Sparkles,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  absoluteUrl,
  allCities,
  business,
  company,
  faq,
  hasCompany,
  flooringPackage,
  guarantees,
  navLinks,
  processSteps,
  seo,
  serviceAreas,
  services,
  siteUrl,
} from "@/lib/site";
import { homePageJsonLd } from "@/lib/structured-data";
import { track } from "@/lib/track";

/** Predpripremljen wa.me link, isti se koristi na svim mjestima na stranici. */
const whatsappHref = `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
  business.whatsappMessage,
)}`;

const guaranteeIcons: Record<string, LucideIcon> = {
  ShieldCheck,
  Receipt,
  Sparkles,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: seo.title },
      { name: "description", content: seo.description },
      // Ključne riječi kao meta oznaka Google ignorira od 2009., ali ih neki
      // manji tražilice i AI alati i dalje čitaju, jeftino je ostaviti.
      {
        name: "keywords",
        content: [
          "električar Zagreb",
          "električar Slavonija",
          "elektroinstalacije Zagreb",
          "gletanje Zagreb",
          "soboslikarstvo Zagreb",
          "postavljanje laminata Zagreb",
          "postavljanje vinila",
          "kućni majstor Zagreb",
          "majstor Osijek",
          "adaptacija stana",
        ].join(", "),
      },
      { property: "og:title", content: seo.title },
      { property: "og:description", content: seo.description },
      { property: "og:url", content: siteUrl },
      { property: "og:image", content: absoluteUrl(seo.ogImage) },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Majstor tvrtke Verdia tijekom radova na stanu",
      },
      { name: "twitter:title", content: seo.title },
      { name: "twitter:description", content: seo.description },
      { name: "twitter:image", content: absoluteUrl(seo.ogImage) },
      // TanStack pretvara ovo u <script type="application/ld+json"> u <head>.
      { "script:ld+json": homePageJsonLd },
    ],
    links: [
      { rel: "canonical", href: siteUrl },
    ],
  }),
  component: Index,
});

/** Ikone se drže odvojeno od podataka u site.ts da konfiguracija ostane čisti tekst. */
const serviceIcons: Record<string, LucideIcon> = {
  elektroinstalacije: Zap,
  gletanje: PaintBucket,
  soboslikarstvo: Brush,
  podovi: Layers,
  "kucni-majstor": Wrench,
};

const reasons = [
  {
    icon: Users,
    title: "Tim, ne pojedinac",
    desc: "Tim od više od 5 ljudi i jedan dogovor, pa posao ide brže nego kad sami slažete raspored nekoliko obrtnika.",
  },
  {
    icon: MapPin,
    title: "Pokrivamo dvije regije",
    desc: "Zagreb s okolicom i cijela Slavonija. Dolazak dogovaramo odmah, bez čekanja tjednima.",
  },
  {
    icon: Building2,
    title: "Stan ili poslovni prostor",
    desc: "Od jedne utičnice i sobe do kompletne adaptacije stana ili uređenja poslovnog prostora.",
  },
  {
    icon: ClipboardCheck,
    title: "Jasna ponuda unaprijed",
    desc: "Iznos po stavkama prije početka radova. Bez skrivenih troškova i iznenađenja na kraju.",
  },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-baseline gap-0.5 font-display font-extrabold tracking-tight ${className}`}
    >
      <span>Verdi</span>
      <span className="relative">
        a
        <ArrowUpRight className="absolute -top-3 -right-3 text-brand" strokeWidth={3} size={16} />
      </span>
    </div>
  );
}

function Index() {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      ime: String(data.get("ime") ?? ""),
      telefon: String(data.get("telefon") ?? ""),
      email: String(data.get("email") ?? ""),
      grad: String(data.get("grad") ?? ""),
      vrsta: String(data.get("vrsta") ?? ""),
      opis: String(data.get("opis") ?? ""),
      website: String(data.get("website") ?? ""),
    };
    track("form_submit", { vrsta: payload.vrsta, grad: payload.grad });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.ok) {
        const message = result?.error || "Slanje nije uspjelo. Pokušajte ponovno ili nas nazovite.";
        setFormError(message);
        toast.error("Greška", { description: message });
        track("form_error");
        return;
      }
      toast.success("Upit poslan", { description: "Hvala! Javljamo se u najkraćem mogućem roku." });
      track("form_success");
      form.reset();
    } catch {
      const message =
        "Nismo se mogli spojiti na server. Pokušajte ponovno ili nas nazovite telefonom.";
      setFormError(message);
      toast.error("Greška", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 font-sans text-foreground md:pb-0">
      <Toaster richColors position="top-center" />

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="text-xl text-foreground" aria-label="Verdia, početak stranice">
            <Logo />
          </a>
          <nav
            className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex"
            aria-label="Glavna navigacija"
          >
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </a>
            ))}
          </nav>
          {/* Na mobitelu nema navigacije (premalo mjesta za šest poveznica),
              pa poziv na akciju mora ostati vidljiv, to je jedini gumb u
              zaglavlju na malom ekranu. */}
          <a
            href="#kontakt"
            className="inline-flex shrink-0 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground transition hover:brightness-95 sm:px-4 sm:text-sm"
          >
            Besplatna ponuda
          </a>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section
          id="top"
          className="relative overflow-hidden bg-secondary text-secondary-foreground"
        >
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-brand) 1px, transparent 1px), linear-gradient(90deg, var(--color-brand) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
            aria-hidden
          />
          <div
            className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-20 md:pt-28 md:pb-28">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wider text-white/70 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Zagreb &amp; Slavonija
              </p>
              {/* Jedan H1 na stranici, s glavnim pojmom i lokacijom, to je
                  najjači signal tražilici o čemu je stranica. */}
              <h1 className="mt-5 font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                Električarski radovi i završni obrti{" "}
                <span className="text-brand">za Zagreb i Slavoniju</span>
              </h1>
              <p className="mt-5 font-display text-xl font-bold tracking-tight text-white/90">
                {business.tagline}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                Kompletne elektroinstalacije, adaptacije, rasvjeta i zamjena osigurača, gletanje,
                soboslikarstvo i usluge kućnog majstora, sve od jednog tima. Besplatna ponuda,
                odgovor na upit unutar 24 sata.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#kontakt"
                  className="group inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-bold text-brand-foreground shadow-lg shadow-black/20 transition hover:brightness-95"
                >
                  Zatraži besplatnu ponudu
                  <ArrowUpRight
                    size={18}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
                <a
                  href={`tel:${business.phoneE164}`}
                  onClick={() => track("call_click", { location: "hero" })}
                  className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3.5 text-sm font-semibold text-white hover:bg-white/5"
                >
                  <Phone size={16} /> {business.phoneDisplay}
                </a>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-white/55">
                Najbrže do cijene: pošaljite nam par fotografija prostora na WhatsApp. Iz
                fotografije i kvadrature u pravilu možemo dati okvirnu cijenu još isti dan.
              </p>
            </div>
            <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {services.map((service) => {
                const Icon = serviceIcons[service.id];
                return (
                  <li
                    key={service.id}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ background: service.accentBg }}
                    >
                      <Icon size={16} style={{ color: service.accentFg }} strokeWidth={2.2} />
                    </span>
                    <span className="text-sm font-medium text-white/85">{service.title}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* USLUGE */}
        <section id="usluge" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold tracking-wider text-brand uppercase">Usluge</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                Što radimo
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Pet područja, jedan dogovor. Provjerene majstore koordiniramo mi, a vi imate jednu
              osobu za kontakt od ponude do predaje.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:[&>article:last-child:nth-child(odd)]:col-span-2">
            {services.map((service) => {
              const Icon = serviceIcons[service.id];
              return (
                <article
                  key={service.id}
                  id={`usluga-${service.id}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-7 transition hover:border-brand hover:shadow-lg"
                >
                  <div
                    className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full transition"
                    style={{ background: service.accentBg }}
                  >
                    <Icon size={22} style={{ color: service.accentFg }} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-tight">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.short}
                  </p>
                  {/* Konkretni zahvati, a ne općeniti opis: po ovim pojmovima
                      ljudi zapravo pretražuju ("zamjena osigurača", "bandažiranje"). */}
                  <ul className="mt-5 space-y-2">
                    {service.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2.5 text-sm leading-relaxed text-foreground"
                      >
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-brand"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <p className="mx-auto mt-10 max-w-3xl rounded-lg border border-dashed border-border bg-muted/40 p-5 text-center text-sm text-foreground sm:text-base">
            Radimo u timu, što znači brže izvođenje i manje stresa za vas, bez čekanja na nekoliko
            majstora redom. Vaše vrijeme i živci previše su vrijedni da bi se trošili na
            usklađivanje obrtnika; taj dio preuzimamo mi.
          </p>
        </section>

        {/* BOJANJE I PODOVI */}
        <section id="podovi" className="bg-secondary py-20 text-secondary-foreground md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold tracking-wider text-brand uppercase">
                Paket usluga
              </p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
                {flooringPackage.title}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/75">{flooringPackage.lead}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#kontakt"
                  className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-bold text-brand-foreground transition hover:brightness-95"
                >
                  Zatraži ponudu za stan <ArrowUpRight size={18} />
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click", { location: "podovi" })}
                  className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3.5 text-sm font-semibold text-white hover:bg-white/5"
                >
                  Pošalji fotografije na WhatsApp
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-white/10 pb-5">
                <div>
                  <div className="text-xs tracking-wider text-white/50 uppercase">Cijena od</div>
                  <div className="font-display text-3xl font-extrabold text-brand sm:text-4xl">
                    {flooringPackage.priceFrom}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs tracking-wider text-white/50 uppercase">Trajanje</div>
                  <div className="font-display text-2xl font-extrabold">
                    {flooringPackage.duration}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/60">{flooringPackage.priceNote}</p>

              <ol className="mt-6 space-y-3">
                {flooringPackage.steps.map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 font-display text-xs font-extrabold text-brand">
                      {i + 1}
                    </span>
                    <span className="text-sm text-white/85">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* KAKO RADIMO */}
        <section id="kako-radimo" className="bg-muted/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-sm font-semibold tracking-wider text-brand uppercase">Kako radimo</p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Od upita do gotovog posla u četiri koraka
            </h2>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step, index) => (
                <li key={step.title} className="rounded-xl border border-border bg-card p-6">
                  <span className="font-display text-3xl font-extrabold text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* PODRUČJA */}
        <section id="podrucja" className="bg-muted/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-sm font-semibold tracking-wider text-brand uppercase">
              Područja rada
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Gdje sve dolazimo
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Pokrivamo dvije regije. Ako vaše mjesto nije na popisu, a u blizini je nekog od
              navedenih gradova, svejedno nazovite jer najvjerojatnije dolazimo.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {serviceAreas.map((area) => (
                <div key={area.region} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
                    <MapPin size={18} className="text-brand" strokeWidth={2.4} aria-hidden />
                    {area.region}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {area.cities.map((city) => (
                      <li
                        key={city}
                        className="rounded-full border border-border bg-muted/60 px-3 py-1 text-sm text-foreground"
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* O NAMA */}
        <section id="o-nama" className="py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-5 md:items-center">
            <div className="md:col-span-3">
              <p className="text-sm font-semibold tracking-wider text-brand uppercase">O nama</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                Tim kojem možete vjerovati
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Verdia je tim od više od 5 majstora koji pokriva Zagreb i Slavoniju. Radimo i za privatne osobe
                koje renoviraju svoj dom, i za tvrtke koje trebaju pouzdanog izvođača za veće
                projekte.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Naš pristup je jednostavan:{" "}
                <strong className="font-semibold text-foreground">
                  dogovoreno, na vrijeme, uredno
                </strong>
                , bez skrivenih troškova i bez priča. Prostor prije radova zaštitimo, a nakon
                završetka očistimo za sobom.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:col-span-2">
              {[
                { k: "24 h", l: "odgovor na upit" },
                { k: "2 god.", l: "jamstvo na radove" },
                { k: "2", l: "regije pokrivamo" },
                { k: "Tim", l: "ne pojedinac" },
              ].map((stat) => (
                <div key={stat.l} className="rounded-xl border border-border bg-card p-5">
                  <div className="font-display text-3xl font-extrabold text-brand sm:text-4xl">
                    {stat.k}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ZAŠTO */}
        <section id="zasto" className="bg-muted/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-sm font-semibold tracking-wider text-brand uppercase">
              Zašto Verdia
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Zašto ljudi biraju nas
            </h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {reasons.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-5 rounded-xl border border-border bg-card p-6">
                  <div className="relative shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-brand">
                      <Icon size={22} strokeWidth={2.2} aria-hidden />
                    </div>
                    <CheckCircle2
                      size={16}
                      className="absolute -right-1 -bottom-1 rounded-full bg-background text-brand"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* JAMSTVA */}
        <section id="jamstva" className="border-y border-border bg-muted/40 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-sm font-semibold tracking-wider text-brand uppercase">
              Naša jamstva
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              Tri stvari na koje se možete osloniti
            </h2>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {guarantees.map((g) => {
                const Icon = guaranteeIcons[g.icon] ?? ShieldCheck;
                return (
                  <div key={g.title} className="rounded-xl border border-border bg-card p-6">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                      <Icon size={21} strokeWidth={2.2} aria-hidden />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold tracking-tight">
                      {g.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{g.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PITANJA */}
        <section id="pitanja" className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5">
            <p className="text-sm font-semibold tracking-wider text-brand uppercase">
              Česta pitanja
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Ono što nas najčešće pitaju
            </h2>
            {/* Native <details> namjerno umjesto JS akordeona: odgovori su u
                HTML-u i kad se skripta ne izvrši, pa ih tražilice i AI modeli
                pročitaju bez obzira na JavaScript. */}
            <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
              {faq.map((entry) => (
                <details
                  key={entry.q}
                  className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-4">
                    <h3 className="font-display text-base font-bold tracking-tight sm:text-lg">
                      {entry.q}
                    </h3>
                    <span
                      className="mt-0.5 shrink-0 text-brand transition group-open:rotate-45"
                      aria-hidden
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {entry.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* KONTAKT */}
        <section id="kontakt" className="bg-secondary py-20 text-secondary-foreground md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-sm font-semibold tracking-wider text-brand uppercase">Kontakt</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                Zatražite ponudu danas
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/75">
                Javite nam vrstu posla i lokaciju, a javljamo se unutar 24 sata s konkretnom
                ponudom. Ponuda je besplatna i ni na što vas ne obvezuje.
              </p>
              <div className="mt-8 space-y-3">
                <a
                  href={`tel:${business.phoneE164}`}
                  onClick={() => track("call_click", { location: "kontakt" })}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-brand"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground">
                    <Phone size={18} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs tracking-wider text-white/50 uppercase">
                      Telefon
                    </span>
                    <span className="block font-semibold">{business.phoneDisplay}</span>
                  </span>
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click", { location: "kontakt" })}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-brand"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#25D366] text-white">
                    <WhatsAppGlyph size={19} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs tracking-wider text-white/50 uppercase">
                      WhatsApp
                    </span>
                    <span className="block font-semibold">Pošaljite fotografije prostora</span>
                  </span>
                </a>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-brand"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground">
                    <Mail size={18} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs tracking-wider text-white/50 uppercase">
                      Email
                    </span>
                    <span className="block truncate font-semibold">{business.email}</span>
                  </span>
                </a>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-white p-6 text-foreground sm:p-8 lg:col-span-3"
            >
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                }}
                aria-hidden="true"
              >
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ime i prezime" required>
                  <input
                    name="ime"
                    required
                    autoComplete="name"
                    className="form-input"
                    placeholder="Ivan Horvat"
                  />
                </Field>
                <Field label="Telefon" required>
                  <input
                    name="telefon"
                    required
                    type="tel"
                    autoComplete="tel"
                    className="form-input"
                    placeholder="091 234 5678"
                  />
                </Field>
                <Field label="Email" hint="opcionalno">
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="form-input"
                    placeholder="vas@email.com"
                  />
                </Field>
                <Field label="Grad" required>
                  <select name="grad" required className="form-input" defaultValue="">
                    <option value="" disabled>
                      Odaberite grad
                    </option>
                    {allCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                    <option value="Ostalo">Ostalo</option>
                  </select>
                </Field>
                <Field label="Vrsta posla" required className="sm:col-span-2">
                  <select name="vrsta" required className="form-input" defaultValue="">
                    <option value="" disabled>
                      Odaberite vrstu posla
                    </option>
                    {services.map((service) => (
                      <option key={service.id} value={service.title}>
                        {service.title}
                      </option>
                    ))}
                    <option value="Više usluga / adaptacija">Više usluga / adaptacija</option>
                    <option value="Ostalo">Ostalo</option>
                  </select>
                </Field>
                <Field label="Opis posla" required className="sm:col-span-2">
                  <textarea
                    name="opis"
                    required
                    rows={4}
                    className="form-input resize-none"
                    placeholder="Ukratko opišite što treba napraviti, kvadraturu i rok ako imate."
                  />
                </Field>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-bold text-brand-foreground transition hover:brightness-95 disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Šaljem..." : "Pošalji upit"}
                <ArrowUpRight size={18} aria-hidden />
              </button>
              {formError && <p className="mt-3 text-sm font-medium text-red-600">{formError}</p>}
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Podatke iz obrasca koristimo samo za odgovor na vaš upit i izradu ponude. Više u{" "}
                <Link to="/privatnost" className="underline hover:text-foreground">
                  pravilima privatnosti
                </Link>
                .
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="grid gap-6 sm:grid-cols-3 sm:items-center">
            <div>
              <Logo className="text-lg" />
              <p className="mt-2 text-sm text-muted-foreground">
                {business.tagline} Zagreb &amp; Slavonija.
              </p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground sm:text-center">
              <div>
                Telefon:{" "}
                <a
                  className="text-foreground hover:text-brand"
                  href={`tel:${business.phoneE164}`}
                  onClick={() => track("call_click", { location: "footer" })}
                >
                  {business.phoneDisplay}
                </a>
              </div>
              <div>
                Email:{" "}
                <a className="text-foreground hover:text-brand" href={`mailto:${business.email}`}>
                  {business.email}
                </a>
              </div>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground sm:text-right">
              <p>
                © {new Date().getFullYear()} {business.name}. Sva prava pridržana.
              </p>
              <p>
                <Link to="/privatnost" className="hover:text-foreground">
                  Pravila privatnosti
                </Link>
                {" · "}
                <Link to="/pravne-informacije" className="hover:text-foreground">
                  Podaci o tvrtki i prigovori
                </Link>
              </p>
            </div>
          </div>
          {/* Podaci o pružatelju usluge, obvezni po Zakonu o elektroničkoj
              trgovini. Prikazuju se tek kad se popuni `company` u site.ts. */}
          {hasCompany && (
            <p className="mt-8 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
              {business.name} je usluga tvrtke {company.legalName}
              {company.address && `, ${company.address}`}
              {company.oib && `, OIB ${company.oib}`}
              {company.registry && `, ${company.registry}`}. Radove izvode registrirani obrtnici i
              tvrtke s kojima surađujemo.
            </p>
          )}
          {/* Popis usluga i gradova u podnožju: dodatni tekstualni signal
              tražilici o opsegu posla i pokrivenosti. */}
          <p className="mt-8 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            {business.name} izvodi{" "}
            {services
              .slice(0, -1)
              .map((s) => s.accusative)
              .join(", ")}{" "}
            i {services[services.length - 1].accusative} na području gradova: {allCities.join(", ")}{" "}
            i okolnih mjesta.
          </p>
        </div>
      </footer>

      <StickyBar />
      <WhatsAppBubble />
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-brand">*</span>}
        {hint && <span className="text-xs font-normal text-muted-foreground">({hint})</span>}
      </span>
      {children}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  WhatsApp                                                                   */
/* -------------------------------------------------------------------------- */

function WhatsAppGlyph({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488" />
    </svg>
  );
}

/**
 * Plutajući WhatsApp gumb, samo na desktopu.
 * Na mobitelu bi stajao točno preko gumba "Pošalji upit" u obrascu, pa je
 * tamo WhatsApp dio donje trake (StickyBar).
 */
function WhatsAppBubble() {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("whatsapp_click", { location: "bubble" })}
      title="Pošalji poruku na WhatsApp"
      aria-label="Pošalji poruku na WhatsApp"
      className="group fixed right-5 bottom-5 z-40 hidden items-center rounded-full bg-[#25D366] px-4 text-white shadow-lg shadow-black/25 transition-colors hover:bg-[#1FA855] md:flex"
    >
      <span className="flex h-14 items-center">
        <WhatsAppGlyph size={28} />
      </span>
      <span className="max-w-0 overflow-hidden text-sm font-bold whitespace-nowrap opacity-0 transition-all duration-300 group-hover:ml-3 group-hover:max-w-40 group-hover:opacity-100">
        Pišite nam
      </span>
    </a>
  );
}

/**
 * Donja traka na mobitelu.
 * Na malim ekranima nema navigacije, a poziv je za obrtnika najvrjedniji
 * kanal, pa Nazovi i WhatsApp moraju biti nadohvat palca cijelo vrijeme.
 */
function StickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-px border-t border-border bg-border md:hidden">
      <a
        href={`tel:${business.phoneE164}`}
        onClick={() => track("call_click", { location: "sticky_bar" })}
        className="flex items-center justify-center gap-2 bg-brand py-4 text-sm font-bold text-brand-foreground"
      >
        <Phone size={17} aria-hidden /> Nazovi
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("whatsapp_click", { location: "sticky_bar" })}
        className="flex items-center justify-center gap-2 bg-[#25D366] py-4 text-sm font-bold text-white"
      >
        <WhatsAppGlyph size={17} /> WhatsApp
      </a>
    </div>
  );
}
