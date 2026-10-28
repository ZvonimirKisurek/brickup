import { useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { CalendarTab } from "@/components/admin/calendar-tab";
import { EntityTable, eur, type Mutate } from "@/components/admin/entity-table";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FOUNDERS, FOUNDERS_SHARE, TABLES, type AdminData, type Row } from "@/lib/admin";

// ---------------------------------------------------------------------------
// /admin (admin.brickup.hr preusmjerava ovamo, vidi src/server.ts)
//
// Interni panel za osnivače: Dugovi, Troškovnik (planirani troškovi i
// inventar), Portfolio (stanje računa i fond osnivača) i Kalendar (Google
// kalendari osnivača, tko je kada slobodan). Podaci se ne
// renderiraju na serveru, stranica ih dohvaća s /api/admin/data tek nakon
// prijave.
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin | BrickUp" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

class Unauthorized extends Error {}

async function fetchData(): Promise<AdminData> {
  const res = await fetch("/api/admin/data", { cache: "no-store" });
  if (res.status === 401) throw new Unauthorized();
  if (!res.ok) throw new Error("Učitavanje nije uspjelo.");
  return res.json();
}

const sum = (rows: Row[], key = "iznos") => rows.reduce((s, r) => s + Number(r[key] ?? 0), 0);

function AdminPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["admin"], queryFn: fetchData, retry: false });

  const mutate: Mutate = async (m) => {
    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(m),
    });
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(body.error ?? "Spremanje nije uspjelo.");
      throw new Error(body.error);
    }
    await qc.invalidateQueries({ queryKey: ["admin"] });
  };

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    qc.removeQueries({ queryKey: ["admin"] });
    await query.refetch();
  };

  if (query.error instanceof Unauthorized) return <Login onDone={() => query.refetch()} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <h1 className="text-lg font-bold">BrickUp admin</h1>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="size-4" /> Odjava
        </Button>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {query.isPending ? (
          <p className="text-muted-foreground">Učitavanje…</p>
        ) : query.error ? (
          <p className="text-destructive">{query.error.message}</p>
        ) : (
          <Tabs defaultValue="dugovi">
            <TabsList className="mb-6">
              <TabsTrigger value="dugovi">Dugovi</TabsTrigger>
              <TabsTrigger value="troskovnik">Troškovnik</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="kalendar">Kalendar</TabsTrigger>
            </TabsList>
            <TabsContent value="dugovi">
              <Debts data={query.data} mutate={mutate} />
            </TabsContent>
            <TabsContent value="troskovnik">
              <Costs data={query.data} mutate={mutate} />
            </TabsContent>
            <TabsContent value="kalendar">
              <CalendarTab />
            </TabsContent>
            <TabsContent value="portfolio">
              <Portfolio data={query.data} mutate={mutate} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) onDone();
    else setError("Pogrešno korisničko ime ili lozinka.");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <form onSubmit={submit} className="grid w-full max-w-xs gap-3">
        <h1 className="text-lg font-bold">BrickUp admin</h1>
        <Input
          autoFocus
          autoComplete="username"
          placeholder="Korisničko ime"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit">Prijava</Button>
      </form>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  tone?: "bad" | "good";
}) {
  const color = tone === "bad" ? "text-destructive" : tone === "good" ? "text-emerald-600" : "";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type SectionProps = { data: AdminData; mutate: Mutate };

function Debts({ data, mutate }: SectionProps) {
  const open = data.dugovi.filter((d) => !d.placeno);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = open.filter((d) => d.rok && String(d.rok) < today);

  // Koliko dugujemo kome, zbrojeno po vjerovniku.
  const byCreditor = new Map<string, { vrsta: string; total: number }>();
  for (const d of open) {
    const key = String(d.vjerovnik);
    const entry = byCreditor.get(key) ?? { vrsta: String(d.vrsta), total: 0 };
    entry.total += Number(d.iznos);
    byCreditor.set(key, entry);
  }
  const vrsta = TABLES.dugovi.fields[1].options;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Ukupno dugujemo"
          value={eur.format(sum(open))}
          tone={open.length ? "bad" : undefined}
        />
        <Stat label="Otvorenih dugova" value={String(open.length)} />
        <Stat
          label="Prošao rok"
          value={eur.format(sum(overdue))}
          hint={`${overdue.length} stavki`}
          tone={overdue.length ? "bad" : undefined}
        />
      </div>
      {byCreditor.size > 0 && (
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold">Po vjerovniku</h3>
          <ul className="grid gap-2 text-sm">
            {[...byCreditor.entries()]
              .sort((a, b) => b[1].total - a[1].total)
              .map(([name, { vrsta: v, total }]) => (
                <li key={name} className="flex justify-between gap-4">
                  <span>
                    {name}{" "}
                    <span className="text-muted-foreground">
                      · {vrsta.find((o) => o.value === v)?.label}
                    </span>
                  </span>
                  <span className="font-medium tabular-nums">{eur.format(total)}</span>
                </li>
              ))}
          </ul>
        </section>
      )}
      <EntityTable table="dugovi" title="Svi dugovi" rows={data.dugovi} mutate={mutate} />
    </div>
  );
}

