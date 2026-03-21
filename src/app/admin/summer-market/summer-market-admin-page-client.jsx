"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  SUMMER_MARKET_ALL_DATES as ALL_MARKET_DATES,
  SUMMER_MARKET_PRICING,
  SUMMER_MARKET_WEEKEND_GROUPS as WEEKEND_GROUPS,
  buildAcceptanceEmailPlainBody,
  calculateSummerMarketVendorEstimate,
  formatKr,
} from "@/lib/summerMarketPricing";
import {
  Calendar,
  CircleDollarSign,
  ExternalLink,
  Eye,
  Instagram,
  PlugZap,
  Search,
  Share2,
  Square,
  X,
} from "lucide-react";

const PAYMENT_OPTIONS = [
  { value: "unpaid", label: "Not paid" },
  { value: "confirmation_paid", label: "Confirmation Paid" },
  { value: "fully_paid", label: "Fully Paid" },
];

const TERMS_URL =
  "https://docs.google.com/document/d/1sFTWvTh6H2EtNstGS8F7g_ne5gFDMzrykjjNLzdLkUM/edit?usp=sharing";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

/** @param {string | undefined | null} val */
function getInstagramOrWebsiteHref(val) {
  if (val == null) return null;
  const s = String(val).trim();
  if (!s) return null;
  if (s.startsWith("@")) return `https://instagram.com/${s.slice(1)}`;
  if (s.startsWith("http")) return s;
  return `https://${s}`;
}

function normalizedMeta(app) {
  const meta = app?.admin_meta || {};
  return {
    applicationStatus:
      app?.status === "accepted" || app?.status === "rejected"
        ? app.status
        : meta.applicationStatus === "accepted" ||
            meta.applicationStatus === "rejected"
          ? meta.applicationStatus
        : "pending",
    paymentStatus:
      app?.payment_status === "confirmation_paid" || app?.payment_status === "fully_paid"
        ? app.payment_status
        : meta.paymentStatus === "confirmation_paid" ||
            meta.paymentStatus === "fully_paid"
          ? meta.paymentStatus
        : "unpaid",
    acceptedAt: app?.accepted_at || meta.acceptedAt || null,
    acceptanceEmailSentAt:
      app?.acceptance_email_sent_at || meta.acceptanceEmailSentAt || null,
    acceptedBy: app?.accepted_by || meta.acceptedBy || null,
    isConfirmed:
      typeof app?.is_confirmed === "boolean"
        ? app.is_confirmed
        : Boolean(meta.isConfirmed),
    confirmedAt: app?.confirmed_at || meta.confirmedAt || null,
    amountPaidKr:
      typeof meta.amountPaidKr === "number" && Number.isFinite(meta.amountPaidKr)
        ? meta.amountPaidKr
        : null,
    paymentEntries: (() => {
      const arr = meta.paymentEntries;
      if (!Array.isArray(arr)) return [];
      return arr.filter(
        (e) => typeof e?.amountKr === "number" && Number.isFinite(e.amountKr)
      );
    })(),
    paymentNotes: typeof meta.paymentNotes === "string" ? meta.paymentNotes : "",
  };
}

function statusPill(status) {
  if (status === "accepted") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
  if (status === "rejected") {
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
  }
  return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
}

function statusLabel(status) {
  if (status === "rejected") return "declined";
  return status;
}

function paymentPill(status) {
  if (status === "fully_paid") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
  if (status === "confirmation_paid") {
    return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
  }
  return "bg-rose-50 text-rose-400 ring-1 ring-rose-100";
}

function bookingBannerForDate(app, selectedDate) {
  const selected = app?.selected_dates || [];
  const weekend = WEEKEND_GROUPS.find((group) => group.includes(selectedDate));
  if (!weekend) return "Only today";

  const countInWeekend = weekend.filter((date) => selected.includes(date)).length;
  if (countInWeekend >= 3) return "All Weekend";
  if (countInWeekend === 2) return "2 days";
  return "Only today";
}

function weekendLabel(group) {
  const first = (group?.[0] || "").split(" ");
  const last = (group?.[2] || "").split(" ");
  const month = first[1] || "";
  const startDay = first[2] || "";
  const endDay = last[2] || "";
  return `${month} ${startDay}-${endDay}`;
}

