"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminCtx } from "./AdminContext";
import {
  Eye,
  EyeOff,
  PackageX,
  PackageCheck,
  Pencil,
  Copy,
  Star,
  StarOff,
  Trash2,
  Loader2,
  GripVertical,
} from "lucide-react";

/**
 * Floating per-product admin toolbar.
 *
 * Sits in the top-right corner of each product card (positioned by the
 * parent — this component just renders the toolbar). Hidden when the
 * admin is in preview-as-customer mode.
 *
 * All mutations are optimistic: the icon flips immediately, then we hit
 * the API. On error we router.refresh() to re-sync. We rely on the
 * server response for shape correctness.
 */
export default function AdminProductOverlay({
  product,
  onChange,
  dragHandleProps,
}) {
  const router = useRouter();
  const ctx = useAdminCtx();
  const [busy, setBusy] = useState(null); // which action is in flight
  const [localProduct, setLocalProduct] = useState(product);

  if (!ctx || ctx.previewAsCustomer) return null;
  const p = localProduct;

  // ── helpers ────────────────────────────────────────────────────
  async function patch(updates, action) {
    setBusy(action);
    // optimistic
    const next = { ...p, ...updates };
    setLocalProduct(next);
    onChange?.(next);
    try {
      const res = await fetch(`/api/admin/store/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Failed");
    } catch (err) {
      console.error(err);
      // revert + force re-fetch
      setLocalProduct(p);
      onChange?.(p);
      ctx.refresh();
      alert(`Couldn't update product: ${err.message}`);
    } finally {
      setBusy(null);
    }
  }

  async function destroy() {
    if (
      !confirm(
        `Delete "${p.name}"? This cannot be undone. The images will be removed too.`
      )
    )
      return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/store/products/${p.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Failed");
      ctx.refresh();
    } catch (err) {
      console.error(err);
      alert(`Couldn't delete product: ${err.message}`);
      setBusy(null);
    }
  }

  async function duplicate() {
    setBusy("duplicate");
    try {
      const res = await fetch("/api/admin/store/products/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id }),
      });
      if (!res.ok) throw new Error((await res.json())?.error || "Failed");
      ctx.refresh();
    } catch (err) {
      console.error(err);
      alert(`Couldn't duplicate: ${err.message}`);
    } finally {
      setBusy(null);
    }
  }

  function edit() {
    // Until we wire a side drawer with images, route to the existing
    // edit page. The page already exists and handles image uploads.
    router.push(`/admin/manage-store/products/edit/${p.id}`);
  }

  // ── render ─────────────────────────────────────────────────────
  const IconBtn = ({ onClick, title, action, children, danger }) => {
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
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all ${
          danger
            ? "bg-[#3a1a1a]/85 text-[#ff8888] hover:bg-[#5a1a1a]"
            : "bg-[#1a1410]/85 text-[#ff914d] hover:bg-[#2a1f17]"
        } ${isBusy ? "opacity-60" : ""}`}
        disabled={!!busy}
      >
        {isBusy ? (
          <Loader2 size={13} className="animate-spin" strokeWidth={1.8} />
        ) : (
          children
        )}
      </button>
    );
  };

  return (
    <div
      className="absolute right-2 top-2 z-20 flex flex-col gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      {dragHandleProps && (
        <button
          type="button"
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
          aria-label="Drag to reorder product"
          className="inline-flex h-7 w-7 cursor-grab active:cursor-grabbing items-center justify-center rounded-full bg-[#1a1410]/85 text-[#ff914d] backdrop-blur-md hover:bg-[#2a1f17]"
        >
          <GripVertical size={13} strokeWidth={1.8} />
        </button>
      )}
      <IconBtn
        onClick={() => patch({ is_hidden: !p.is_hidden }, "hide")}
        action="hide"
        title={p.is_hidden ? "Show on shop" : "Hide from shop"}
      >
        {p.is_hidden ? (
          <EyeOff size={13} strokeWidth={1.8} />
        ) : (
          <Eye size={13} strokeWidth={1.8} />
        )}
      </IconBtn>
      <IconBtn
        onClick={() => patch({ sold_out: !p.sold_out }, "soldout")}
        action="soldout"
        title={p.sold_out ? "Mark as available" : "Mark as sold out"}
      >
        {p.sold_out ? (
          <PackageX size={13} strokeWidth={1.8} />
        ) : (
          <PackageCheck size={13} strokeWidth={1.8} />
        )}
      </IconBtn>
      <IconBtn
        onClick={() => patch({ is_featured: !p.is_featured }, "featured")}
        action="featured"
        title={p.is_featured ? "Unfeature" : "Pin to top"}
      >
        {p.is_featured ? (
          <Star size={13} strokeWidth={1.8} fill="currentColor" />
        ) : (
          <StarOff size={13} strokeWidth={1.8} />
        )}
      </IconBtn>
      <IconBtn onClick={edit} action="edit" title="Edit product">
        <Pencil size={13} strokeWidth={1.8} />
      </IconBtn>
      <IconBtn onClick={duplicate} action="duplicate" title="Duplicate">
        <Copy size={13} strokeWidth={1.8} />
      </IconBtn>
      <IconBtn onClick={destroy} action="delete" title="Delete" danger>
        <Trash2 size={13} strokeWidth={1.8} />
      </IconBtn>
    </div>
  );
}

/**
 * Small badge stack rendered on top of the card image to show admin-only
 * state (hidden / sold-out / featured). Visible to admins regardless of
 * preview mode? No — also gated by preview-as-customer because it's
 * admin chrome.
 */
export function AdminProductBadges({ product }) {
  const ctx = useAdminCtx();
  if (!ctx || ctx.previewAsCustomer) return null;
  if (!product?.is_hidden && !product?.sold_out && !product?.is_featured)
    return null;

  return (
    <div className="absolute left-2 top-2 z-20 flex flex-col gap-1.5">
      {product.is_hidden && (
        <span className="rounded-full bg-[#1a1410]/85 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-[#ff914d] backdrop-blur">
          Hidden
        </span>
      )}
      {product.sold_out && (
        <span className="rounded-full bg-[#3a1a1a]/85 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-[#ff8888] backdrop-blur">
          Sold out
        </span>
      )}
      {product.is_featured && (
        <span className="rounded-full bg-[#ff914d]/90 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-[#1a1410] backdrop-blur">
          Featured
        </span>
      )}
    </div>
  );
}
