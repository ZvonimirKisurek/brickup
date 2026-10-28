// ---------------------------------------------------------------------------
// Blog (skriven od navigacije, ali indeksiran)
//
// Stranice /blog i /blog/<slug> nisu povezane iz izbornika ni iz podnožja,
// ali su u sitemapu, u llms.txt i otvorene za tražilice i AI robote. Služe
// za dugi rep pretraga ("koliko košta zamjena instalacije u stanu Zagreb").
//
// Kako dodati članak: dodaj novi objekt na VRH niza `posts`. Svaki članak
// mora imati:
//   slug         - dio adrese, bez dijakritika i razmaka (/blog/<slug>)
//   title        - H1 i naslov u pretraživanju, do ~60 znakova, s ključnom riječi
//   description  - 140–160 znakova, to Google prikazuje ispod naslova
//   date         - "YYYY-MM-DD"; `updated` dodaj kad bitno izmijeniš tekst
//   keywords     - ključne riječi za članak
//   service      - id usluge iz site.ts (služi za poveznicu na uslugu)
//   content      - blokovi: h2, p, ul. Prvi odlomak neka odmah odgovori na pitanje
//                  iz naslova, tako AI asistenti i Google izdvajaju odgovor.
//   faq          - (nije obavezno) pitanja i odgovori, idu i u FAQPage JSON-LD
//   draft        - true = članak se ne objavljuje (ni na stranici ni u sitemapu)
//
// Pišite samo ono što je točno i što stvarno radite. Ne izmišljajte cijene,
// rokove ni reference: Google i AI modeli uspoređuju tekst s ostatkom stranice.
// ---------------------------------------------------------------------------

export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  keywords: string[];
  service: string;
  content: BlogBlock[];
  faq?: Array<{ q: string; a: string }>;
  draft?: boolean;
};

