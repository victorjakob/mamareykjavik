"use client";

/**
 * ProductDetails
 * --------------
 * The Details table on the product page: free-form Label / Value rows that
 * you write yourself. "Material / 100% carbon", "Weight / approx. 540 g" —
 * whatever the product needs. Leave it empty and the product page shows no
 * Details table at all.
 *
 * The rows live in local state rather than being read back out of the form.
 * react-hook-form's setValue() doesn't reliably re-render a watcher for a
 * name that was never registered to an input, which is why an earlier version
 * of this silently did nothing when you pressed "Add row" on a new product.
 * The form still gets every change, so the value submits normally.
 */

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const MAX_DETAIL_ROWS = 30;

/**
 * Pull "Label: value" lines out of the description, so a product that already
 * lists its specs in the description can be lifted into the table in one
 * click instead of being retyped row by row.
 */
export function detailsFromDescription(description) {
  const text =
    typeof description === "string" ? description.replace(/\r\n/g, "\n") : "";
  const rows = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!/^[^:]{2,44}:\s*\S/.test(trimmed)) continue;
    const at = trimmed.indexOf(":");
    rows.push({
      label: trimmed.slice(0, at).trim(),
      value: trimmed.slice(at + 1).trim(),
    });
  }
  return rows.slice(0, MAX_DETAIL_ROWS);
}

export default function ProductDetails({
  register,
  setValue,
  watch,
  initialRows,
  disabled,
}) {
  const [rows, setRows] = useState(() =>
    Array.isArray(initialRows) ? initialRows : []
  );

  // Keep the name in the form's values even before anything is typed.
  register("details");

  const description = watch("description") || "";

  const write = (next) => {
    const capped = next.slice(0, MAX_DETAIL_ROWS);
    setRows(capped);
    setValue("details", capped, { shouldDirty: true });
  };

  const updateRow = (index, key, value) =>
    write(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  const addRow = () => write([...rows, { label: "", value: "" }]);

  const removeRow = (index) => write(rows.filter((_, i) => i !== index));

  const moveRow = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    write(next);
  };

  const suggested = rows.length === 0 ? detailsFromDescription(description) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Details
          </label>
          <p className="mt-1 text-xs text-slate-500">
            One row per fact — Material, Weight, Pitch, Size, Ingredients,
            anything. These become the Details table on the product page. Leave
            it empty and no table is shown.
          </p>
        </div>
        <button
          type="button"
          onClick={addRow}
          disabled={disabled || rows.length >= MAX_DETAIL_ROWS}
          className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
        >
          + Add row
        </button>
      </div>

      {suggested.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-600">
            Found {suggested.length} &ldquo;Label: value&rdquo;{" "}
            {suggested.length === 1 ? "line" : "lines"} in the description.
          </span>
          <button
            type="button"
            onClick={() => write(suggested)}
            disabled={disabled}
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-emerald-50"
          >
            Fill the table from them
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
          No details yet — press &ldquo;Add row&rdquo; to start.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-start sm:gap-3"
            >
              <input
                type="text"
                value={row.label || ""}
                onChange={(event) =>
                  updateRow(index, "label", event.target.value)
                }
                disabled={disabled}
                placeholder="Material"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 sm:w-52"
              />
              <textarea
                value={row.value || ""}
                onChange={(event) =>
                  updateRow(index, "value", event.target.value)
                }
                disabled={disabled}
                rows={1}
                placeholder="100% carbon"
                className="w-full flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveRow(index, -1)}
                  disabled={disabled || index === 0}
                  aria-label="Move up"
                  className="h-9 w-9 rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-slate-800 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveRow(index, 1)}
                  disabled={disabled || index === rows.length - 1}
                  aria-label="Move down"
                  className="h-9 w-9 rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-slate-800 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={disabled}
                  aria-label="Remove row"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-[#c05a1a]"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
