-- Admin panel (admin.brickup.hr): dugovi, troškovnik, portfolio.
-- RLS je uključen bez ijedne politike, pa tablicama može pristupiti samo
-- server s service role ključem (src/lib/server/admin.ts).

create table public.dugovi (
  id uuid primary key default gen_random_uuid(),
  vjerovnik text not null,
  vrsta text not null check (vrsta in ('dobavljac', 'majstor', 'firma', 'izvodac')),
  opis text,
  iznos numeric(12, 2) not null,
  rok date,
  placeno boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.planirani_troskovi (
  id uuid primary key default gen_random_uuid(),
  opis text not null,
  kategorija text,
  iznos numeric(12, 2) not null,
  datum date,
  realizirano boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.inventar (
  id uuid primary key default gen_random_uuid(),
  naziv text not null,
  kategorija text not null check (kategorija in ('alat', 'stroj', 'vozilo', 'oprema', 'materijal', 'ostalo')),
  kolicina numeric(12, 2) not null default 1,
  vrijednost numeric(12, 2),
  napomena text,
  created_at timestamptz not null default now()
);

create table public.prihodi (
  id uuid primary key default gen_random_uuid(),
  opis text not null,
  iznos numeric(12, 2) not null,
  datum date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.isplate_osnivaca (
  id uuid primary key default gen_random_uuid(),
  osnivac text not null check (osnivac in ('osnivac_1', 'osnivac_2')),
  opis text,
  iznos numeric(12, 2) not null,
  datum date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.stanje_racuna (
  id uuid primary key default gen_random_uuid(),
  iznos numeric(12, 2) not null,
  datum date not null default current_date,
  napomena text,
  created_at timestamptz not null default now()
);

alter table public.dugovi enable row level security;
alter table public.planirani_troskovi enable row level security;
alter table public.inventar enable row level security;
alter table public.prihodi enable row level security;
alter table public.isplate_osnivaca enable row level security;
alter table public.stanje_racuna enable row level security;