function PaymentSelect({ value, onChange, disabled }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700"
    >
      {PAYMENT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function parseAmountInputKr(raw) {
  const t = String(raw ?? "")
    .trim()
    .replace(/\s/g, "");
  if (!t) return { kind: "empty" };
  const n = parseInt(t, 10);
  if (!Number.isFinite(n)) return { kind: "invalid" };
  return { kind: "ok", value: Math.max(0, n) };
}

function PaymentPricingModal({ app, onClose, onSave, busy }) {
  const estimate = useMemo(
    () =>
      calculateSummerMarketVendorEstimate(
        app?.selected_dates,
        Boolean(app?.tablecloth_rental)
      ),
    [app?.selected_dates, app?.tablecloth_rental]
  );

  const meta = app ? normalizedMeta(app) : null;
  const [addAmountInput, setAddAmountInput] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");

  useEffect(() => {
    if (!app) return;
    const m = normalizedMeta(app);
    setAddAmountInput("");
    setNotes(m.paymentNotes || "");
    setPaymentStatus(m.paymentStatus || "unpaid");
  }, [app?.id]);

  if (!app || !meta) return null;

  const parsedAdd = parseAmountInputKr(addAmountInput);
  const entries = meta.paymentEntries || [];
  const totalPaid =
    entries.length > 0
      ? entries.reduce((s, e) => s + (e.amountKr || 0), 0)
      : (meta.amountPaidKr ?? 0);
  const paymentLines = (() => {
    if (entries.length > 0) {
      return entries.map((e, i) => ({
        key: `e-${i}-${e.paidAt || ""}-${e.amountKr}`,
        amountKr: e.amountKr || 0,
        dateLabel: e.paidAt
          ? new Date(e.paidAt).toLocaleDateString("is-IS", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—",
      }));
    }
    if (totalPaid > 0) {
      return [{ key: "legacy", amountKr: totalPaid, dateLabel: "—" }];
    }
    return [];
  })();
  const grand = estimate.grandTotalKr;

  const handleAddPayment = async () => {
    if (parsedAdd.kind !== "ok" || parsedAdd.value <= 0) return;
    const base = entries.length > 0 ? [...entries] : [];
    if (base.length === 0 && totalPaid > 0) {
      base.push({ amountKr: totalPaid, paidAt: null });
    }
    const newEntries = [
      ...base,
      { amountKr: parsedAdd.value, paidAt: new Date().toISOString() },
    ];
    await onSave({
      paymentEntries: newEntries,
      paymentNotes: notes.trim(),
      paymentStatus,
      stayOpen: true,
    });
    setAddAmountInput("");
  };

  const handleResetPaid = async () => {
    await onSave({
      paymentEntries: [],
      amountPaidKr: 0,
      paymentNotes: notes.trim(),
      paymentStatus,
    });
  };

  const handleSaveNotesAndStatus = async () => {
    await onSave({
      paymentNotes: notes.trim(),
      paymentStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment &amp; pricing</h2>
            <p className="mt-1 text-sm text-gray-600">
              {app.brand_name} · {app.contact_person}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
            Rates &amp; docs
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-amber-900/75">
            Booth: <strong>{formatKr(SUMMER_MARKET_PRICING.singleDayKr)}</strong> per day,{" "}
            <strong>{formatKr(SUMMER_MARKET_PRICING.weekendBundleKr)}</strong> full Fri–Sun weekend.
            Tablecloth: one fee {formatKr(SUMMER_MARKET_PRICING.tableclothRentalKr)}. Confirmation:{" "}
            {formatKr(SUMMER_MARKET_PRICING.confirmationFeePerWeekendKr)} per weekend that includes a
            selected day (same price for 1–3 days in that weekend).
          </p>
          <Link
            href={TERMS_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-900 underline-offset-2 hover:underline"
          >
            Terms &amp; agreements (Google Doc)
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Line items (estimate)
          </p>
          {(app.selected_dates || []).length === 0 && !app.tablecloth_rental ? (
            <p className="mt-2 text-sm text-gray-600">No dates — no booth estimate.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {estimate.lines.map((line, idx) => (
                <li
                  key={`${line.label}-${idx}`}
                  className="flex items-start justify-between gap-3 text-sm text-gray-800"
                >
                  <span className="min-w-0 flex-1 leading-snug">{line.label}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-gray-900">
                    {formatKr(line.amountKr)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 border-t border-gray-200 pt-3 text-sm">
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Grand total (incl. VSK)</span>
              <span className="tabular-nums">{formatKr(grand)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/90">
            Overview
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Grand total (incl. VSK)</span>
              <span className="tabular-nums">{formatKr(grand)}</span>
            </div>
            <div>
              <p className="mb-2 font-semibold text-emerald-800">Paid</p>
              {paymentLines.length === 0 ? (
                <p className="text-gray-500">None recorded.</p>
              ) : (
                <ul className="space-y-1">
                  {paymentLines.map((entry, idx) => (
                    <li
                      key={entry.key}
                      className="flex justify-between gap-3 text-emerald-800"
                    >
                      <span className="text-gray-600">{entry.dateLabel}</span>
                      <span className="tabular-nums font-medium">
                        {formatKr(entry.amountKr)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {paymentLines.length > 0 ? (
                <div className="mt-2 flex justify-between border-t border-emerald-200/60 pt-2 font-semibold text-emerald-900">
                  <span>Left to pay</span>
                  <span className="tabular-nums">{formatKr(Math.max(0, grand - totalPaid))}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Add payment
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Enter an amount and click Add to record it. You can add multiple times.
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <div className="min-w-[140px]">
              <input
                type="text"
                inputMode="numeric"
                value={addAmountInput}
                onChange={(e) => setAddAmountInput(e.target.value)}
                placeholder="e.g. 3500"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm tabular-nums outline-none ring-amber-200 focus:ring-2"
              />
            </div>
            <button
              type="button"
              onClick={handleAddPayment}
              disabled={busy || parsedAdd.kind !== "ok" || (parsedAdd.kind === "ok" && parsedAdd.value <= 0)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {busy ? "Adding…" : "Add"}
            </button>
          </div>
          {parsedAdd.kind === "invalid" ? (
            <p className="mt-1 text-xs text-rose-600">Enter a whole number.</p>
          ) : null}
          {totalPaid > 0 ? (
            <button
              type="button"
              onClick={handleResetPaid}
              disabled={busy}
              className="mt-2 text-xs text-slate-500 underline hover:text-rose-600 disabled:opacity-60"
            >
              Reset paid to 0
            </button>
          ) : null}

          <label className="mt-4 block text-xs font-medium text-gray-700">Payment status</label>
          <div className="mt-1">
            <PaymentSelect
              value={paymentStatus}
              onChange={setPaymentStatus}
              disabled={busy}
            />
          </div>

          <label className="mt-3 block text-xs font-medium text-gray-700">Internal notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Transfer ref, date, partial payment…"
            className="mt-1 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-amber-200 focus:ring-2"
          />
          <button
            type="button"
            onClick={handleSaveNotesAndStatus}
            disabled={busy}
            className="mt-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Save notes &amp; status
          </button>
        </div>


        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkEditModal({ app, onClose, onSave, busy }) {
  const [value, setValue] = useState("");
  useEffect(() => {
    if (app) setValue(app.instagram_or_website?.trim() || "");
  }, [app?.id]);

  if (!app) return null;
  const href = getInstagramOrWebsiteHref(value.trim());
  const isIg = value.trim().startsWith("@");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200">
        <h3 className="text-base font-bold text-gray-900">Instagram / website</h3>
        <p className="mt-1 text-xs text-gray-500">
          {app.brand_name} · {app.contact_person}
        </p>
        <p className="mt-3 text-xs text-gray-600">
          Use <strong>@handle</strong> for Instagram (e.g. @inja.yogawarrior) or a full URL for a website.
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="@handle or https://..."
          className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none ring-amber-200 focus:ring-2"
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${
                isIg
                  ? "bg-emerald-600 text-white"
                  : "bg-sky-600 text-white"
              }`}
            >
              {isIg ? <Instagram className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
              Open link
            </a>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(value)}
            disabled={busy}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DatesEditModal({ app, onClose, onSave, busy }) {
  const [dates, setDates] = useState([]);
  const [confirm, setConfirm] = useState(null); // { action: 'remove' | 'add', date: string }
  useEffect(() => {
    if (app) setDates([...(app.selected_dates || [])]);
  }, [app?.id]);

  if (!app) return null;
  const selectedSet = new Set(dates);
  const availableToAdd = ALL_MARKET_DATES.filter((d) => !selectedSet.has(d));

  const removeDate = (date) => {
    setDates((prev) => prev.filter((d) => d !== date));
  };

  const addDate = (date) => {
    if (!selectedSet.has(date)) {
      setDates((prev) =>
        [...prev, date].sort(
          (a, b) => ALL_MARKET_DATES.indexOf(a) - ALL_MARKET_DATES.indexOf(b)
        )
      );
    }
  };

  const handleConfirm = () => {
    if (confirm?.action === "remove") removeDate(confirm.date);
    else if (confirm?.action === "add") addDate(confirm.date);
    setConfirm(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200">
        <h3 className="text-base font-bold text-gray-900">Market dates</h3>
        <p className="mt-1 text-xs text-gray-500">
          {app.brand_name} · {app.contact_person}
        </p>
        <p className="mt-3 text-xs text-gray-600">
          Add or remove dates. Use when a vendor cancels a day or adds one by phone.
        </p>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Signed up for
          </p>
          {dates.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">No dates selected.</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {dates.map((date) => (
                <li
                  key={date}
                  className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-900">{date}</span>
                  <button
                    type="button"
                    onClick={() => setConfirm({ action: "remove", date })}
                    className="rounded p-1 text-rose-600 hover:bg-rose-50"
                    title="Remove date"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Add a date
          </p>
          {availableToAdd.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">All market dates already selected.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {availableToAdd.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => setConfirm({ action: "add", date })}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
                >
                  + {date}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(dates)}
            disabled={busy}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {confirm ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {confirm.action === "remove"
                ? `Remove ${confirm.date}?`
                : `Add ${confirm.date}?`}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {confirm.action === "remove"
                ? "The vendor will no longer be signed up for this date."
                : "The vendor will be signed up for this date."}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
              >
                Yes, confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ApplicationDetailsModal({ app, onClose, onDelete, onEditLink }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const priceEstimate = useMemo(
    () =>
      calculateSummerMarketVendorEstimate(
        app?.selected_dates,
        Boolean(app?.tablecloth_rental)
      ),
    [app?.selected_dates, app?.tablecloth_rental]
  );

  if (!app) return null;
  const meta = normalizedMeta(app);

  const copyShareLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/summer-market/applications/${app.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete.");
      onDelete(app.id);
      onClose();
    } catch (e) {
      setDeleteError(e?.message || "Failed to delete.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{app.brand_name}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {app.contact_person} · {app.email} · {app.phone_whatsapp}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                {deleteError ? (
                  <span className="text-xs text-rose-600">{deleteError}</span>
                ) : null}
                <span className="text-sm font-medium text-gray-700">Delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  type="button"
                  onClick={() => { setConfirmDelete(false); setDeleteError(""); }}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={copyShareLink}
              title="Copy link — opens this application for other admins"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              <Share2 className="h-4 w-4" />
              {linkCopied ? "Copied!" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Application status
            </p>
            <p className="mt-2 text-sm font-medium text-gray-800">
              {statusLabel(meta.applicationStatus)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Accepted at: {formatDateTime(meta.acceptedAt)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Acceptance email: {formatDateTime(meta.acceptanceEmailSentAt)}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Payment & confirmation
            </p>
            <p className="mt-2 text-sm font-medium text-gray-800">{meta.paymentStatus}</p>
            <p className="mt-1 text-xs text-gray-500">
              Confirmation paid:{" "}
              {meta.paymentStatus === "confirmation_paid" || meta.paymentStatus === "fully_paid"
                ? "Yes"
                : "No"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Full payment done: {meta.paymentStatus === "fully_paid" ? "Yes" : "No"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Product categories
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(app.product_categories || []).map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Selected dates
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(app.selected_dates || []).map((date) => (
              <span
                key={date}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200"
              >
                {date}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900/80">
            Estimated pricing (public vendor rates)
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-900/70">
            Booth: <strong>{formatKr(SUMMER_MARKET_PRICING.singleDayKr)}</strong> per day,{" "}
            <strong>{formatKr(SUMMER_MARKET_PRICING.weekendBundleKr)}</strong> for a full Fri–Sun
            weekend. Tablecloth: <strong>one fee</strong> (
            {formatKr(SUMMER_MARKET_PRICING.tableclothRentalKr)}) for all dates. Confirmation:{" "}
            <strong>{formatKr(SUMMER_MARKET_PRICING.confirmationFeePerWeekendKr)}</strong> per
            weekend (each Fri–Sun block with at least one selected day — same price for 1, 2, or 3
            days in that weekend). Multiple weekends add up.
          </p>
          {(app.selected_dates || []).length === 0 && !app.tablecloth_rental ? (
            <p className="mt-2 text-sm text-amber-900/80">No dates selected — no booth estimate.</p>
          ) : (
            <>
              <ul className="mt-3 space-y-1.5 border-t border-amber-200/60 pt-3">
                {priceEstimate.lines.map((line, idx) => (
                  <li
                    key={`${line.label}-${idx}`}
                    className="flex items-start justify-between gap-3 text-sm text-gray-800"
                  >
                    <span className="min-w-0 flex-1 leading-snug">{line.label}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-gray-900">
                      {formatKr(line.amountKr)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-amber-200/60 pt-3 text-sm">
                <div className="flex justify-between font-semibold text-gray-900">
                  <span>Grand total (incl. VSK)</span>
                  <span className="tabular-nums">{formatKr(priceEstimate.grandTotalKr)}</span>
                </div>
                {priceEstimate.confirmationWeekendCount > 0 ? (
                  <p className="mt-1 text-[11px] text-amber-900/65">
                    {priceEstimate.confirmationWeekendCount} weekend
                    {priceEstimate.confirmationWeekendCount !== 1 ? "s" : ""} ×{" "}
                    {formatKr(priceEstimate.confirmationFeePerWeekendKr)} confirmation
                  </p>
                ) : null}
              </div>
              {priceEstimate.unknownDates.length > 0 ? (
                <p className="mt-2 text-[11px] text-amber-900/80">
                  Some dates are outside the standard calendar — shown as single-day rate; verify
                  manually.
                </p>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Setup
            </p>
            <p className="mt-2 text-sm text-gray-700">
              Needs power: {app.needs_power ? "Yes" : "No"}
            </p>
            <p className="mt-1 text-sm text-gray-700">
              Tablecloth: {app.tablecloth_rental ? "Yes" : "No"}
            </p>
            {app.setup_notes ? (
              <p className="mt-2 text-sm text-gray-700">{app.setup_notes}</p>
            ) : null}
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Links & extras
            </p>
            <p className="mt-2 text-sm text-gray-700">
              Instagram/website:{" "}
              {(() => {
                const raw = app.instagram_or_website?.trim();
                if (!raw) {
                  return onEditLink ? (
                    <button
                      type="button"
                      onClick={() => onEditLink(app)}
                      className="text-amber-700 underline decoration-amber-700/40 underline-offset-2 hover:text-amber-900"
                    >
                      Add link
                    </button>
                  ) : (
                    "—"
                  );
                }
                const href = getInstagramOrWebsiteHref(raw);
                return (
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all font-medium text-amber-800 underline decoration-amber-800/40 underline-offset-2 hover:text-amber-900"
                      >
                        {raw}
                      </a>
                    ) : (
                      raw
                    )}
                    {onEditLink ? (
                      <button
                        type="button"
                        onClick={() => onEditLink(app)}
                        className="text-xs text-gray-500 underline hover:text-gray-700"
                      >
                        Edit
                      </button>
                    ) : null}
                  </span>
                );
              })()}
            </p>
            <p className="mt-1 text-sm text-gray-700">
              Shared IG support: {app.community_share ? "Yes" : "No"}
            </p>
            {app.anything_else ? (
              <p className="mt-2 text-sm text-gray-700">{app.anything_else}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            What they sell
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
            {app.what_do_you_sell || "—"}
          </p>
        </div>

        {(app.photo_urls || []).length > 0 ? (
          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Photos
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {app.photo_urls.map((url, index) => (
                <a
                  key={`${url}-${index}`}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-lg ring-1 ring-gray-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="h-28 w-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SummerMarketAdminPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState("applications");
  const [selectedDate, setSelectedDate] = useState("");
  const [busyById, setBusyById] = useState({});
  const [activeApplication, setActiveApplication] = useState(null);
  const [deleteRowState, setDeleteRowState] = useState({
    open: false,
    app: null,
    deleting: false,
    error: "",
  });
  const [acceptModal, setAcceptModal] = useState({
    open: false,
    app: null,
    subject: "",
    emailText: "",
    sending: false,
    error: "",
  });
  const [rejectModal, setRejectModal] = useState({
    open: false,
    app: null,
    rejectionMessage: "",
    sending: false,
    error: "",
  });
  const [editFieldModal, setEditFieldModal] = useState({
    open: false,
    app: null,
    field: null, // 'tablecloth' | 'power' | 'payment'
    value: null,
  });
  const [paymentPricingModal, setPaymentPricingModal] = useState({
    open: false,
    app: null,
  });
  const [linkEditModal, setLinkEditModal] = useState({ open: false, app: null });
  const [datesEditModal, setDatesEditModal] = useState({ open: false, app: null });
  const vendorListRef = useRef(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appQueryParam = searchParams.get("app");

  const openApplicationDetails = useCallback(
    (app) => {
      if (!app?.id) return;
      setActiveApplication(app);
      const params = new URLSearchParams(searchParams.toString());
      params.set("app", String(app.id));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const closeApplicationDetails = useCallback(() => {
    setActiveApplication(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("app");
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [pathname, router, searchParams]);

  /** When ?app= is present, keep modal in sync with list (shared links, refresh). Never clear when param is missing — that flickers during router.replace and closed the modal. */
  useEffect(() => {
    if (loading) return;
    if (!appQueryParam) return;
    const q = String(appQueryParam).trim();
    const found = applications.find((a) => String(a.id) === q);
    if (found) setActiveApplication(found);
  }, [loading, applications, appQueryParam]);

  /** Browser back/forward updates the address bar without always syncing React searchParams the same frame — close when ?app= is gone. */
  useEffect(() => {
    const onPopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        if (!params.get("app")) setActiveApplication(null);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setBusy = (id, busy) => {
    setBusyById((prev) => ({ ...prev, [id]: busy }));
  };

  const loadApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/summer-market/applications");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load applications.");
      setApplications(Array.isArray(json?.applications) ? json.applications : []);
    } catch (e) {
      setError(e?.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((app) =>
      [
        app.brand_name,
        app.contact_person,
        app.email,
        app.instagram_or_website,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [applications, search]);

  const groupedApplications = useMemo(() => {
    const groups = {
      pending: [],
      accepted: [],
      rejected: [],
    };
    for (const app of filtered) {
      const status = normalizedMeta(app).applicationStatus;
      if (status === "accepted") groups.accepted.push(app);
      else if (status === "rejected") groups.rejected.push(app);
      else groups.pending.push(app);
    }
    return groups;
  }, [filtered]);

  const accepted = useMemo(
    () =>
      applications.filter(
        (app) => normalizedMeta(app).applicationStatus === "accepted"
      ),
    [applications]
  );

  const acceptedCountByDate = useMemo(() => {
    const counts = {};
    for (const date of ALL_MARKET_DATES) {
      counts[date] = 0;
    }
    for (const app of accepted) {
      for (const date of app.selected_dates || []) {
        if (typeof counts[date] === "number") {
          counts[date] += 1;
        }
      }
    }
    return counts;
  }, [accepted]);

  useEffect(() => {
    if (!selectedDate && ALL_MARKET_DATES.length > 0) {
      setSelectedDate(ALL_MARKET_DATES[0]);
    } else if (selectedDate && !ALL_MARKET_DATES.includes(selectedDate)) {
      setSelectedDate(ALL_MARKET_DATES[0] || "");
    }
  }, [selectedDate]);

  const acceptedForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return accepted.filter((app) => (app.selected_dates || []).includes(selectedDate));
  }, [accepted, selectedDate]);

  const updateAdminMeta = (id, adminMeta) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? {
              ...app,
              status: adminMeta.applicationStatus || app.status,
              payment_status: adminMeta.paymentStatus || app.payment_status,
              accepted_at: adminMeta.acceptedAt || null,
              acceptance_email_sent_at: adminMeta.acceptanceEmailSentAt || null,
              accepted_by: adminMeta.acceptedBy || null,
              admin_meta: { ...(app.admin_meta || {}), ...adminMeta },
            }
          : app
      )
    );
  };

  const MAX_VENDORS_PER_DATE = 10;

  const getDateStatus = useCallback(
    (date) => {
      const count = applications.filter(
        (a) =>
          normalizedMeta(a).applicationStatus === "accepted" &&
          Array.isArray(a.selected_dates) &&
          a.selected_dates.includes(date)
      ).length;
      return { count, isFull: count >= MAX_VENDORS_PER_DATE };
    },
    [applications]
  );

  const openAcceptModal = (app) => {
    const selectedDates = app.selected_dates || [];
    const datesWithStatus = selectedDates.map((date) => ({
      date,
      ...getDateStatus(date),
    }));
    const fullDates = datesWithStatus.filter((d) => d.isFull).map((d) => d.date);
    const availableDates = datesWithStatus.filter((d) => !d.isFull).map((d) => d.date);
    const initialDatesToAccept = availableDates.length > 0 ? availableDates : selectedDates;

    setError("");
    setAcceptModal({
      open: true,
      app,
      datesToAccept: [...initialDatesToAccept],
      fullDates,
      availableDates,
      getDateStatus,
      subject: "Your White Lotus Summer Market application is accepted",
      emailText: buildAcceptanceEmailPlainBody({
        name: app.contact_person,
        selectedDates: initialDatesToAccept,
        tableclothRental: Boolean(app.tablecloth_rental),
        termsUrl: TERMS_URL,
      }),
      confirmStep: false,
      sending: false,
      error: "",
    });
  };

  const openRejectModal = (app) => {
    setError("");
    setRejectModal({
      open: true,
      app,
      rejectionMessage: "",
      sending: false,
      error: "",
    });
  };

  const sendRejectEmail = async () => {
    const { app, rejectionMessage } = rejectModal;
    if (!app) return;
    setRejectModal((p) => ({ ...p, sending: true, error: "" }));
    try {
      const res = await fetch(`/api/admin/summer-market/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejectionMessage: rejectionMessage.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to reject application.");
      updateAdminMeta(app.id, json.admin_meta || {});
      setRejectModal({
        open: false,
        app: null,
        rejectionMessage: "",
        sending: false,
        error: "",
      });
    } catch (e) {
      setRejectModal((p) => ({
        ...p,
        sending: false,
        error: e?.message || "Failed to send.",
      }));
    }
  };

  const sendAcceptEmail = async () => {
    const { app, subject, emailText, datesToAccept } = acceptModal;
    if (!app) return;
    setAcceptModal((p) => ({ ...p, sending: true, error: "" }));
    try {
      const res = await fetch(`/api/admin/summer-market/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          customEmailSubject: subject,
          customEmailText: emailText,
          selected_dates: datesToAccept || app.selected_dates,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to accept application.");
      updateAdminMeta(app.id, json.admin_meta || {});
      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? {
                ...a,
                status: "accepted",
                selected_dates: datesToAccept || a.selected_dates,
                accepted_at: new Date().toISOString(),
                acceptance_email_sent_at: new Date().toISOString(),
                admin_meta: { ...(a.admin_meta || {}), ...(json.admin_meta || {}) },
              }
            : a
        )
      );
      setAcceptModal({
        open: false,
        app: null,
        subject: "",
        emailText: "",
        datesToAccept: [],
        confirmStep: false,
        sending: false,
        error: "",
      });
    } catch (e) {
      setAcceptModal((p) => ({ ...p, sending: false, error: e?.message || "Failed to send." }));
    }
  };

  const updatePaymentStatus = async (app, paymentStatus) => {
    if (busyById[app.id]) return;
    setBusy(app.id, true);
    setError("");
    try {
      const res = await fetch(`/api/admin/summer-market/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "setPaymentStatus",
          paymentStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update payment status.");
      updateAdminMeta(app.id, json.admin_meta || {});
    } catch (e) {
      setError(e?.message || "Failed to update payment status.");
    } finally {
      setBusy(app.id, false);
    }
  };

  const openPaymentPricingModal = (app) => {
    setPaymentPricingModal({ open: true, app });
  };

  const closePaymentPricingModal = () => {
    setPaymentPricingModal({ open: false, app: null });
  };

  const openLinkEditModal = (app) => {
    setLinkEditModal({ open: true, app });
  };

  const closeLinkEditModal = () => {
    setLinkEditModal({ open: false, app: null });
  };

  const openDatesEditModal = (app) => {
    setDatesEditModal({ open: true, app });
  };

  const closeDatesEditModal = () => {
    setDatesEditModal({ open: false, app: null });
  };

  const saveDatesEdit = async (dates) => {
    const app = datesEditModal.app;
    if (!app) return;
    setBusy(app.id, true);
    setError("");
    try {
      const res = await fetch(`/api/admin/summer-market/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setDetails", selected_dates: dates }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update.");
      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id ? { ...a, selected_dates: dates } : a
        )
      );
      closeDatesEditModal();
    } catch (e) {
      setError(e?.message || "Failed to update.");
    } finally {
      setBusy(app.id, false);
    }
  };

  const saveLinkEdit = async (value) => {
    const app = linkEditModal.app;
    if (!app) return;
    setBusy(app.id, true);
    setError("");
    try {
      const res = await fetch(`/api/admin/summer-market/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "setDetails",
          instagram_or_website: value == null || value === "" ? null : String(value).trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update.");
      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? { ...a, instagram_or_website: value == null || value === "" ? null : String(value).trim() }
            : a
        )
      );
      closeLinkEditModal();
    } catch (e) {
      setError(e?.message || "Failed to update.");
    } finally {
      setBusy(app.id, false);
    }
  };

  const savePaymentTracking = async ({
    amountPaidKr,
    paymentEntries,
    paymentNotes,
    paymentStatus,
    stayOpen,
  }) => {
    const app = paymentPricingModal.app;
    if (!app) return;
    setBusy(app.id, true);
    setError("");
    try {
      const body = {
        action: "setPaymentTracking",
        paymentNotes,
        paymentStatus,
      };
      if (paymentEntries !== undefined) body.paymentEntries = paymentEntries;
      if (amountPaidKr !== undefined) body.amountPaidKr = amountPaidKr;
      const res = await fetch(`/api/admin/summer-market/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save payment info.");
      updateAdminMeta(app.id, json.admin_meta || {});
      if (!stayOpen) closePaymentPricingModal();
    } catch (e) {
      setError(e?.message || "Failed to save payment info.");
    } finally {
      setBusy(app.id, false);
    }
  };

  const openEditField = (app, field) => {
    let value;
    if (field === "tablecloth") value = app.tablecloth_rental;
    else if (field === "power") value = app.needs_power;
    else if (field === "payment") value = normalizedMeta(app).paymentStatus;
    setEditFieldModal({ open: true, app, field, value });
  };

  const closeEditField = () => {
    setEditFieldModal({ open: false, app: null, field: null, value: null });
  };

  const saveEditField = async () => {
    const { app, field, value } = editFieldModal;
    if (!app) return;
    setBusy(app.id, true);
    setError("");
    try {
      let body;
      if (field === "tablecloth") {
        body = { action: "setDetails", tablecloth_rental: value };
      } else if (field === "power") {
        body = { action: "setDetails", needs_power: value };
      } else if (field === "payment") {
        body = { action: "setPaymentStatus", paymentStatus: value };
      }
      const res = await fetch(`/api/admin/summer-market/applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update.");
      setApplications((prev) =>
        prev.map((a) => {
          if (a.id !== app.id) return a;
          if (field === "tablecloth") return { ...a, tablecloth_rental: value };
          if (field === "power") return { ...a, needs_power: value };
          if (field === "payment") return {
            ...a,
            payment_status: value,
            admin_meta: { ...(a.admin_meta || {}), paymentStatus: value },
          };
          return a;
        })
      );
      closeEditField();
    } catch (e) {
      setError(e?.message || "Failed to update.");
    } finally {
      setBusy(app.id, false);
    }
  };

  const openDeleteRowModal = (app) => {
    setDeleteRowState({ open: true, app, deleting: false, error: "" });
  };

  const closeDeleteRowModal = () => {
    if (deleteRowState.deleting) return;
    setDeleteRowState({ open: false, app: null, deleting: false, error: "" });
  };

  const confirmDeleteRow = async () => {
    const app = deleteRowState.app;
    if (!app || deleteRowState.deleting) return;
    setDeleteRowState((p) => ({ ...p, deleting: true, error: "" }));
    try {
      const res = await fetch(`/api/admin/summer-market/applications/${app.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete.");
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
      setDeleteRowState({ open: false, app: null, deleting: false, error: "" });
    } catch (e) {
      setDeleteRowState((p) => ({ ...p, deleting: false, error: e?.message || "Failed to delete." }));
    }
  };

  const renderApplicationRow = (app) => {
    const meta = normalizedMeta(app);
    const isBusy = !!busyById[app.id];
    const confirmationPaid =
      meta.paymentStatus === "confirmation_paid" ||
      meta.paymentStatus === "fully_paid";
    const fullyPaid = meta.paymentStatus === "fully_paid";

    return (
      <div
        key={app.id}
        className="rounded-2xl bg-white p-4 ring-1 ring-gray-200 shadow-sm"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-bold text-gray-900">
                {app.brand_name}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPill(
                  meta.applicationStatus
                )}`}
              >
                {statusLabel(meta.applicationStatus)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {app.contact_person} · {app.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-700">
              <span className="rounded-full bg-gray-50 px-2.5 py-1 ring-1 ring-gray-200">
                {app.selected_dates?.length || 0} date(s)
              </span>
              <span className="rounded-full bg-gray-50 px-2.5 py-1 ring-1 ring-gray-200">
                {formatDateTime(app.created_at)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openEditField(app, "tablecloth")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-70 ${
                app.tablecloth_rental
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                  : "bg-gray-50 text-gray-400 ring-1 ring-gray-200"
              }`}
              title="Needs tablecloth — click to edit"
            >
              <Square className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => openEditField(app, "power")}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-70 ${
                app.needs_power
                  ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  : "bg-gray-50 text-gray-400 ring-1 ring-gray-200"
              }`}
              title="Needs power — click to edit"
            >
              <PlugZap className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => openDatesEditModal(app)}
              title={`Dates (${app.selected_dates?.length || 0}) — click to add or remove`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-600 ring-1 ring-sky-200 transition hover:opacity-70"
            >
              <Calendar className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => openLinkEditModal(app)}
              title={
                app.instagram_or_website
                  ? `Instagram/website: ${app.instagram_or_website.trim()} — click to edit`
                  : "Instagram / website — click to add"
              }
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-70 ${
                app.instagram_or_website
                  ? (app.instagram_or_website?.trim() || "").startsWith("@")
                    ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                    : "bg-sky-50 text-sky-600 ring-1 ring-sky-200"
                  : "bg-gray-100 text-gray-400 ring-1 ring-gray-200"
              }`}
            >
              <Instagram className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => openPaymentPricingModal(app)}
              title={
                fullyPaid
                  ? "Pricing & payment tracking — fully paid"
                  : confirmationPaid
                    ? "Pricing & payment tracking — confirmation paid"
                    : "Pricing & payment tracking — unpaid"
              }
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-70 ${
                fullyPaid
                  ? "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200"
                  : confirmationPaid
                    ? "bg-yellow-100 text-emerald-500 ring-1 ring-yellow-200"
                    : "bg-gray-100 text-gray-400 ring-1 ring-gray-200"
              }`}
            >
              <CircleDollarSign className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => openApplicationDetails(app)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </button>

            <button
              type="button"
              onClick={() => openAcceptModal(app)}
              disabled={isBusy || meta.applicationStatus === "accepted" || meta.applicationStatus === "rejected"}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 ${
                meta.applicationStatus === "accepted"
                  ? "bg-emerald-600 opacity-60 cursor-default"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {meta.applicationStatus === "accepted" ? "Accepted" : "Accept"}
            </button>
            <button
              type="button"
              onClick={() => openRejectModal(app)}
              disabled={isBusy || meta.applicationStatus === "accepted" || meta.applicationStatus === "rejected"}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
                meta.applicationStatus === "rejected"
                  ? "border-rose-200 bg-rose-50 text-rose-700 cursor-default"
                  : "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
              }`}
            >
              {meta.applicationStatus === "rejected" ? "Rejected" : "Reject"}
            </button>
            <button
              type="button"
              onClick={() => openDeleteRowModal(app)}
              disabled={isBusy}
              className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-gray-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
              title="Delete application"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-16">
      {paymentPricingModal.open && paymentPricingModal.app ? (
        <PaymentPricingModal
          app={
            applications.find((a) => a.id === paymentPricingModal.app?.id) ||
            paymentPricingModal.app
          }
          onClose={closePaymentPricingModal}
          busy={!!busyById[paymentPricingModal.app.id]}
          onSave={savePaymentTracking}
        />
      ) : null}
      <ApplicationDetailsModal
        app={
          applications.find((a) => a.id === activeApplication?.id) ||
          activeApplication
        }
        onClose={closeApplicationDetails}
        onDelete={(deletedId) => {
          setApplications((prev) => prev.filter((a) => a.id !== deletedId));
          closeApplicationDetails();
        }}
        onEditLink={openLinkEditModal}
      />
      {linkEditModal.open && linkEditModal.app ? (
        <LinkEditModal
          app={linkEditModal.app}
          onClose={closeLinkEditModal}
          onSave={saveLinkEdit}
          busy={!!busyById[linkEditModal.app?.id]}
        />
      ) : null}
      {datesEditModal.open && datesEditModal.app ? (
        <DatesEditModal
          app={datesEditModal.app}
          onClose={closeDatesEditModal}
          onSave={saveDatesEdit}
          busy={!!busyById[datesEditModal.app?.id]}
        />
      ) : null}
      {editFieldModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeEditField} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200">
            <h3 className="text-base font-bold text-gray-900">
              {editFieldModal.field === "tablecloth" && "Table cloth rental"}
              {editFieldModal.field === "power" && "Electric plug"}
              {editFieldModal.field === "payment" && "Payment status"}
            </h3>
            {editFieldModal.app ? (
              <p className="mt-1 text-xs text-gray-500">
                {editFieldModal.app.brand_name} · {editFieldModal.app.contact_person}
              </p>
            ) : null}

            <div className="mt-4 space-y-2">
              {editFieldModal.field === "tablecloth" && (
                <>
                  {[true, false].map((opt) => (
                    <button
                      key={String(opt)}
                      type="button"
                      onClick={() => setEditFieldModal((p) => ({ ...p, value: opt }))}
                      className={`flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        editFieldModal.value === opt
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {opt ? "Yes — needs table cloth" : "No — not needed"}
                    </button>
                  ))}
                </>
              )}
              {editFieldModal.field === "power" && (
                <>
                  {[true, false].map((opt) => (
                    <button
                      key={String(opt)}
                      type="button"
                      onClick={() => setEditFieldModal((p) => ({ ...p, value: opt }))}
                      className={`flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        editFieldModal.value === opt
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {opt ? "Yes — needs electric plug" : "No — not needed"}
                    </button>
                  ))}
                </>
              )}
              {editFieldModal.field === "payment" && (
                <>
                  {PAYMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setEditFieldModal((p) => ({ ...p, value: opt.value }))}
                      className={`flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        editFieldModal.value === opt.value
                          ? "bg-gray-900 text-white"
                          : "bg-gray-50 text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeEditField}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditField}
                disabled={editFieldModal.app && busyById[editFieldModal.app.id]}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
              >
                {editFieldModal.app && busyById[editFieldModal.app.id] ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {rejectModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              !rejectModal.sending &&
              setRejectModal({
                open: false,
                app: null,
                rejectionMessage: "",
                sending: false,
                error: "",
              })
            }
          />
          <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Reject application</h3>
                {rejectModal.app ? (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {rejectModal.app.brand_name} · {rejectModal.app.contact_person} ·{" "}
                    <span className="font-medium text-gray-700">{rejectModal.app.email}</span>
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-gray-600">
                  Sends the applicant an email. You can add an optional note below.
                </p>
              </div>
              <button
                type="button"
                disabled={rejectModal.sending}
                onClick={() =>
                  setRejectModal({
                    open: false,
                    app: null,
                    rejectionMessage: "",
                    sending: false,
                    error: "",
                  })
                }
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            <div className="px-6 pb-6 pt-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Optional message to applicant
              </label>
              <textarea
                rows={5}
                value={rejectModal.rejectionMessage}
                onChange={(e) =>
                  setRejectModal((p) => ({ ...p, rejectionMessage: e.target.value }))
                }
                placeholder="e.g. We’re full for those dates — feel free to apply next season."
                className="w-full rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-rose-300"
              />
              {rejectModal.error ? (
                <p className="mt-2 text-xs text-rose-600">{rejectModal.error}</p>
              ) : null}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={sendRejectEmail}
                  disabled={rejectModal.sending}
                  className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {rejectModal.sending ? "Sending…" : "Reject + Send Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {acceptModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              !acceptModal.sending &&
              !acceptModal.confirmStep &&
              setAcceptModal({
                open: false,
                app: null,
                subject: "",
                emailText: "",
                datesToAccept: [],
                confirmStep: false,
                sending: false,
                error: "",
              })
            }
          />
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {acceptModal.confirmStep ? "Confirm accept" : "Accept application"}
                </h3>
                {acceptModal.app ? (
                  <p className="mt-0.5 text-xs text-gray-500">
                    {acceptModal.app.brand_name} · {acceptModal.app.contact_person} ·{" "}
                    <span className="font-medium text-gray-700">{acceptModal.app.email}</span>
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                disabled={acceptModal.sending}
                onClick={() =>
                  setAcceptModal((p) =>
                    p.confirmStep
                      ? { ...p, confirmStep: false }
                      : {
                          open: false,
                          app: null,
                          subject: "",
                          emailText: "",
                          datesToAccept: [],
                          confirmStep: false,
                          sending: false,
                          error: "",
                        }
                  )
                }
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {acceptModal.confirmStep ? "Back" : "Cancel"}
              </button>
            </div>

            {acceptModal.confirmStep ? (
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-sm text-gray-700">
                  Accept this vendor for{" "}
                  <strong>{(acceptModal.datesToAccept || []).join(", ")}</strong>?
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  This will update their application, send the acceptance email, and add them to the
                  accepted list for these dates.
                </p>
                {(acceptModal.app?.selected_dates?.length || 0) >
                  (acceptModal.datesToAccept?.length || 0) ? (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
                    Note: Some dates they applied for were full and have been removed. The email
                    reflects only the dates above.
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                {/* Dates section */}
                <div className="border-b border-gray-100 px-6 py-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Dates — accept for
                  </label>
                  <p className="mb-3 text-xs text-gray-600">
                    Some dates may be full (10 vendors). Remove full dates to accept for the others.
                    The email below will match the dates you keep.
                  </p>
                  <div className="space-y-2">
                    {(acceptModal.app?.selected_dates || []).map((date) => {
                      const inAccept = (acceptModal.datesToAccept || []).includes(date);
                      const status = acceptModal.getDateStatus?.(date) || { count: 0, isFull: false };
                      const canRemove = inAccept && (status.isFull || (acceptModal.datesToAccept?.length || 0) > 1);
                      return (
                        <div
                          key={date}
                          className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${
                            inAccept ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-gray-50"
                          }`}
                        >
                          <span className="font-medium text-gray-900">{date}</span>
                          <div className="flex items-center gap-2">
                            {status.isFull ? (
                              <span className="rounded bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                                FULL ({status.count}/10)
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                Available ({status.count}/10)
                              </span>
                            )}
                            {canRemove ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const newDates = (acceptModal.datesToAccept || []).filter((d) => d !== date);
                                  setAcceptModal((p) => ({
                                    ...p,
                                    datesToAccept: newDates,
                                    emailText: buildAcceptanceEmailPlainBody({
                                      name: p.app?.contact_person,
                                      selectedDates: newDates,
                                      tableclothRental: Boolean(p.app?.tablecloth_rental),
                                      termsUrl: TERMS_URL,
                                    }),
                                  }));
                                }}
                                className="rounded p-1 text-rose-600 hover:bg-rose-100"
                                title="Remove from accept list"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            ) : inAccept && (acceptModal.datesToAccept?.length || 0) === 1 ? (
                              <span className="text-[11px] text-gray-400">(keep at least 1)</span>
                            ) : null}
                            {!inAccept && !status.isFull ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const newDates = [
                                    ...(acceptModal.datesToAccept || []),
                                    date,
                                  ].sort(
                                    (a, b) =>
                                      ALL_MARKET_DATES.indexOf(a) - ALL_MARKET_DATES.indexOf(b)
                                  );
                                  setAcceptModal((p) => ({
                                    ...p,
                                    datesToAccept: newDates,
                                    emailText: buildAcceptanceEmailPlainBody({
                                      name: p.app?.contact_person,
                                      selectedDates: newDates,
                                      tableclothRental: Boolean(p.app?.tablecloth_rental),
                                      termsUrl: TERMS_URL,
                                    }),
                                  }));
                                }}
                                className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                              >
                                Add back
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {(acceptModal.datesToAccept?.length || 0) === 0 ? (
                    <p className="mt-2 text-xs text-rose-600">
                      Remove all dates — add at least one date to accept.
                    </p>
                  ) : null}
                </div>

                {/* Subject */}
                <div className="px-6 pt-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Subject
              </label>
              <input
                type="text"
                value={acceptModal.subject}
                onChange={(e) => setAcceptModal((p) => ({ ...p, subject: e.target.value }))}
                className="w-full rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-400"
              />
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 pt-4 pb-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email body
              </label>
              <textarea
                rows={16}
                value={acceptModal.emailText}
                onChange={(e) => setAcceptModal((p) => ({ ...p, emailText: e.target.value }))}
                className="w-full rounded-xl bg-gray-50 px-4 py-3 font-mono text-sm leading-relaxed text-gray-800 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-emerald-400"
              />
                <p className="mt-1.5 text-[11px] text-gray-400">
                This is the plain-text version. The beautifully designed HTML email will still be sent unchanged.
                </p>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              {acceptModal.error ? (
                <p className="text-xs text-rose-600">{acceptModal.error}</p>
              ) : (
                <span />
              )}
              {acceptModal.confirmStep ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAcceptModal((p) => ({ ...p, confirmStep: false }))}
                    disabled={acceptModal.sending}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={sendAcceptEmail}
                    disabled={acceptModal.sending || (acceptModal.datesToAccept?.length || 0) === 0}
                    className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {acceptModal.sending ? "Sending…" : "Yes, Accept + Send Email"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setAcceptModal((p) => {
                      if ((p.datesToAccept?.length || 0) === 0) return p;
                      return { ...p, confirmStep: true };
                    })
                  }
                  disabled={
                    acceptModal.sending || (acceptModal.datesToAccept?.length || 0) === 0
                  }
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Accept + Send Email
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
      {deleteRowState.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeDeleteRowModal} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Delete application?</h3>
            {deleteRowState.app ? (
              <p className="mt-1 text-sm font-semibold text-gray-800">
                {deleteRowState.app.brand_name} · {deleteRowState.app.contact_person}
              </p>
            ) : null}
            <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">
              This permanently removes the application and all uploaded photos from storage.
              <strong className="block mt-0.5">This cannot be undone.</strong>
            </p>
            {deleteRowState.error ? (
              <p className="mt-2 text-xs text-rose-600">{deleteRowState.error}</p>
            ) : null}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteRowModal}
                disabled={deleteRowState.deleting}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteRow}
                disabled={deleteRowState.deleting}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleteRowState.deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center w-full">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Summer Market Admin
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Review applications, accept vendors, send acceptance emails, and track payments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadApplications}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
            <Link
              href="/admin"
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">Total applications</p>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              {applications.length}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">Pending</p>
            <p className="mt-2 text-3xl font-extrabold text-amber-700">
              {
                applications.filter(
                  (app) => normalizedMeta(app).applicationStatus === "pending"
                ).length
              }
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">Accepted</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-700">
              {accepted.length}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500">Fully paid</p>
            <p className="mt-2 text-3xl font-extrabold text-green-700">
              {
                applications.filter(
                  (app) => normalizedMeta(app).paymentStatus === "fully_paid"
                ).length
              }
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView("applications")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeView === "applications"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-200"
            }`}
          >
            Applications
          </button>
          <button
            type="button"
            onClick={() => setActiveView("dates")}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeView === "dates"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-200"
            }`}
          >
            Calendar
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
            {error}
          </p>
        ) : null}

        {activeView === "applications" ? (
          <div className="mt-5">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, brand, email..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700"
              />
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="rounded-2xl bg-white p-6 text-sm text-gray-600 ring-1 ring-gray-200">
                  Loading applications...
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-sm text-gray-600 ring-1 ring-gray-200">
                  No applications found.
                </div>
              ) : (
                <div className="space-y-6">
                  {[
                    ["pending", "Pending"],
                    ["accepted", "Accepted"],
                    ["rejected", "Declined"],
                  ].map(([key, label]) => {
                    const list = groupedApplications[key] || [];
                    if (list.length === 0) return null;
                    return (
                      <section key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">
                            {label}
                          </h3>
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {list.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {list.map((app) => renderApplicationRow(app))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
            <div className="space-y-5">
              {["June", "July"].map((month) => (
                <div key={month}>
                  <p className="mb-2 text-sm font-bold text-gray-800">{month}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {WEEKEND_GROUPS.filter((group) => group[0].includes(month)).map((group) => (
                <div
                  key={group[0]}
                  className="rounded-xl bg-gray-50 p-2 ring-1 ring-gray-200"
                >
                  <p className="mb-1 px-1 text-center text-xs font-bold uppercase tracking-wide text-gray-700">
                    {weekendLabel(group)}
                  </p>
                  <div className="space-y-1">
                    {group.map((date) => {
                      const count = acceptedCountByDate[date] || 0;
                      const isSelected = selectedDate === date;
                      return (
                        <button
                          type="button"
                          key={date}
                          onClick={() => {
                              setSelectedDate(date);
                              setTimeout(() => {
                                vendorListRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }, 50);
                            }}
                          className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-semibold ${
                            isSelected
                              ? "bg-gray-900 text-white"
                              : "bg-white text-gray-700 ring-1 ring-gray-200"
                          }`}
                        >
                          <span>{date}</span>
                          {count > 0 ? <span>({count})</span> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedDate ? (
              <div className="mt-4" ref={vendorListRef}>
                <p className="text-sm font-semibold text-gray-800">
                  Vendors for {selectedDate}
                </p>
                <div className="mt-2 space-y-2">
                  {acceptedForSelectedDate.length === 0 ? (
                    <p className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600 ring-1 ring-gray-200">
                      No accepted vendors on this date yet.
                    </p>
                  ) : (
                    acceptedForSelectedDate.map((app) => {
                      const meta = normalizedMeta(app);
                      const bookingBanner = bookingBannerForDate(app, selectedDate);
                      return (
                        <div
                          key={app.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900">
                                {app.brand_name}
                              </p>
                              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-200">
                                {bookingBanner}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {app.contact_person} · {app.email}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openPaymentPricingModal(app)}
                              title="Pricing & payment tracking"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-600 ring-1 ring-gray-200 transition hover:bg-amber-50 hover:text-amber-900"
                            >
                              <CircleDollarSign className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDatesEditModal(app)}
                              title={`Dates (${app.selected_dates?.length || 0}) — click to add or remove`}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 text-sky-600 ring-1 ring-sky-200 transition hover:opacity-70"
                            >
                              <Calendar className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openLinkEditModal(app)}
                              title={
                                app.instagram_or_website
                                  ? `Instagram/website: ${app.instagram_or_website.trim()} — click to edit`
                                  : "Instagram / website — click to add"
                              }
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition hover:opacity-70 ${
                                app.instagram_or_website
                                  ? (app.instagram_or_website?.trim() || "").startsWith("@")
                                    ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                                    : "bg-sky-50 text-sky-600 ring-1 ring-sky-200"
                                  : "bg-gray-100 text-gray-400 ring-1 ring-gray-200"
                              }`}
                            >
                              <Instagram className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditField(app, "tablecloth")}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-70 ${
                                app.tablecloth_rental
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                              }`}
                            >
                              <span className={app.tablecloth_rental ? "" : "line-through"}>
                                Table cloth
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditField(app, "power")}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-70 ${
                                app.needs_power
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                  : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                              }`}
                            >
                              <span className={app.needs_power ? "" : "line-through"}>
                                Electric plug
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openApplicationDetails(app)}
                              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
