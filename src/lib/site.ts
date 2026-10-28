/**
 * Središnja konfiguracija stranice.
 *
 * Sve što je vezano uz posao (telefon, email, područja, usluge, pitanja)
 * stoji ovdje, a ne razbacano po komponentama. Isti podaci hrane tri stvari
 * odjednom, pa ostaju međusobno usklađeni:
 *
 *   1. vidljivi tekst na stranici       (src/routes/index.tsx)
 *   2. strukturirane podatke za Google  (src/lib/structured-data.ts)
 *   3. robots.txt, sitemap.xml, llms.txt (src/routes/)
 *
 * Google kažnjava nesklad između onoga što piše na stranici i onoga što
 * piše u strukturiranim podacima, pa je jedan izvor istine ovdje bitan.
 */

// ---------------------------------------------------------------------------
// ⚠️  PROMIJENI OVO KAD DOBIJEŠ DOMENU
//
// Bez točne domene canonical oznaka, sitemap i strukturirani podaci pokazuju
// na krivu adresu, pa Google može indeksirati pogrešan URL. Ovo je jedino
// mjesto koje treba promijeniti, bez "https://" na kraju kose crte.
//
// Na Cloudflareu se može postaviti i preko varijable okoline SITE_URL.
// ---------------------------------------------------------------------------
const FALLBACK_URL = "https://brickup.hr";

export const siteUrl = (
  typeof process !== "undefined" && process.env?.SITE_URL ? process.env.SITE_URL : FALLBACK_URL
).replace(/\/$/, "");

