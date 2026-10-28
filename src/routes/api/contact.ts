import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { resolveEnvVar } from "@/lib/server/env";

// ---------------------------------------------------------------------------
// POST /api/contact
//
// Replaces the old `mailto:` trick on the homepage form. That approach
// silently lost leads on any device without a configured mail client
// (very common on mobile). This endpoint validates the submission and
// sends it by email via Resend (https://resend.com), no database needed
// for now, the email itself is the record of the lead.
//
// Required environment variable:
//   RESEND_API_KEY     , Resend API key (Settings → API Keys on resend.com)
// Optional:
//   LEAD_NOTIFY_EMAIL  , where leads are sent (defaults to the owner email below)
//   LEAD_FROM_EMAIL    , "from" address (defaults to Resend's test sender,
//                          which only works when LEAD_NOTIFY_EMAIL is the
//                          same address used to sign up for Resend, see
//                          the setup notes shared alongside this file)
// ---------------------------------------------------------------------------

const DEFAULT_NOTIFY_EMAIL = "brickupdoo@gmail.com";
const DEFAULT_FROM_EMAIL = "Verdia <onboarding@resend.dev>";

const leadSchema = z.object({
  ime: z.string().trim().min(2, "Unesite ime i prezime.").max(120),
  telefon: z.string().trim().min(6, "Unesite telefon.").max(30),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || z.string().email().safeParse(v).success, {
      message: "Email nije valjan.",
    }),
  grad: z.string().trim().min(2, "Odaberite grad.").max(60),
  vrsta: z.string().trim().min(2, "Odaberite vrstu posla.").max(60),
  opis: z.string().trim().min(5, "Opišite posao malo detaljnije.").max(2000),
  // Honeypot field: real users never see or fill this (it's visually
  // hidden in the form). If it arrives non-empty, the submission is spam.
  //
  // Deliberately permissive: the schema must NOT reject a filled honeypot.
  // It used to be `.max(0)`, which failed validation before the handler's
  // silent-drop branch below could run, so bots got a 400 telling them
  // exactly which field tripped them up, and any password manager that
  // autofilled the hidden field locked a real customer out of the form
  // with an untranslated English error. Accept the value here, decide below.
  website: z.string().max(200).optional(),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Neispravan zahtjev." }, { status: 400 });
        }

        const parsed = leadSchema.safeParse(payload);
        if (!parsed.success) {
          const firstIssue = parsed.error.issues[0]?.message ?? "Provjerite podatke u formi.";
          return Response.json({ ok: false, error: firstIssue }, { status: 400 });
        }
        const data = parsed.data;

        // Honeypot tripped: pretend success so bots don't learn anything,
        // but drop the submission without sending an email.
        if (data.website) {
          return Response.json({ ok: true });
        }

        const apiKey = await resolveEnvVar("RESEND_API_KEY");
        if (!apiKey) {
          console.error("[api/contact] RESEND_API_KEY is not configured.");
          return Response.json(
            { ok: false, error: "Slanje trenutno nije dostupno. Nazovite nas izravno." },
            { status: 500 },
          );
        }

        const toEmail = (await resolveEnvVar("LEAD_NOTIFY_EMAIL")) || DEFAULT_NOTIFY_EMAIL;
        const fromEmail = (await resolveEnvVar("LEAD_FROM_EMAIL")) || DEFAULT_FROM_EMAIL;

        const subject = `Novi upit: ${data.vrsta} (${data.grad})`;
        const html = `
          <h2 style="font-family:sans-serif">Novi upit s Verdia stranice</h2>
          <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:4px 12px 4px 0"><strong>Ime i prezime</strong></td><td>${escapeHtml(data.ime)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Telefon</strong></td><td>${escapeHtml(data.telefon)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Email</strong></td><td>${escapeHtml(data.email ?? "nije upisan")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Grad</strong></td><td>${escapeHtml(data.grad)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0"><strong>Vrsta posla</strong></td><td>${escapeHtml(data.vrsta)}</td></tr>
          </table>
          <p style="font-family:sans-serif;font-size:14px"><strong>Opis posla:</strong></p>
          <p style="font-family:sans-serif;font-size:14px">${escapeHtml(data.opis).replace(/\n/g, "<br/>")}</p>
        `;

        try {
          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [toEmail],
              reply_to: data.email || undefined,
              subject,
              html,
            }),
          });

          if (!resendRes.ok) {
            const errBody = await resendRes.text();
            console.error("[api/contact] Resend error:", resendRes.status, errBody);
            return Response.json(
              { ok: false, error: "Slanje nije uspjelo. Nazovite nas izravno." },
              { status: 502 },
            );
          }
        } catch (err) {
          console.error("[api/contact] Failed to reach Resend:", err);
          return Response.json(
            { ok: false, error: "Slanje nije uspjelo. Nazovite nas izravno." },
            { status: 502 },
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
