import { z } from "zod";

import { TABLES, TABLE_NAMES, type Field, type TableName } from "@/lib/admin";
import { resolveEnvVar } from "@/lib/server/env";

// ---------------------------------------------------------------------------
// Server-side helpers for the admin panel: session cookie and Supabase access.
//
// Env:
//   ADMIN_USERNAME             , login username (default "admin")
//   ADMIN_PASSWORD             , shared password for the founders
//   SUPABASE_URL               , https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  , service role key (bypasses RLS; the tables
//                                 have RLS on with no policies, so nothing
//                                 else can read them)
// ---------------------------------------------------------------------------

const COOKIE = "admin_session";
const SESSION_DAYS = 30;

const encoder = new TextEncoder();

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Compares via HMAC so the comparison time doesn't leak the password.
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([hmac("cmp", a), hmac("cmp", b)]);
  return ha === hb;
}

export async function checkLogin(username: string, password: string): Promise<boolean> {
  const [expectedUser, expected] = await Promise.all([
    resolveEnvVar("ADMIN_USERNAME"),
    resolveEnvVar("ADMIN_PASSWORD"),
  ]);
  if (!expected) return false;
  const [userOk, passOk] = await Promise.all([
    safeEqual(username, expectedUser ?? "admin"),
    safeEqual(password, expected),
  ]);
  return userOk && passOk;
}

export async function sessionCookie(): Promise<string> {
  const secret = (await resolveEnvVar("ADMIN_PASSWORD")) ?? "";
  const exp = String(Date.now() + SESSION_DAYS * 86_400_000);
  const value = `${exp}.${await hmac(secret, exp)}`;
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86_400}`;
}

export const clearCookie = `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export async function isAuthed(request: Request): Promise<boolean> {
  const secret = await resolveEnvVar("ADMIN_PASSWORD");
  if (!secret) return false;
  const raw = request.headers
    .get("cookie")
    ?.split(/;\s*/)
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmac(secret, exp));
}

// --- Validation ------------------------------------------------------------

function fieldSchema(field: Field): z.ZodTypeAny {
  switch (field.type) {
    case "number":
      return field.required ? z.coerce.number().finite() : z.coerce.number().finite().nullable();
    case "bool":
      return z.boolean();
    case "date":
      return field.required
        ? z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
        : z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .nullable()
            .or(z.literal("").transform(() => null));
    case "select":
      return z.enum(field.options!.map((o) => o.value) as [string, ...string[]]);
    default:
      return field.required
        ? z.string().trim().min(1).max(500)
        : z.string().trim().max(500).nullable();
  }
}

const rowSchemas = Object.fromEntries(
  TABLE_NAMES.map((t) => [
    t,
    z
      .object(Object.fromEntries(TABLES[t].fields.map((f) => [f.key, fieldSchema(f)])))
      .strict()
      .partial(),
  ]),
) as unknown as Record<TableName, z.ZodTypeAny>;

export const mutationSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("insert"),
    table: z.enum(TABLE_NAMES as [TableName, ...TableName[]]),
    row: z.record(z.unknown()),
  }),
  z.object({
    op: z.literal("update"),
    table: z.enum(TABLE_NAMES as [TableName, ...TableName[]]),
    id: z.string().uuid(),
    row: z.record(z.unknown()),
  }),
  z.object({
    op: z.literal("delete"),
    table: z.enum(TABLE_NAMES as [TableName, ...TableName[]]),
    id: z.string().uuid(),
  }),
]);

export function parseRow(table: TableName, row: unknown, insert: boolean) {
  const parsed = rowSchemas[table].safeParse(row);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravni podaci." };
  if (insert) {
    const missing = TABLES[table].fields.find(
      (f) => "required" in f && f.required && parsed.data[f.key] == null,
    );
    if (missing) return { error: `Polje "${missing.label}" je obavezno.` };
  }
  return { data: parsed.data as Record<string, unknown> };
}

// --- Supabase (PostgREST) --------------------------------------------------

export async function supabase(path: string, init: RequestInit = {}): Promise<Response> {
  const [url, key] = await Promise.all([
    resolveEnvVar("SUPABASE_URL"),
    resolveEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
  ]);
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY nisu postavljeni.");
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...init.headers,
    },
  });
}
