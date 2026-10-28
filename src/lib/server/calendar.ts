import ICAL from "ical.js";

import { CALENDARS, type CalendarEvent } from "@/lib/admin";
import { resolveEnvVar } from "@/lib/server/env";

// ---------------------------------------------------------------------------
// Reads the founders' Google Calendars through their private iCal address
// (Google Calendar → Settings → <calendar> → "Secret address in iCal
// format"). Read-only, no OAuth: the URL itself is the credential, so it
// lives only in env vars (see CALENDARS in src/lib/admin.ts).
// ---------------------------------------------------------------------------

async function fetchCalendar(
  who: string,
  url: string,
  from: Date,
  to: Date,
): Promise<CalendarEvent[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Kalendar "${who}" nije dostupan (${res.status}).`);
  const root = new ICAL.Component(ICAL.parse(await res.text()));

  for (const tz of root.getAllSubcomponents("vtimezone")) {
    ICAL.TimezoneService.register(tz);
  }

  // Modified instances of a recurring event arrive as separate VEVENTs with
  // a RECURRENCE-ID; attach them to their master so they replace the
  // original occurrence instead of showing up twice.
  const events = root.getAllSubcomponents("vevent").map((c) => new ICAL.Event(c));
  const masters = new Map(events.filter((e) => !e.isRecurrenceException()).map((e) => [e.uid, e]));
  for (const e of events) {
    if (e.isRecurrenceException()) masters.get(e.uid)?.relateException(e);
  }

  const out: CalendarEvent[] = [];
  const push = (e: ICAL.Event, start: ICAL.Time, end: ICAL.Time) => {
    const s = start.toJSDate();
    const en = end.toJSDate();
    if (en <= from || s >= to) return;
    // "Show as: Available" events don't block the day.
    if (e.component.getFirstPropertyValue("transp") === "TRANSPARENT") return;
    out.push({
      who,
      title: e.summary || "(bez naslova)",
      allDay: start.isDate,
      start: start.isDate ? start.toString() : s.toISOString(),
      end: end.isDate ? end.toString() : en.toISOString(),
    });
  };

  for (const e of masters.values()) {
    if (!e.isRecurring()) {
      push(e, e.startDate, e.endDate ?? e.startDate);
      continue;
    }
    const it = e.iterator();
    for (let next = it.next(), guard = 0; next && guard < 2000; next = it.next(), guard++) {
      const d = e.getOccurrenceDetails(next);
      if (d.startDate.toJSDate() >= to) break;
      push(d.item, d.startDate, d.endDate);
    }
  }
  return out;
}

export async function loadEvents(
  from: Date,
  to: Date,
): Promise<{ events: CalendarEvent[]; errors: string[] }> {
  const results = await Promise.all(
    CALENDARS.map(async (c) => {
      const url = await resolveEnvVar(c.env);
      if (!url && "optional" in c) return { events: [] };
      if (!url) return { events: [], error: `${c.label}: kalendar nije povezan (${c.env}).` };
      try {
        return { events: await fetchCalendar(c.value, url, from, to) };
      } catch (err) {
        console.error(err);
        return { events: [], error: `${c.label}: kalendar se nije mogao učitati.` };
      }
    }),
  );
  return {
    events: results.flatMap((r) => r.events),
    errors: results.flatMap((r) => ("error" in r && r.error ? [r.error] : [])),
  };
}
