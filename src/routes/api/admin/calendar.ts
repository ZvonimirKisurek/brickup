import { createFileRoute } from "@tanstack/react-router";

import { isAuthed } from "@/lib/server/admin";
import { loadEvents } from "@/lib/server/calendar";

// ---------------------------------------------------------------------------
// GET /api/admin/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
// Događaji iz Google kalendara oba osnivača (i zajedničkog kalendara poslova,
// ako je povezan) za zadani raspon. Traži admin sesiju.
// ---------------------------------------------------------------------------

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export const Route = createFileRoute("/api/admin/calendar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAuthed(request))) {
          return Response.json({ ok: false, error: "Niste prijavljeni." }, { status: 401 });
        }
        const params = new URL(request.url).searchParams;
        const from = params.get("from") ?? "";
        const to = params.get("to") ?? "";
        if (!DAY.test(from) || !DAY.test(to) || from >= to) {
          return Response.json({ ok: false, error: "Neispravan raspon." }, { status: 400 });
        }
        // Pad by a day each side so timezone offsets never clip an event.
        const result = await loadEvents(
          new Date(Date.parse(from) - 86_400_000),
          new Date(Date.parse(to) + 86_400_000),
        );
        return Response.json(result, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});
