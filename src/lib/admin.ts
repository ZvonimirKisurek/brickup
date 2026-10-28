// ---------------------------------------------------------------------------
// Admin panel (admin.brickup.hr), zajednička konfiguracija za klijent i server.
//
// Svaka tablica opisana je jednom, ovdje: server iz toga gradi validaciju,
// a sučelje obrasce i tablice. Nova kolona = nova stavka u `fields` + ista
// kolona u supabase/migrations.
// ---------------------------------------------------------------------------

// Imena osnivača i dogovor o potrošnji: od svakog prihoda 20 % ide u fond
// osnivača, podijeljeno na jednake dijelove; ostatak ostaje firmi.
export const FOUNDERS = [
  { value: "osnivac_1", label: "Luka Posavac" },
  { value: "osnivac_2", label: "Zvonimir Kišurek" },
] as const;
export const FOUNDERS_SHARE = 0.2;

// Google kalendari koji se prikazuju u kartici Kalendar. Svaki se povezuje
// tajnom iCal adresom u env varijabli (Google Calendar → Postavke →
// kalendar → "Tajna adresa u iCal formatu"). POSLOVI je neobavezan
// zajednički kalendar poslova; dan je "zauzet" za osnivača ako ima događaj
// u svom kalendaru.
export const CALENDARS = [
  { value: "osnivac_1", label: FOUNDERS[0].label, env: "GCAL_ICS_OSNIVAC_1" },
  { value: "osnivac_2", label: FOUNDERS[1].label, env: "GCAL_ICS_OSNIVAC_2" },
  { value: "poslovi", label: "Poslovi", env: "GCAL_ICS_POSLOVI", optional: true },
] as const;

export type CalendarEvent = {
  who: string;
  title: string;
  allDay: boolean;
  // YYYY-MM-DD for all-day events (end exclusive), ISO timestamp otherwise.
  start: string;
  end: string;
};

export type FieldType = "text" | "number" | "date" | "bool" | "select";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly { value: string; label: string }[];
};

export const TABLES = {
  dugovi: {
    label: "Dug",
    fields: [
      {
        key: "vjerovnik",
        label: "Kome (dobavljač / majstor / firma)",
        type: "text",
        required: true,
      },
      {
        key: "vrsta",
        label: "Vrsta",
        type: "select",
        required: true,
        options: [
          { value: "dobavljac", label: "Dobavljač" },
          { value: "majstor", label: "Majstor" },
          { value: "firma", label: "Firma" },
          { value: "izvodac", label: "Izvođač" },
        ],
      },
      { key: "opis", label: "Za što", type: "text" },
      { key: "iznos", label: "Iznos (€)", type: "number", required: true },
      { key: "rok", label: "Rok plaćanja", type: "date" },
      { key: "placeno", label: "Plaćeno", type: "bool" },
    ],
  },
  planirani_troskovi: {
    label: "Planirani trošak",
    fields: [
      { key: "opis", label: "Opis", type: "text", required: true },
      { key: "kategorija", label: "Kategorija", type: "text" },
      { key: "iznos", label: "Iznos (€)", type: "number", required: true },
      { key: "datum", label: "Planirano za", type: "date" },
      { key: "realizirano", label: "Realizirano", type: "bool" },
    ],
  },
  inventar: {
    label: "Stavka inventara",
    fields: [
      { key: "naziv", label: "Naziv", type: "text", required: true },
      {
        key: "kategorija",
        label: "Kategorija",
        type: "select",
        required: true,
        options: [
          { value: "alat", label: "Alat" },
          { value: "stroj", label: "Stroj" },
          { value: "vozilo", label: "Vozilo" },
          { value: "oprema", label: "Oprema" },
          { value: "materijal", label: "Materijal" },
          { value: "ostalo", label: "Ostalo" },
        ],
      },
      { key: "kolicina", label: "Količina", type: "number", required: true },
      { key: "vrijednost", label: "Vrijednost po kom. (€)", type: "number" },
      { key: "napomena", label: "Napomena / lokacija", type: "text" },
    ],
  },
  prihodi: {
    label: "Prihod",
    fields: [
      { key: "opis", label: "Posao / opis", type: "text", required: true },
      { key: "iznos", label: "Iznos (€)", type: "number", required: true },
      { key: "datum", label: "Datum", type: "date", required: true },
    ],
  },
  isplate_osnivaca: {
    label: "Potrošnja osnivača",
    fields: [
      { key: "osnivac", label: "Tko", type: "select", required: true, options: FOUNDERS },
      { key: "opis", label: "Opis", type: "text" },
      { key: "iznos", label: "Iznos (€)", type: "number", required: true },
      { key: "datum", label: "Datum", type: "date", required: true },
    ],
  },
  stanje_racuna: {
    label: "Stanje računa",
    fields: [
      { key: "iznos", label: "Stanje (€)", type: "number", required: true },
      { key: "datum", label: "Na dan", type: "date", required: true },
      { key: "napomena", label: "Napomena", type: "text" },
    ],
  },
} as const satisfies Record<string, { label: string; fields: readonly Field[] }>;

export type TableName = keyof typeof TABLES;
export const TABLE_NAMES = Object.keys(TABLES) as TableName[];

export type Row = { id: string; created_at: string } & Record<
  string,
  string | number | boolean | null
>;
export type AdminData = Record<TableName, Row[]>;
