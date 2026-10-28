import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CALENDARS, FOUNDERS, type CalendarEvent } from "@/lib/admin";

// Month view of the founders' Google Calendars: who is busy on which day,
// so a new job isn't booked on top of an existing one.

const COLORS: Record<string, string> = {
  osnivac_1: "bg-sky-600",
  osnivac_2: "bg-amber-600",
  poslovi: "bg-emerald-600",
};
const WEEKDAYS = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// Local days (YYYY-MM-DD) an event touches. All-day ends are exclusive.
function eventDays(e: CalendarEvent): string[] {
  const parse = (v: string) => (e.allDay ? new Date(`${v}T00:00:00`) : new Date(v));
  const start = parse(e.start);
  let end = parse(e.end);
  if (e.allDay || end.getHours() + end.getMinutes() === 0) end = new Date(end.getTime() - 1);
  if (end < start) end = start;
  const days: string[] = [];
  for (
    let d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    d <= end;
    d = addDays(d, 1)
  ) {
    days.push(ymd(d));
  }
  return days;
}

const time = (e: CalendarEvent) =>
  e.allDay
    ? "cijeli dan"
    : new Date(e.start).toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" });

export function CalendarTab() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selected, setSelected] = useState(() => ymd(new Date()));

  // Grid runs Monday → Sunday, covering the whole month.
  const gridStart = addDays(month, -((month.getDay() + 6) % 7));
  const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const gridEnd = addDays(next, (7 - ((next.getDay() + 6) % 7)) % 7);
  const days: Date[] = [];
  for (let d = gridStart; d < gridEnd; d = addDays(d, 1)) days.push(d);

  const query = useQuery({
    queryKey: ["admin-calendar", ymd(gridStart), ymd(gridEnd)],
    queryFn: async (): Promise<{ events: CalendarEvent[]; errors: string[] }> => {
      const res = await fetch(`/api/admin/calendar?from=${ymd(gridStart)}&to=${ymd(gridEnd)}`);
      if (!res.ok) throw new Error("Kalendar se nije mogao učitati.");
      return res.json();
    },
  });

  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of query.data?.events ?? []) {
    for (const d of eventDays(e)) byDay.set(d, [...(byDay.get(d) ?? []), e]);
  }
  const busy = (day: string, who: string) => (byDay.get(day) ?? []).some((e) => e.who === who);

  const monthDays = days.filter((d) => d.getMonth() === month.getMonth()).map(ymd);
  const monthEvents = new Set(monthDays.flatMap((d) => byDay.get(d) ?? []));
  const bothFree = monthDays.filter((d) => FOUNDERS.every((f) => !busy(d, f.value))).length;
  const label = (who: string) => CALENDARS.find((c) => c.value === who)?.label ?? who;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Događaja ovaj mjesec</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{monthEvents.size}</p>
        </div>
        {FOUNDERS.map((f) => (
          <div key={f.value} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{f.label}: zauzetih dana</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {monthDays.filter((d) => busy(d, f.value)).length}
            </p>
          </div>
        ))}
      </div>

      {query.data?.errors.map((err) => (
        <p key={err} className="text-sm text-destructive">
          {err}
        </p>
      ))}

      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Prethodni mjesec"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h3 className="font-semibold capitalize">
            {month.toLocaleDateString("hr-HR", { month: "long", year: "numeric" })}
            {query.isFetching && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">…</span>
            )}
          </h3>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Sljedeći mjesec"
            onClick={() => setMonth(next)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 px-4 pt-3 text-xs text-muted-foreground">
          {CALENDARS.map((c) => (
            <span key={c.value} className="flex items-center gap-1">
              <span className={`size-2.5 rounded-full ${COLORS[c.value]}`} /> {c.label}
            </span>
          ))}
          <span>· {bothFree} dana ovaj mjesec oba slobodna</span>
        </div>
        <div className="grid grid-cols-7 gap-px p-2 text-xs sm:p-4">
          {WEEKDAYS.map((w) => (
            <div key={w} className="pb-1 text-center font-medium text-muted-foreground">
              {w}
            </div>
          ))}
          {days.map((d) => {
            const key = ymd(d);
            const events = byDay.get(key) ?? [];
            const free = FOUNDERS.every((f) => !busy(key, f.value));
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={`min-h-16 rounded-md border p-1 text-left align-top sm:min-h-24 ${
                  key === selected ? "border-primary" : "border-transparent"
                } ${d.getMonth() === month.getMonth() ? "" : "opacity-40"} ${free ? "bg-muted/30" : "bg-muted"}`}
              >
                <div className="flex items-center justify-between">
                  <span className={key === ymd(new Date()) ? "font-bold text-primary" : ""}>
                    {d.getDate()}
                  </span>
                  <span className="flex gap-0.5">
                    {FOUNDERS.map((f) =>
                      busy(key, f.value) ? (
                        <span key={f.value} className={`size-2 rounded-full ${COLORS[f.value]}`} />
                      ) : null,
                    )}
                  </span>
                </div>
                <ul className="mt-1 hidden gap-0.5 sm:grid">
                  {events.slice(0, 3).map((e, i) => (
                    <li key={i} className={`truncate rounded px-1 text-white ${COLORS[e.who]}`}>
                      {e.title}
                    </li>
                  ))}
                  {events.length > 3 && (
                    <li className="text-muted-foreground">+{events.length - 3}</li>
                  )}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 font-semibold">
          {new Date(`${selected}T00:00:00`).toLocaleDateString("hr-HR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h3>
        <div className="mb-3 flex flex-wrap gap-2 text-sm">
          {FOUNDERS.map((f) => (
            <span
              key={f.value}
              className={`rounded-full px-3 py-1 ${busy(selected, f.value) ? "bg-destructive/10 text-destructive" : "bg-emerald-600/10 text-emerald-700"}`}
            >
              {f.label}: {busy(selected, f.value) ? "zauzet" : "slobodan"}
            </span>
          ))}
        </div>
        {(byDay.get(selected) ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Nema događaja.</p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {(byDay.get(selected) ?? []).map((e, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className={`size-2.5 shrink-0 rounded-full ${COLORS[e.who]}`} />
                <span className="w-20 shrink-0 tabular-nums text-muted-foreground">{time(e)}</span>
                <span>{e.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">{label(e.who)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