export const posts: BlogPost[] = [
  {
    slug: "kada-obnoviti-elektroinstalaciju-u-stanu",
    title: "Kada obnoviti elektroinstalaciju u stanu: 7 znakova",
    description:
      "Kako prepoznati da je stara elektroinstalacija u stanu ili kući dotrajala i kada je vrijeme za obnovu. Znakovi upozorenja i što napraviti.",
    date: "2026-10-26",
    keywords: [
      "obnova elektroinstalacije",
      "zamjena elektroinstalacije stan",
      "električar Zagreb",
      "električar Slavonija",
    ],
    service: "elektroinstalacije",
    content: [
      {
        type: "p",
        text: "Elektroinstalaciju u stanu ili kući treba obnoviti kad se osigurači često isključuju, utičnice i prekidači se griju, vodiči su stari ili nema uzemljenja, a na instalaciju je priključeno puno više uređaja nego što je bila predviđena. Stare instalacije nisu projektirane za današnju potrošnju, a kvar na njima može završiti i požarom.",
      },
      { type: "h2", text: "Znakovi da je instalacija dotrajala" },
      {
        type: "ul",
        items: [
          "Osigurači ili automatski prekidači često ispadaju bez očitog razloga.",
          "Utičnice, prekidači ili razvodna kutija griju se ili mirišu na zagorjelo.",
          "Svjetla titraju ili slabe kad se uključi veći potrošač.",
          "Utičnice nemaju uzemljenje (nema zaštitnog vodiča), a u kuhinji i kupaonici nema zaštitne strujne sklopke.",
          "Stan ima premalo utičnica pa se koriste produžni kabeli i razdjelnici.",
          "Izolacija vodiča je napukla, tvrda ili se mrvi.",
          "Instalacija je stara nekoliko desetljeća, a nikad nije pregledana ni obnavljana.",
        ],
      },
      { type: "h2", text: "Što napraviti" },
      {
        type: "p",
        text: "Prvi korak je pregled instalacije i razvodnog ormarića. Električar provjerava stanje vodiča, uzemljenje, zaštitne sklopke i opterećenje pojedinih strujnih krugova. Nakon toga se dogovara obim radova: od zamjene ormarića i pojedinih strujnih krugova do kompletne nove instalacije.",
      },
      {
        type: "p",
        text: "Najpovoljnije vrijeme za obnovu je prije gletanja i bojanja jer se zidovi ionako otvaraju. Zato radove električara, gletanje i bojanje isplati dogovoriti zajedno.",
      },
    ],
    faq: [
      {
        q: "Koliko traje obnova elektroinstalacije u stanu?",
        a: "Trajanje ovisi o veličini stana, stanju zidova i obimu radova. Točan rok dobivate uz ponudu nakon pregleda prostora.",
      },
      {
        q: "Mora li se pri obnovi instalacije otvarati zidove?",
        a: "Kod kompletne zamjene vodiča najčešće da, jer se nove cijevi i kabeli polažu u zidove. Za zamjenu ormarića, osigurača ili pojedinih utičnica to u pravilu nije potrebno.",
      },
    ],
  },
  {
    slug: "laminat-ili-vinil-sto-odabrati",
    title: "Laminat ili vinil: što odabrati za pod u stanu",
    description:
      "Usporedba laminata i vinila: otpornost na vodu, izdržljivost, izgled i priprema podloge. Pomoć pri odabiru poda za stan, kuću ili poslovni prostor.",
    date: "2026-10-26",
    keywords: [
      "laminat ili vinil",
      "postavljanje laminata Zagreb",
      "postavljanje vinila",
      "pod u stanu",
    ],
    service: "podovi",
    content: [
      {
        type: "p",
        text: "Vinil je bolji izbor za prostore s vlagom, kao što su kuhinja, hodnik i kupaonica, jer ne nabrekne od vode. Laminat je tvrđi pod koji dobro podnosi svakodnevno hodanje i često je povoljniji, ali ga treba držati suhim. Za dnevne i spavaće sobe oba su dobar izbor, pa odluku najčešće donose izgled, proračun i prostor.",
      },
      { type: "h2", text: "Vinil" },
      {
        type: "ul",
        items: [
          "Otporniji je na vlagu i prolivanje.",
          "Mekši je i tiši pri hodanju.",
          "Dostupan je u različitim uzorcima, od imitacije drva do kamena.",
        ],
      },
      { type: "h2", text: "Laminat" },
      {
        type: "ul",
        items: [
          "Tvrda površina otporna je na grebanje i svakodnevno trošenje.",
          "Često je povoljniji po m².",
          "Slabije podnosi stajaću vodu, pa nije najbolji izbor za kupaonicu.",
        ],
      },
      { type: "h2", text: "Podloga je jednako važna kao materijal" },
      {
        type: "p",
        text: "Bez obzira na odabir, pod se postavlja na ravnu, suhu i čistu podlogu. Neravnine se prije postave izravnavaju, a uz zidove se ostavlja razmak za dilataciju, koji se na kraju pokriva letvicama. Pod se može postaviti u različitim uzorcima, kao što su klasična postava, dijagonalna postava i riblja kost.",
      },
    ],
    faq: [
      {
        q: "Može li se vinil postaviti preko starih pločica?",
        a: "Često može, ako su pločice čvrste i podloga je ravna. Fuge i neravnine se prije toga izravnavaju. Preporučujemo pregled prostora prije dogovora.",
      },
      {
        q: "Radite li postavu u različitim uzorcima?",
        a: "Da. Postavljamo laminat i vinil u svim oblicima i uzorcima, uključujući klasičnu, dijagonalnu postavu i riblju kost.",
      },
    ],
  },
];

export const publishedPosts = posts
  .filter((post) => !post.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export const getPost = (slug: string) => publishedPosts.find((post) => post.slug === slug);

export const formatPostDate = (iso: string) =>
  new Intl.DateTimeFormat("hr-HR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
