import { createFileRoute } from "@tanstack/react-router";

import { checkLogin, clearCookie, isAuthed, sessionCookie } from "@/lib/server/admin";

// ---------------------------------------------------------------------------
// /api/admin/session
//   GET    → { ok } (je li prijavljen)
//   POST   → prijava (ADMIN_USERNAME + ADMIN_PASSWORD), postavlja kolačić
//   DELETE → odjava
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/api/admin/session")({
  server: {
    handlers: {
      GET: async ({ request }) => Response.json({ ok: await isAuthed(request) }),
      POST: async ({ request }) => {
        let username = "";
        let password = "";
        try {
          const body = (await request.json()) as { username?: unknown; password?: unknown };
          username = typeof body.username === "string" ? body.username.trim() : "";
          password = typeof body.password === "string" ? body.password : "";
        } catch {
          // falls through to the wrong-password response
        }
        if (!username || !password || !(await checkLogin(username, password))) {
          return Response.json(
            { ok: false, error: "Pogrešno korisničko ime ili lozinka." },
            { status: 401 },
          );
        }
        return Response.json({ ok: true }, { headers: { "set-cookie": await sessionCookie() } });
      },
      DELETE: async () => Response.json({ ok: true }, { headers: { "set-cookie": clearCookie } }),
    },
  },
});