export const absoluteUrl = (path: string) =>
  `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;

export const business = {
  name: "Verdia",
  tagline: "Vaš dom, naš zanat.",
  phoneDisplay: "091 359 2825",
  phoneE164: "+385913592825",
  email: "brickupdoo@gmail.com",

  /**
   * WhatsApp. Broj u međunarodnom formatu, bez plusa i bez razmaka.
   * Za obrtnika je ovo najkorišteniji kanal jer kupac odmah može poslati
   * fotografiju prostora, a iz fotografije se cijena procijeni puno brže.
   */
  whatsappNumber: "385913592825",
  whatsappMessage: "Pozdrav, zainteresiran sam za ponudu. Molim kratki proračun.",

  // ⚠️  Radno vrijeme namjerno nije popunjeno, nemoj izmišljati podatak koji
  // Google prikazuje korisnicima. Kad znaš točne sate, upiši ih ovdje i
  // pojavit će se i na stranici i u strukturiranim podacima:
  //   openingHours: [{ days: ["Mo","Tu","We","Th","Fr"], opens: "08:00", closes: "18:00" }]
  openingHours: [] as Array<{ days: string[]; opens: string; closes: string }>,
};

/**
 * Pravna osoba koja stoji iza tvrtke Verdia: sklapa ugovore, izdaje račune i
 * odgovara klijentu za radove.
 *
 * ⚠️  POPUNI TOČNIM PODACIMA IZ SUDSKOG REGISTRA (sudreg.pravosudje.hr).
 * Zakon o elektroničkoj trgovini traži da stranica koja nudi usluge navede
 * puni naziv, sjedište, OIB i registar pružatelja usluge. Dok je `legalName`
 * prazan, stranica ne prikazuje ništa od ovoga i u podnožju i pravilima
 * privatnosti piše samo Verdia.
 */
export const company = {
  /** Puni naziv iz registra, npr. "Naziv d.o.o. za građevinske usluge" */
  legalName: "Verdia j.d.o.o.",
  /** Ulica, broj, poštanski broj i grad sjedišta */
  address: "Ivana Gundulića 5, 31431 Čepin",
  oib: "84729483121",
  /** Npr. "Trgovački sud u Zagrebu, MBS 080000000" */
  // Sjedište je u Čepinu, pa je nadležan Trgovački sud u Osijeku. MBS dopiši
  // kad ga provjeriš na sudreg.pravosudje.hr.
  registry: "Trgovački sud u Osijeku",
  /** Član uprave / direktor, navodi se na stranici s podacima o tvrtki. */
  director: "Zvonimir Kišurek",
};

export const hasCompany = company.legalName.trim() !== "";

/** Tko je voditelj obrade osobnih podataka iz obrasca. */
export const dataController = hasCompany ? company.legalName : business.name;

export const seo = {
  title: "Električar i majstori za Zagreb i Slavoniju | Verdia",
  description:
    "Električarski radovi, elektroinstalacije, gletanje, soboslikarstvo i kućni majstor za Zagreb i Slavoniju. Besplatna ponuda, odgovor u 24 sata. Nazovite 091 359 2825.",
  ogImage: "/og-image.jpg",
};

/** Grupe gradova, koriste se i u tekstu i u `areaServed` za Google. */
export const serviceAreas = [
  {
    region: "Zagreb i okolica",
    cities: ["Zagreb", "Sesvete", "Velika Gorica", "Samobor", "Zaprešić", "Dugo Selo"],
  },
  {
    region: "Slavonija",
    cities: [
      "Osijek",
      "Slavonski Brod",
      "Vinkovci",
      "Vukovar",
      "Đakovo",
      "Županja",
      "Našice",
      "Požega",
    ],
  },
];

export const allCities = serviceAreas.flatMap((area) => area.cities);

export type Service = {
  id: string;
  title: string;
  /**
   * Naziv u akuzativu, za rečenice tipa "Verdia izvodi ...".
   * Potrebno jer se hrvatski naziv usluge ne može ispravno umetnuti u
   * rečenicu bez sklanjanja ("izvodi električarski radovi" nije hrvatski).
   */
  accusative: string;
  /** Kratki opis na kartici usluge. */
  short: string;
  /** Duži opis, koristi se u strukturiranim podacima i u llms.txt. */
  long: string;
  /** Konkretni zahvati. Ovo je ono po čemu vas ljudi traže na Googleu. */
  items: string[];
  /** Mapa u public/images/ i prefiks imena datoteka. */
  folder: string;
  /** Broj slika u mapi, ispisuje ga `bun run images`. */
  imageCount: number;
  accentBg: string;
  accentFg: string;
};

export const services: Service[] = [
  {
    id: "elektroinstalacije",
    title: "Električarski radovi",
    accusative: "električarske radove",
    short:
      "Kompletne elektroinstalacije, adaptacije, zamjena osigurača, utičnica i prekidača, montaža rasvjete te otklanjanje kvarova. Izrađujemo i elektrotehničke projekte za sve vrste elektroinstalacija.",
    long: "Izvodimo nove elektroinstalacije i obnavljamo postojeće u stanovima, kućama i poslovnim prostorima na području Zagreba i Slavonije. Radimo zamjenu dotrajalih instalacija i razvodnih ormarića, ugradnju utičnica, prekidača i rasvjete te traženje i otklanjanje kvarova. Uz izvedbu izrađujemo i elektrotehničke projekte za sve vrste elektroinstalacija.",
    items: [
      "Nove elektroinstalacije u stanovima, kućama i poslovnim prostorima",
      "Zamjena starih instalacija i dotrajalih razvodnih ormarića",
      "Ugradnja i zamjena osigurača, utičnica i prekidača",
      "Montaža rasvjete: stropne, zidne, LED trake i vanjska rasvjeta",
      "Traženje i otklanjanje kvarova na instalaciji",
      "Priprema instalacije za kuhinju, klima-uređaj, bojler i perilicu",
      "Izrada elektrotehničkih projekata za sve vrste elektroinstalacija",
    ],
    folder: "struja",
    imageCount: 4,
    accentBg: "#DBEAFE",
    accentFg: "#2563EB",
  },
  {
    id: "gletanje",
    title: "Gletanje",
    accusative: "gletanje",
    short:
      "Gletanje zidova i stropova, glatka podloga spremna za boju, tapetu ili dekorativnu obradu.",
    long: "Gletamo zidove i stropove u novogradnji i kod renovacija. Prije gletanja saniramo pukotine i oštećenja, bandažiramo spojeve gips-kartonskih ploča, a nakon brušenja podloga je spremna za bojanje ili tapetu.",
    items: [
      "Gletanje novih i starih zidova i stropova",
      "Popravak pukotina, rupa i oštećenja prije gletanja",
      "Gletanje gips-kartonskih ploča i bandažiranje spojeva",
      "Brušenje i priprema podloge za bojanje",
      "Zaštita poda i namještaja te čišćenje nakon radova",
    ],
    folder: "gletanje",
    imageCount: 5,
    accentBg: "#EDE9FE",
    accentFg: "#7C3AED",
  },
  {
    id: "soboslikarstvo",
    title: "Soboslikarstvo",
    accusative: "soboslikarstvo",
    short:
      "Bojanje stanova, kuća i poslovnih prostora, dekorativni premazi i završna obrada zidova.",
    long: "Bojimo stanove, kuće, urede i poslovne prostore. Prostor prije početka zaštitimo, a nakon završetka očistimo za sobom. Uz standardno bojanje radimo i dekorativne premaze te ličenje stolarije i radijatora.",
    items: [
      "Bojanje zidova i stropova u stanovima i kućama",
      "Bojanje ureda, lokala i poslovnih prostora",
      "Dekorativni premazi i završne obrade",
      "Ličenje stolarije, ograda i radijatora",
      "Zaštita prostora prije i čišćenje nakon radova",
    ],
    folder: "soboslikarstvo",
    imageCount: 5,
    accentBg: "#FCE7F3",
    accentFg: "#DB2777",
  },
  {
    id: "podovi",
    title: "Laminat i vinil",
    accusative: "postavljanje laminata i vinila",
    short:
      "Postavljanje vinila i laminata u sve oblike i uzorke, na pripremljenoj i ravnoj podlozi.",
    long: "Postavljamo laminat i vinil u svim oblicima i uzorcima, u stanovima, kućama i poslovnim prostorima. Prije postave izravnavamo podlogu, a na kraju ugrađujemo letvice. Najčešće to radimo u istom terminu s gletanjem i bojanjem.",
    items: [
      "Postava laminata i vinila u sve oblike i uzorke",
      "Klasična, dijagonalna i postava riblja kost",
      "Izravnavanje podloge prije postave",
      "Ugradnja podnih letvica i prijelaznih profila",
      "Postava u stanovima, kućama i poslovnim prostorima",
    ],
    folder: "podovi",
    imageCount: 0,
    accentBg: "#FEF3C7",
    accentFg: "#D97706",
  },
  {
    id: "kucni-majstor",
    title: "Kućni majstor",
    accusative: "poslove kućnog majstora",
    short: "Sitni popravci i montaže koji se skupljaju mjesecima, riješeni u jednom dolasku.",
    long: "Preuzimamo sitne poslove za koje nemate vremena, alata ili volje: montažu namještaja, postavljanje polica i zavjesa, zamjenu brava i kvaka te ostale kućne zahvate. Više sitnih stvari rješavamo u jednom dolasku.",
    items: [
      "Montaža namještaja, polica i ormara",
      "Postavljanje zavjesa, karniša, slika i zrcala",
      "Zamjena brava, kvaka i šarki",
      "Popravci vrata, prozora i roleta",
      "Sitni zahvati po dogovoru, više stvari u jednom dolasku",
    ],
    folder: "majstor",
    imageCount: 3,
    accentBg: "#D1FAE5",
    accentFg: "#059669",
  },
];

/** Koraci suradnje, Google ih čita kao HowTo, ljudi kao "što me čeka". */
export const processSteps = [
  {
    title: "Javite nam posao",
    desc: "Ispunite obrazac ili nazovite i ukratko opišite što treba napraviti. Fotografija pomaže, ali nije obavezna.",
  },
  {
    title: "Javljamo se u 24 sata",
    desc: "Prolazimo detalje, po potrebi dolazimo pogledati prostor i dogovaramo opseg posla.",
  },
  {
    title: "Dobijete ponudu",
    desc: "Konkretan iznos po stavkama, unaprijed. Bez skrivenih troškova i naknadnih dodavanja.",
  },
  {
    title: "Izvodimo i čistimo za sobom",
    desc: "Radimo u dogovorenom terminu, prostor zaštitimo prije početka i očistimo nakon završetka.",
  },
];

/**
 * Pitanja i odgovori.
 *
 * Ovo je najvrjedniji dio stranice za tražilice i AI modele: odgovori su
 * napisani tako da se mogu citirati u cijelosti, bez dodatnog konteksta.
 * Svi odgovori drže se onoga što je već obećano drugdje na stranici
 * ako promijeniš uvjete poslovanja, promijeni i ove odgovore.
 */
export const faq = [
  {
    q: "Koja područja pokrivate?",
    a: "Radimo na dva područja: Zagreb s okolicom (Sesvete, Velika Gorica, Samobor, Zaprešić, Dugo Selo) te cijelu Slavoniju: Osijek, Slavonski Brod, Vinkovci, Vukovar, Đakovo, Županju, Našice i Požegu s okolnim mjestima. Ako niste sigurni pokrivamo li vašu lokaciju, nazovite i odmah ćemo reći.",
  },
  {
    q: "Koliko brzo se javljate na upit?",
    a: "Na upite poslane preko obrasca javljamo se unutar 24 sata. Ako vam se žuri, nazovite izravno na 091 359 2825.",
  },
  {
    q: "Je li ponuda besplatna?",
    a: "Da. Ponuda je besplatna i bez obveze. Javite nam vrstu posla, lokaciju i okvirnu kvadraturu i dobit ćete konkretan iznos prije nego što bilo što započnemo.",
  },
  {
    q: "Kako se određuje cijena radova?",
    a: "Cijena ovisi o kvadraturi, stanju podloge i količini pripremnih radova, pa iznos dajemo tek nakon opisa ili fotografija posla. U ponudi su sve stavke navedene unaprijed, bez naknadnog dodavanja troškova.",
  },
  {
    q: "Možete li preuzeti cijelu adaptaciju stana?",
    a: "Možemo. Kad se posao sastoji od više faza, od elektroinstalacija i gletanja do bojanja i sitnih radova, sve pokrivamo mi, u jednom dogovoru. Imate jednu osobu za kontakt i jedan raspored, a mi koordiniramo majstore za svaku fazu.",
  },
  {
    q: "Radite li i za tvrtke?",
    a: "Da. Radimo za privatne osobe koje renoviraju svoj dom i za tvrtke kojima treba pouzdan izvođač za veće ili ponavljajuće poslove u uredima i poslovnim prostorima.",
  },
  {
    q: "Nabavljate li vi materijal?",
    a: "Po dogovoru. Materijal možemo nabaviti i uračunati u ponudu ili raditi s materijalom koji ste sami odabrali.",
  },
  {
    q: "Dajete li jamstvo na radove?",
    a: "Da. Na sve izvedene radove odgovaramo 2 godine od predaje, kako propisuje Zakon o obveznim odnosima. Ako se u tom roku pojavi nedostatak zbog naše izvedbe, vraćamo se i popravljamo bez naplate.",
  },
  {
    q: "Koliko košta bojanje stana i postava novog poda?",
    a: "Za paket gletanje, bojanje i postava laminata ili vinila cijena kreće od oko 22 €/m² stambene površine, za rad bez materijala. Za stan od 60 m² to je okvirno 1.300 €. Točan iznos dobivate nakon pregleda prostora i nakon toga se ne mijenja.",
  },
  {
    q: "Postavljate li laminat i vinil?",
    a: "Da. Postavljamo laminat i vinil, izravnavamo podlogu prije postave i ugrađujemo letvice. Najčešće to radimo zajedno s gletanjem i bojanjem, u istom terminu, jer se prostor ionako mora isprazniti.",
  },
  {
    q: "Radite li i sitne poslove ili samo velike projekte?",
    a: "Radimo oboje. Jedna utičnica, montaža polica ili bojanje jedne sobe jednako su dobrodošli kao i kompletna adaptacija. Kod sitnih poslova više stvari rješavamo u istom dolasku kako se ne bi plaćao izlazak više puta.",
  },
];

/**
 * Jamstva.
 *
 * ⚠️  Ovo su obećanja kupcu, ne marketinški tekst. Objavi samo ono iza čega
 * stvarno stojiš, posebno rok jamstva. Ako promijeniš rok, promijeni ga i u
 * odgovoru "Dajete li jamstvo na radove?" niže u `faq`.
 */
export const guarantees = [
  {
    icon: "Receipt",
    title: "Fiksna cijena",
    desc: "Ono što dogovorimo prije početka, to i platite. Bez naknadnih doplata i bez naknadnog „iskrsnulo je nešto”.",
  },
  {
    icon: "ShieldCheck",
    title: "Jamstvo 2 godine",
    desc: "Na sve izvedene radove. Ako se u tom roku nešto pojavi zbog naše izvedbe, vraćamo se i popravljamo bez naplate.",
  },
  {
    icon: "Sparkles",
    title: "Čistimo za sobom",
    desc: "Prostor i namještaj zaštitimo prije početka, a na kraju očistimo i predajemo prostor spreman za korištenje.",
  },
];

/**
 * Paket soboslikarstvo i podovi.
 *
 * Bojanje i postava poda idu prirodno zajedno: pod se ionako mora zaštititi
 * ili zamijeniti kad se boji, pa kupac na jednom terminu dobije oboje umjesto
 * da dva puta prazni stan i dva puta čisti za majstorima.
 *
 * ⚠️  Cijena je PRIJEDLOG. Uskladi je sa svojim stvarnim cijenama prije objave
 * i pazi da odgovara iznosima u `faq`.
 */
export const flooringPackage = {
  title: "Soboslikarstvo i novi podovi u jednom terminu",
  lead: "Gletanje, bojanje i postava laminata ili vinila, jedan tim i jedan dogovor. Ne morate dva puta prazniti stan ni dva puta čistiti za majstorima.",
  steps: [
    "Zaštita prostora, namještaja i stolarije",
    "Gletanje, brušenje i priprema zidova",
    "Bojanje zidova i stropova u boji po vašem izboru",
    "Izravnavanje podloge i postava laminata ili vinila",
    "Ugradnja letvica, čišćenje i predaja prostora",
  ],
  duration: "4 do 7 dana",
  priceFrom: "22 €/m²",
  priceNote:
    "za stan do 60 m², rad bez materijala, ovisno o stanju zidova i vrsti poda koji odaberete",
};

export const navLinks = [
  { href: "#usluge", label: "Usluge" },
  { href: "#podovi", label: "Bojanje i podovi" },
  { href: "#kako-radimo", label: "Kako radimo" },
  { href: "#podrucja", label: "Područja" },
  { href: "#pitanja", label: "Pitanja" },
  { href: "#kontakt", label: "Kontakt" },
];
