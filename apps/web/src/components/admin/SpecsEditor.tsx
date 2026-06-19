'use client';

import { Plus, Trash2 } from 'lucide-react';

export type SpecRow = { k: string; v: string };
export type SpecGroup = { name: string; rows: SpecRow[] };

/** Convert a stored specs object → editor groups. */
export function specsToGroups(specs: Record<string, Record<string, string>> | null | undefined): SpecGroup[] {
  if (!specs) return [];
  return Object.entries(specs).map(([name, rows]) => ({
    name,
    rows: Object.entries(rows ?? {}).map(([k, v]) => ({ k, v: String(v) })),
  }));
}

/** Convert editor groups → a clean specs object (drops empty names/rows). */
export function groupsToSpecs(groups: SpecGroup[]): Record<string, Record<string, string>> | undefined {
  const out: Record<string, Record<string, string>> = {};
  for (const g of groups) {
    const name = g.name.trim();
    if (!name) continue;
    const rows: Record<string, string> = {};
    for (const r of g.rows) {
      const k = r.k.trim();
      if (k && r.v.trim()) rows[k] = r.v.trim();
    }
    if (Object.keys(rows).length) out[name] = rows;
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Friendly grouped key/value spec editor — no JSON. Each group (e.g. "Display")
 * holds rows like "Size → 6.7\"". Controlled via value/onChange.
 */
export function SpecsEditor({ value, onChange }: { value: SpecGroup[]; onChange: (g: SpecGroup[]) => void }) {
  const update = (next: SpecGroup[]) => onChange(next);

  const addGroup = () => update([...value, { name: '', rows: [{ k: '', v: '' }] }]);
  const removeGroup = (gi: number) => update(value.filter((_, i) => i !== gi));
  const setGroupName = (gi: number, name: string) =>
    update(value.map((g, i) => (i === gi ? { ...g, name } : g)));

  const addRow = (gi: number) =>
    update(value.map((g, i) => (i === gi ? { ...g, rows: [...g.rows, { k: '', v: '' }] } : g)));
  const removeRow = (gi: number, ri: number) =>
    update(value.map((g, i) => (i === gi ? { ...g, rows: g.rows.filter((_, j) => j !== ri) } : g)));
  const setRow = (gi: number, ri: number, patch: Partial<SpecRow>) =>
    update(
      value.map((g, i) =>
        i === gi ? { ...g, rows: g.rows.map((r, j) => (j === ri ? { ...r, ...patch } : r)) } : g,
      ),
    );

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Specifications</p>

      {value.length === 0 && (
        <p className="text-xs text-faint">No specs yet — add a section like “Display” or “Performance”.</p>
      )}

      {value.map((group, gi) => (
        <div key={gi} className="rounded-lg border border-line p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={group.name}
              onChange={(e) => setGroupName(gi, e.target.value)}
              placeholder="Section (e.g. Display)"
              className="flex-1 border border-line rounded px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => removeGroup(gi)}
              aria-label="Remove section"
              className="grid h-8 w-8 shrink-0 place-items-center rounded text-faint hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {group.rows.map((row, ri) => (
            <div key={ri} className="flex items-center gap-2 pl-1">
              <input
                value={row.k}
                onChange={(e) => setRow(gi, ri, { k: e.target.value })}
                placeholder="Label (e.g. Size)"
                className="w-2/5 border border-line rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
              />
              <input
                value={row.v}
                onChange={(e) => setRow(gi, ri, { v: e.target.value })}
                placeholder="Value (e.g. 6.7&quot;)"
                className="flex-1 border border-line rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeRow(gi, ri)}
                aria-label="Remove row"
                className="grid h-8 w-8 shrink-0 place-items-center rounded text-faint hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addRow(gi)}
            className="ml-1 flex items-center gap-1 text-xs text-accent hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Add row
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="flex items-center gap-1.5 rounded border border-dashed border-line px-3 py-2 text-sm text-muted hover:border-faint hover:text-fg"
      >
        <Plus className="h-4 w-4" /> Add section
      </button>
    </div>
  );
}
