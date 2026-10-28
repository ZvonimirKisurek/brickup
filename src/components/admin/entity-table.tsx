import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TABLES, type Field, type Row, type TableName } from "@/lib/admin";

export const eur = new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR" });

export type Mutate = (
  m:
    | { op: "insert"; table: TableName; row: Record<string, unknown> }
    | { op: "update"; table: TableName; id: string; row: Record<string, unknown> }
    | { op: "delete"; table: TableName; id: string },
) => Promise<void>;

const today = () => new Date().toISOString().slice(0, 10);

function display(field: Field, value: Row[string]) {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "number")
    return field.key === "kolicina" ? String(value) : eur.format(Number(value));
  if (field.type === "date") return new Date(String(value)).toLocaleDateString("hr-HR");
  if (field.type === "select")
    return field.options?.find((o) => o.value === value)?.label ?? String(value);
  return String(value);
}

function emptyForm(fields: readonly Field[]) {
  return Object.fromEntries(
    fields.map((f) => [
      f.key,
      f.type === "bool"
        ? false
        : f.type === "date" && f.required
          ? today()
          : f.type === "select"
            ? f.options![0].value
            : "",
    ]),
  ) as Record<string, string | boolean>;
}

// Generic list + add/edit form for one admin table, driven by TABLES config.
export function EntityTable({
  table,
  title,
  rows,
  mutate,
}: {
  table: TableName;
  title: string;
  rows: Row[];
  mutate: Mutate;
}) {
  const fields = TABLES[table].fields as readonly Field[];
  const [form, setForm] = useState<Record<string, string | boolean> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const open = (row?: Row) => {
    setEditId(row?.id ?? null);
    setForm(
      row
        ? Object.fromEntries(
            fields.map((f) => [
              f.key,
              f.type === "bool" ? Boolean(row[f.key]) : String(row[f.key] ?? ""),
            ]),
          )
        : emptyForm(fields),
    );
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    // Empty optional inputs are stored as null, not "".
    const row = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === "" ? null : v]));
    setBusy(true);
    try {
      await (editId
        ? mutate({ op: "update", table, id: editId, row })
        : mutate({ op: "insert", table, row }));
      setForm(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h3 className="font-semibold">{title}</h3>
        {!form && (
          <Button size="sm" onClick={() => open()}>
            <Plus className="size-4" /> Dodaj
          </Button>
        )}
      </div>

      {form && (
        <form
          onSubmit={submit}
          className="grid gap-3 border-b border-border bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {fields.map((f) => (
            <label key={f.key} className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                {f.label}
                {f.required && " *"}
              </span>
              {f.type === "bool" ? (
                <input
                  type="checkbox"
                  className="size-5"
                  checked={Boolean(form[f.key])}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                />
              ) : f.type === "select" ? (
                <select
                  className="h-9 rounded-md border border-input bg-background px-2"
                  value={String(form[f.key])}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                >
                  {f.options!.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  step={f.type === "number" ? "0.01" : undefined}
                  required={f.required}
                  value={String(form[f.key])}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              )}
            </label>
          ))}
          <div className="flex items-end gap-2">
            <Button type="submit" disabled={busy}>
              {editId ? "Spremi" : "Dodaj"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>
              <X className="size-4" /> Odustani
            </Button>
          </div>
        </form>
      )}

      {rows.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Nema unosa.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                {fields.map((f) => (
                  <th key={f.key} className="whitespace-nowrap px-4 py-2 font-medium">
                    {f.label.replace(/ \(.*\)$/, "")}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  {fields.map((f) => (
                    <td
                      key={f.key}
                      className={`px-4 py-2 ${f.type === "number" ? "whitespace-nowrap tabular-nums" : ""}`}
                    >
                      {f.type === "bool" ? (
                        <input
                          type="checkbox"
                          className="size-4"
                          checked={Boolean(row[f.key])}
                          onChange={(e) =>
                            mutate({
                              op: "update",
                              table,
                              id: row.id,
                              row: { [f.key]: e.target.checked },
                            })
                          }
                        />
                      ) : (
                        display(f, row[f.key])
                      )}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-2 py-1 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Uredi"
                      onClick={() => open(row)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Obriši"
                      onClick={() =>
                        confirm("Obrisati ovaj unos?") &&
                        mutate({ op: "delete", table, id: row.id })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
