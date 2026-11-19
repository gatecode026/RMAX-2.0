"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

export interface FamilyOptionDef {
  key: string;
  label: string;
  values: { value: string; label: string }[];
}
interface FamilyRow {
  _id: string;
  name: string;
  slug: string;
  options: FamilyOptionDef[];
  defaultProduct?: string;
  members: { _id: string; name: string; status: string; variantOptions?: Record<string, string> }[];
}

const input = "w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none";
const btn = "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-[#10469B] hover:bg-slate-50 disabled:opacity-50";

/**
 * "Family & options" block of the product form. A product is standalone, or a variant of a family (a group sold as
 * one storefront card). Families define the options (Size, Colour…); this product picks one value of each.
 */
export function FamilyPicker({
  productId,
  familyId,
  onFamily,
  variantOptions,
  onOptions,
  makeDefault,
  onMakeDefault,
}: {
  productId?: string;
  familyId: string;
  onFamily: (id: string) => void;
  variantOptions: Record<string, string>;
  onOptions: (o: Record<string, string>) => void;
  makeDefault: boolean;
  onMakeDefault: (v: boolean) => void;
}) {
  const [families, setFamilies] = useState<FamilyRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newOptions, setNewOptions] = useState([{ label: "", values: "" }]);
  const [addValue, setAddValue] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    fetch("/api/admin/families")
      .then((r) => r.json())
      .then((j) => j.success && setFamilies(j.families))
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const family = families.find((f) => f._id === familyId);

  async function call(url: string, method: string, body: unknown) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Request failed");
      return json;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function createFamily() {
    const options = newOptions
      .filter((o) => o.label.trim())
      .map((o) => ({ label: o.label, values: o.values.split(",").map((v) => ({ label: v.trim() })).filter((v) => v.label) }));
    const json = await call("/api/admin/families", "POST", { name: newName, options });
    if (!json) return;
    await load();
    onFamily(json.family._id);
    onOptions({});
    setCreating(false);
    setNewName("");
    setNewOptions([{ label: "", values: "" }]);
  }

  async function addOptionValue(o: FamilyOptionDef) {
    const label = (addValue[o.key] ?? "").trim();
    if (!family || !label) return;
    const options = family.options.map((x) => (x.key === o.key ? { ...x, values: [...x.values, { label }] } : x));
    const json = await call(`/api/admin/families/${family._id}`, "PATCH", { options });
    if (!json) return;
    setAddValue({ ...addValue, [o.key]: "" });
    await load();
    // select the value just added (its id is derived from the label on the server)
    const fresh = json.family.options.find((x: FamilyOptionDef) => x.key === o.key);
    const added = fresh?.values[fresh.values.length - 1];
    if (added) onOptions({ ...variantOptions, [o.key]: added.value });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Leave as <b>Standalone</b> for a product sold on its own. Choose a family to sell this product as one option of a group (for example
        Size or Colour); the storefront shows one card for the family and a dropdown per option.
      </p>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <select
          className={input}
          value={creating ? "__new" : familyId}
          onChange={(e) => {
            if (e.target.value === "__new") {
              setCreating(true);
              return;
            }
            setCreating(false);
            onFamily(e.target.value);
            onOptions({});
          }}
        >
          <option value="">Standalone product (no family)</option>
          {families.map((f) => (
            <option key={f._id} value={f._id}>
              {f.name} — {f.options.map((o) => o.label).join(" × ")}
            </option>
          ))}
          <option value="__new">+ Create a new family…</option>
        </select>
      </div>

      {creating && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <input className={input} placeholder="Family name (e.g. Water Bottle)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          {newOptions.map((o, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
              <input
                className={input}
                placeholder="Option (e.g. Colour)"
                value={o.label}
                onChange={(e) => setNewOptions(newOptions.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              />
              <input
                className={input}
                placeholder="Values, comma separated (e.g. Red, Blue)"
                value={o.values}
                onChange={(e) => setNewOptions(newOptions.map((x, j) => (j === i ? { ...x, values: e.target.value } : x)))}
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => setNewOptions([...newOptions, { label: "", values: "" }])}>
              <Plus className="size-4" /> Add option
            </button>
            <button type="button" className={btn} disabled={busy || !newName.trim()} onClick={createFamily}>
              Create family
            </button>
            <button type="button" className={btn} onClick={() => setCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {family && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {family.options.map((o) => (
              <div key={o.key}>
                <label className="mb-1 block text-xs font-bold text-slate-700">{o.label} of this product *</label>
                <select className={input} value={variantOptions[o.key] ?? ""} onChange={(e) => onOptions({ ...variantOptions, [o.key]: e.target.value })}>
                  <option value="" disabled>
                    Choose {o.label.toLowerCase()}…
                  </option>
                  {o.values.map((v) => {
                    const taken = family.members.find(
                      (m) => m._id !== productId && m.status !== "archived" && family.options.every((x) => x.key === o.key || m.variantOptions?.[x.key] === variantOptions[x.key]) && m.variantOptions?.[o.key] === v.value,
                    );
                    return (
                      <option key={v.value} value={v.value}>
                        {v.label}
                        {taken && Object.keys(variantOptions).length >= family.options.length - 1 ? ` (used by ${taken.name})` : ""}
                      </option>
                    );
                  })}
                </select>
                <div className="mt-1.5 flex gap-2">
                  <input
                    className={input}
                    placeholder={`New ${o.label.toLowerCase()} value`}
                    value={addValue[o.key] ?? ""}
                    onChange={(e) => setAddValue({ ...addValue, [o.key]: e.target.value })}
                  />
                  <button type="button" className={btn} disabled={busy || !(addValue[o.key] ?? "").trim()} onClick={() => addOptionValue(o)}>
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={makeDefault || (Boolean(productId) && family.defaultProduct === productId)} onChange={(e) => onMakeDefault(e.target.checked)} />
            Default variant — the family card on the storefront opens this product first
          </label>
          <p className="text-xs text-slate-500">
            Family members: {family.members.length ? family.members.map((m) => `${m.name} (${m.status})`).join(", ") : "none yet"}. Two live products cannot share the same combination.
          </p>
        </div>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
