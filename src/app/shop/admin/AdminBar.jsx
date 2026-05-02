"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminCtx } from "./AdminContext";
import {
  Eye,
  EyeOff,
  Plus,
  FolderPlus,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react";

/**
 * Admin-only floating button anchored to the bottom-right corner.
 *
 * Was originally a top sticky bar, but the navbar pill, language
 * toggle, and cart icon all live up there — this just overlapped them.
 * Bottom-right keeps it out of every page's chrome.
 *
 * Closed: a single round Sparkles button.
 * Open:   the button stays put and a vertical menu fans out *upward*
 *         with the actions.
 *
 * In preview-as-customer mode the whole thing collapses to a tiny
 * "Exit preview" pill so the page reads as a customer would see it.
 */
export default function AdminBar() {
  const router = useRouter();
  const ctx = useAdminCtx();
  const [open, setOpen] = useState(false);
  if (!ctx) return null;

  const { previewAsCustomer, setPreviewAsCustomer } = ctx;

  // Preview mode: just a small restore pill in the corner. Sits above
  // the floating contact button (which is at bottom-4/6 right-4/6,
  // z-9999, ~56px tall).
  if (previewAsCustomer) {
    return (
      <button
        onClick={() => setPreviewAsCustomer(false)}
        className="fixed bottom-24 right-5 z-[10000] inline-flex items-center gap-2 rounded-full bg-[#1a1410] px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-[#ff914d] shadow-lg hover:bg-[#2a1f17]"
        title="Exit preview-as-customer"
      >
        <Eye size={14} strokeWidth={1.6} />
        Exit preview
      </button>
    );
  }

  const actions = [
    {
      label: "New product",
      icon: Plus,
      onClick: () => router.push("/admin/manage-store/products/create"),
    },
    {
      label: "New category",
      icon: FolderPlus,
      onClick: () => router.push("/admin/manage-store/categories/new"),
    },
    {
      label: "Full manager",
      icon: ExternalLink,
      onClick: () => router.push("/admin/manage-store"),
    },
    {
      label: "Preview as customer",
      icon: EyeOff,
      onClick: () => {
        setPreviewAsCustomer(true);
        setOpen(false);
      },
    },
  ];

  return (
    // Lifted above the floating contact button (which sits at bottom-4/6
    // right-4/6 with z-9999 and is ~56px tall). bottom-24 puts our trigger
    // ~96px from the screen edge so they don't collide.
    <div className="fixed bottom-24 right-5 z-[10000] pointer-events-none">
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        {/* Action stack — fans up from the trigger button */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-end gap-2"
            >
              <span className="rounded-full bg-[#1a1410]/95 px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-[#ff914d] backdrop-blur shadow-md">
                Admin · Shop
              </span>
              {actions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={a.onClick}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1a1410]/95 pl-3 pr-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#ff914d] backdrop-blur shadow-md hover:bg-[#2a1f17] transition-colors"
                >
                  <a.icon size={13} strokeWidth={1.6} />
                  {a.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trigger — round button always at bottom-right */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close admin menu" : "Open admin menu"}
          className={`relative h-12 w-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
            open
              ? "bg-[#ff914d] text-[#1a1410]"
              : "bg-[#1a1410] text-[#ff914d] hover:bg-[#2a1f17]"
          }`}
          title="Shop admin"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "x" : "sparkle"}
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="inline-flex items-center justify-center"
            >
              {open ? (
                <X size={16} strokeWidth={2} />
              ) : (
                <Sparkles size={16} strokeWidth={1.8} />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
