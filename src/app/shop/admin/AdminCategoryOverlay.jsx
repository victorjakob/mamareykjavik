"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminCtx } from "./AdminContext";
import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
  ExternalLink,
} from "lucide-react";

/**
 * Floating per-category admin toolbar shown next to a chapter tab.
 *
 * `dragHandleProps` is forwarded from the @dnd-kit listeners so the
 * grip icon becomes the drag handle (the tab itself stays clickable).
 *
 * Hidden when previewing as customer.
 */
export default function AdminCategoryOverlay({
  category,
  dragHandleProps,
  onChange,
}) {
  const router = useRouter();
  const ctx = useAdminCtx();
  const [busy, setBusy] = useState(null);

  if (!ctx || ctx.previewAsCustomer) return null;
  // Special internal categories (giftcard pseudo-category) shouldn't be
  // editable as DB rows — they don't have one.
  if (category?._isGiftCard) return null;

  async function patch(updates, action) {
    setBusy(action);
    onChange?.({ ...category, ...updates });
    try {
      const res = await fetch(`/api/admin/store/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Failed");
      ctx.refresh();
    } catch (err) {
      console.error(err);
      alert(`Couldn't update category: ${err.message}`);
      onChange?.(category);
    } finally {
      setBusy(null);
    }
  }

  async function destroy() {
    if (
      !confirm(
        `Delete the "${category.name}" chapter?\n\n` +
          `Any products in this chapter will be moved to the hidden ` +
          `"Uncategorized" bucket and won't appear on the shop until you ` +
          `re-categorize them. This can't be undone.`
      )
    )
      return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/store/categories/${category.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Failed");
      ctx.refresh();
    } catch (err) {
      console.error(err);
      alert(`Couldn't delete: ${err.message}`);
      setBusy(null);
    }
  }

  function rename() {
    const next = prompt(`Rename "${category.name}" to:`, category.name);
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === category.name) return;
    patch({ name: trimmed }, "rename");
  }

  function fullEdit() {
    router.push(`/admin/manage-store/categories/edit/${category.id}`);
  }

  const Btn = ({ onClick, title, action, children, danger }) => {
    const isBusy = busy === action;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (busy) return;
          onClick();
        }}
        title={title}
        aria-label={title}
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition-all ${
          danger
            ? "bg-[#3a1a1a]/85 text-[#ff8888] hover:bg-[#5a1a1a]"
            : "bg-[#1a1410]/85 text-[#ff914d] hover:bg-[#2a1f17]"
        } ${isBusy ? "opacity-60" : ""}`}
        disabled={!!busy}
      >
        {isBusy ? (
          <Loader2 size={11} className="animate-spin" strokeWidth={1.8} />
        ) : (
          children
        )}
      </button>
    );
  };

  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      {dragHandleProps && (
        <button
          type="button"
          {...dragHandleProps}
          title="Drag to reorder"
          aria-label="Drag to reorder category"
          className="inline-flex h-6 w-6 cursor-grab active:cursor-grabbing items-center justify-center rounded-full bg-[#1a1410]/70 text-[#ff914d] hover:bg-[#1a1410]"
        >
          <GripVertical size={11} strokeWidth={1.8} />
        </button>
      )}
      <Btn
        onClick={() => patch({ is_hidden: !category.is_hidden }, "hide")}
        action="hide"
        title={
          category.is_hidden ? "Show this chapter" : "Hide this chapter"
        }
      >
        {category.is_hidden ? (
          <EyeOff size={11} strokeWidth={1.8} />
        ) : (
          <Eye size={11} strokeWidth={1.8} />
        )}
      </Btn>
      <Btn onClick={rename} action="rename" title="Rename">
        <Pencil size={11} strokeWidth={1.8} />
      </Btn>
      <Btn onClick={fullEdit} action="full" title="Open full edit page">
        <ExternalLink size={11} strokeWidth={1.8} />
      </Btn>
      <Btn onClick={destroy} action="delete" title="Delete chapter" danger>
        <Trash2 size={11} strokeWidth={1.8} />
      </Btn>
    </div>
  );
}
