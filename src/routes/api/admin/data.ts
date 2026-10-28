import { createFileRoute } from "@tanstack/react-router";

import { TABLE_NAMES } from "@/lib/admin";
import { isAuthed, mutationSchema, parseRow, supabase } from "@/lib/server/admin";

// ---------------------------------------------------------------------------
// /api/admin/data
//   GET  → sve tablice admin panela odjednom ({ dugovi: [...], ... })
//   POST → { op: "insert" | "update" | "delete", table, id?, row? }
// Oba traže valjanu admin sesiju.
// ---------------------------------------------------------------------------

const unauthorized = () =>
  Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });

async function failed(res: Response) {
  console.error("Supabase error", res.status, await res.text());
  return Response.json({ ok: false, error: "Greška baze podataka." }, { status: 502 });
}

export const Route = createFileRoute("/api/admin/data")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAuthed(request))) return unauthorized();
        const responses = await Promise.all(
          TABLE_NAMES.map((t) => supabase(`${t}?select=*&order=created_at.desc`)),
        );
        const bad = responses.find((r) => !r.ok);
        if (bad) return failed(bad);
        const rows = await Promise.all(responses.map((r) => r.json()));
        return Response.json(Object.fromEntries(TABLE_NAMES.map((t, i) => [t, rows[i]])), {
          headers: { "cache-control": "no-store" },
        });
      },
      POST: async ({ request }) => {
        if (!(await isAuthed(request))) return unauthorized();
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
        }
        const parsed = mutationSchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
        }
        const m = parsed.data;

        let res: Response;
        if (m.op === "delete") {
          res = await supabase(`${m.table}?id=eq.${m.id}`, { method: "DELETE" });
        } else {
          const row = parseRow(m.table, m.row, m.op === "insert");
          if ("error" in row)
            return Response.json({ ok: false, error: row.error }, { status: 400 });
          res = await supabase(m.op === "insert" ? m.table : `${m.table}?id=eq.${m.id}`, {
            method: m.op === "insert" ? "POST" : "PATCH",
            body: JSON.stringify(row.data),
          });
        }
        if (!res.ok) return failed(res);
        return Response.json({ ok: true });
      },
    },
  },
});