function Costs({ data, mutate }: SectionProps) {
  const planned = data.planirani_troskovi.filter((t) => !t.realizirano);
  const inventoryValue = data.inventar.reduce(
    (s, i) => s + Number(i.kolicina ?? 0) * Number(i.vrijednost ?? 0),
    0,
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Planirani troškovi"
          value={eur.format(sum(planned))}
          hint={`${planned.length} nerealiziranih`}
        />
        <Stat label="Vrijednost inventara" value={eur.format(inventoryValue)} />
        <Stat label="Stavki u inventaru" value={String(data.inventar.length)} />
      </div>
      <EntityTable
        table="planirani_troskovi"
        title="Planirani troškovi"
        rows={data.planirani_troskovi}
        mutate={mutate}
      />
      <EntityTable
        table="inventar"
        title="Inventar (alati, strojevi, oprema…)"
        rows={data.inventar}
        mutate={mutate}
      />
    </div>
  );
}

function Portfolio({ data, mutate }: SectionProps) {
  const income = sum(data.prihodi);
  const perFounder = (income * FOUNDERS_SHARE) / FOUNDERS.length;
  const founders = FOUNDERS.map((f) => {
    const spent = sum(data.isplate_osnivaca.filter((p) => p.osnivac === f.value));
    return { ...f, spent, left: perFounder - spent };
  });

  const latest = [...data.stanje_racuna].sort(
    (a, b) =>
      String(b.datum).localeCompare(String(a.datum)) ||
      String(b.created_at).localeCompare(String(a.created_at)),
  )[0];
  const balance = latest ? Number(latest.iznos) : 0;
  const openDebt = sum(data.dugovi.filter((d) => !d.placeno));
  const foundersLeft = founders.reduce((s, f) => s + Math.max(0, f.left), 0);
  const firmFree = balance - openDebt - foundersLeft;
  const pct = Math.round((FOUNDERS_SHARE / FOUNDERS.length) * 100);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Stanje na računu"
          value={eur.format(balance)}
          hint={
            latest
              ? `na dan ${new Date(String(latest.datum)).toLocaleDateString("hr-HR")}`
              : "unesite stanje ispod"
          }
        />
        <Stat
          label="Ukupni prihod"
          value={eur.format(income)}
          hint={`fond osnivača ${FOUNDERS_SHARE * 100} % = ${eur.format(income * FOUNDERS_SHARE)}`}
        />
        <Stat
          label="Ostaje firmi"
          value={eur.format(firmFree)}
          hint="stanje − otvoreni dugovi − neiskorišteni fond osnivača"
          tone={firmFree < 0 ? "bad" : "good"}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {founders.map((f) => (
          <Stat
            key={f.value}
            label={`${f.label} može još potrošiti`}
            value={eur.format(f.left)}
            hint={`${pct} % prihoda = ${eur.format(perFounder)}, potrošeno ${eur.format(f.spent)}`}
            tone={f.left < 0 ? "bad" : "good"}
          />
        ))}
      </div>
      <EntityTable
        table="prihodi"
        title="Prihodi (naplaćeni poslovi)"
        rows={data.prihodi}
        mutate={mutate}
      />
      <EntityTable
        table="isplate_osnivaca"
        title="Potrošnja osnivača"
        rows={data.isplate_osnivaca}
        mutate={mutate}
      />
      <EntityTable
        table="stanje_racuna"
        title="Stanje računa (zadnji unos je trenutno stanje)"
        rows={data.stanje_racuna}
        mutate={mutate}
      />
    </div>
  );
}
