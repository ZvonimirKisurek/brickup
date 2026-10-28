# Verdia — backend + de-branding update

## Što je u ovom paketu

Pretpostavio sam standardnu TanStack Start strukturu foldera (`src/routes/`,
`src/lib/`). Ako se tvoj repo razlikuje, javi mi pa prilagodim — inače su
ovo točne putanje:

```
vite.config.ts                  ZAMIJENI (uklanja @lovable.dev/vite-tanstack-config)
package.json                    ZAMIJENI (uklanja lovable paket, dodaje lightningcss)
bunfig.toml                     ZAMIJENI (uklanja lovable iznimke)
AGENTS.md                       ZAMIJENI (uklanja Lovable banner)
src/routes/__root.tsx           ZAMIJENI (uklanja __lovableEvents hook)
src/routes/index.tsx            ZAMIJENI (forma sada zove pravi backend)
src/routes/api/contact.ts       NOVO (backend — validacija + slanje emaila)
```

**Obriši ovu datoteku:** `src/lib/lovable-error-reporting.ts` (više se ne koristi).

**Ne diraj:** `src/server.ts`, `src/start.ts`, `src/lib/error-page.ts`,
`src/lib/error-capture.ts` — ti ne spominju Lovable, samo h3/Nitro error
handling, i ostaju identični.

## Što se promijenilo i zašto

1. **Forma za upite više ne koristi `mailto:`.** Taj trik je nepouzdan —
   gubi upit ako posjetitelj nema podešen mail klijent (čest slučaj na
   mobitelu). Sada forma šalje POST na `/api/contact`, koji validira
   podatke i šalje ti email preko [Resend](https://resend.com)-a. Forma
   sad ima i pravu poruku o grešci ako slanje ne uspije (umjesto da upit
   tiho propadne).
2. **Dodan honeypot za spam** — skriveno polje koje botovi popunjavaju a
   ljudi ne vide; ako je popunjeno, upit se tiho odbacuje.
3. **Uklonjen Lovable trag iz isporučenog koda** (`window.__lovableEvents`
   hook) i iz izvornog koda (`package.json`, `vite.config.ts`, `AGENTS.md`,
   `bunfig.toml`).

## Bitna napomena o Lovable editoru

Pošto sam u potpunosti uklonio `@lovable.dev/vite-tanstack-config` (build
wrapper koji Lovable koristi za njihov vizualni editor/live preview),
**Lovable-ov "klikni i uredi" editor i njihov sandbox preview vjerojatno
više neće raditi za ovaj projekt**. Pošto deployaš preko svog servera (ne
preko Lovable "Publish" gumba), to ne bi trebalo utjecati na samu objavu —
samo na to da ubuduće code menjaš direktno (git/GitHub), a ne kroz
Lovable-ovo sučelje. Ako mi se ipak javiš da želiš zadržati Lovable editor,
mogu vratiti wrapper i samo skloniti vidljivi `__lovableEvents` trag —
manje temeljito, ali bez tog rizika.

## Postavljanje Resend-a (slanje emaila)

1. Idi na [resend.com](https://resend.com) i registriraj se s emailom na
   koji želiš primati upite (npr. `brickupdoo@gmail.com`).
2. **API Keys → Create API Key.** Kopiraj ključ (prikazuje se samo jednom).
3. Postavi environment variable / secret na svom serveru:
   - `RESEND_API_KEY` = ključ iz koraka 2 (**obavezno**)
   - `LEAD_NOTIFY_EMAIL` = email na koji stižu upiti (opcionalno, default
     je `brickupdoo@gmail.com`)
   - `LEAD_FROM_EMAIL` = "from" adresa (opcionalno, default
     `Verdia <onboarding@resend.dev>`)
   - Ako je tvoj server Cloudflare Worker: `wrangler secret put RESEND_API_KEY`
     (ili kroz Cloudflare dashboard → Worker → Settings → Variables).
   - Ako je obični Node server: dodaj u `.env` ili u panel hostinga.
4. **Bitno ograničenje besplatnog plana:** bez verificirane domene, Resend
   dopušta slanje SAMO na email kojim si se registrirao na Resend (npr.
   ako se registriraš s `brickupdoo@gmail.com`, upiti stižu samo
   tamo — što je upravo ono što treba). Besplatni plan: 100 emaila/dan,
   3000/mjesec — više nego dovoljno za ovu stranicu.
5. Kasnije, ako želiš slati s vlastite domene (npr. `upiti@brickup.hr`) ili
   na više adresa, treba verificirati domenu na resend.com/domains — javi
   se kad dođeš do toga, provest ćemo te kroz to.

## Primjena na repo

```bash
git checkout -b ukloni-lovable-trag
# kopiraj/zamijeni datoteke iz ovog paketa na navedene putanje
rm src/lib/lovable-error-reporting.ts
bun install        # regenerira bun.lock bez lovable paketa
bun run dev         # provjeri da sve radi lokalno
bun run build        # provjeri da build prolazi bez grešaka
git add -A
git commit -m "Ukloni Lovable wrapper, dodaj pravi backend za formu"
git push -u origin ukloni-lovable-trag
```

Zatim merge u glavnu granu i deployaj kao i obično preko svog servera.

## Testiranje

1. Lokalno: `bun run dev`, otvori stranicu, popuni i pošalji formu.
2. Provjeri da email stigne (provjeri i spam folder prvi put).
3. Ako ne stigne — provjeri logove servera za poruke koje počinju s
   `[api/contact]`; najčešći uzrok je da `RESEND_API_KEY` nije postavljen
   na produkcijskom serveru (lokalno može raditi preko `.env`, a na
   serveru ga treba postaviti zasebno).
4. Javi mi ako email ne stigne pa zajedno iskopčamo zašto — moguće je da
   tvoj server čita environment varijable na malo drugačiji način pa treba
   sitna prilagodba u `src/routes/api/contact.ts`.
