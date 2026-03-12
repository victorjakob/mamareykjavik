"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  ExternalLink,
  Eye,
  Instagram,
  PlugZap,
  Search,
  Square,
  X,
} from "lucide-react";

const PAYMENT_OPTIONS = [
  { value: "unpaid", label: "Not paid" },
  { value: "confirmation_paid", label: "Confirmation Paid" },
  { value: "fully_paid", label: "Fully Paid" },
];

const WEEKEND_GROUPS = [
  ["Fri June 6", "Sat June 7", "Sun June 8"],
  ["Fri June 13", "Sat June 14", "Sun June 15"],
  ["Fri June 20", "Sat June 21", "Sun June 22"],
  ["Fri June 27", "Sat June 28", "Sun June 29"],
  ["Fri July 4", "Sat July 5", "Sun July 6"],
  ["Fri July 11", "Sat July 12", "Sun July 13"],
  ["Fri July 18", "Sat July 19", "Sun July 20"],
  ["Fri July 25", "Sat July 26", "Sun July 27"],
];

const ALL_MARKET_DATES = WEEKEND_GROUPS.flat();

const TERMS_URL =
  "https://docs.google.com/document/d/1sFTWvTh6H2EtNstGS8F7g_ne5gFDMzrykjjNLzdLkUM/edit?usp=sharing";

function buildAcceptEmailText({ name, selectedDates }) {
  const dates = Array.isArray(selectedDates) && selectedDates.length
    ? selectedDates.map((d) => `  • ${d}`).join("\n")
    : "  No dates selected";
  return `Hi ${name || "there"},

Thank you for applying to the White Lotus Summer Market.

We're happy to confirm that your application has been accepted, and we'd love to have you join us.

Your selected dates:
${dates}

To confirm your booth, please complete the 3.500 kr reservation fee.
This secures your spot and is deducted from the total booth fee.

Transfer here:
670220-0440
0322-26-670220

Reply to us when the transfer has been made <3 then your booth will be fully confirmed.

We can also prepare official invoice if you wish, let us know.

Please read the instructions, terms & agreements and all info carefully here:
${TERMS_URL}`;
}

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
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

function ApplicationDetailsModal({ app, onClose, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!app) return null;
  const meta = normalizedMeta(app);

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
              Instagram/website: {app.instagram_or_website || "—"}
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
  const [editFieldModal, setEditFieldModal] = useState({
    open: false,
    app: null,
    field: null, // 'tablecloth' | 'power' | 'payment'
    value: null,
  });
  const vendorListRef = useRef(null);

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

  const openAcceptModal = (app) => {
    const MAX_VENDORS_PER_DATE = 10;
    const selectedDates = app.selected_dates || [];

    const fullDates = selectedDates.filter((date) => {
      const count = applications.filter(
        (a) =>
          a.id !== app.id &&
          normalizedMeta(a).applicationStatus === "accepted" &&
          Array.isArray(a.selected_dates) &&
          a.selected_dates.includes(date)
      ).length;
      return count >= MAX_VENDORS_PER_DATE;
    });

    if (fullDates.length > 0) {
      setError(
        `Cannot accept: ${fullDates.join(", ")} ${fullDates.length === 1 ? "already has" : "already have"} ${MAX_VENDORS_PER_DATE} accepted vendors.`
      );
      return;
    }

    setError("");
    setAcceptModal({
      open: true,
      app,
      subject: "Your White Lotus Summer Market application is accepted",
      emailText: buildAcceptEmailText({
        name: app.contact_person,
        selectedDates: app.selected_dates || [],
      }),
      sending: false,
      error: "",
    });
  };

  const sendAcceptEmail = async () => {
    const { app, subject, emailText } = acceptModal;
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
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to accept application.");
      updateAdminMeta(app.id, json.admin_meta || {});
      setAcceptModal({ open: false, app: null, subject: "", emailText: "", sending: false, error: "" });
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
              <button
                type="button"
                onClick={() => openEditField(app, "payment")}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-70 ${paymentPill(
                  meta.paymentStatus
                )}`}
              >
                {meta.paymentStatus === "unpaid" ? "Not paid" : meta.paymentStatus.replace(/_/g, " ")}
              </button>
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
            {app.instagram_or_website ? (
              (() => {
                const val = app.instagram_or_website.trim();
                const isIg = val.startsWith("@");
                const href = isIg
                  ? `https://instagram.com/${val.slice(1)}`
                  : val.startsWith("http")
                    ? val
                    : `https://${val}`;
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    title={isIg ? `Instagram: ${val}` : `Website: ${val}`}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:opacity-70 ${
                      isIg
                        ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                        : "bg-sky-50 text-sky-600 ring-1 ring-sky-200"
                    }`}
                  >
                    {isIg ? <Instagram className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                  </a>
                );
              })()
            ) : (
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 ring-1 ring-gray-200"
                title="No Instagram / website"
              >
                <Instagram className="h-4 w-4" />
              </span>
            )}
            <button
              type="button"
              onClick={() => openEditField(app, "payment")}
              title={
                fullyPaid
                  ? "Fully paid — click to edit"
                  : confirmationPaid
                    ? "Confirmation paid — click to edit"
                    : "Unpaid — click to edit"
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

            <PaymentSelect
              value={meta.paymentStatus}
              onChange={(value) => updatePaymentStatus(app, value)}
              disabled={isBusy}
            />

            <button
              type="button"
              onClick={() => setActiveApplication(app)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Eye className="h-3.5 w-3.5" />
              View
            </button>

            <button
              type="button"
              onClick={() => openAcceptModal(app)}
              disabled={isBusy || meta.applicationStatus === "accepted"}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 ${
                meta.applicationStatus === "accepted"
                  ? "bg-emerald-600 opacity-60 cursor-default"
                  : meta.applicationStatus === "rejected"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {meta.applicationStatus === "accepted" ? "Accepted" : "Accept"}
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
      <ApplicationDetailsModal
        app={activeApplication}
        onClose={() => setActiveApplication(null)}
        onDelete={(deletedId) => {
          setApplications((prev) => prev.filter((a) => a.id !== deletedId));
          setActiveApplication(null);
        }}
      />
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
      {acceptModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              !acceptModal.sending &&
              setAcceptModal({ open: false, app: null, subject: "", emailText: "", sending: false, error: "" })
            }
          />
          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Accept application</h3>
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
                  setAcceptModal({ open: false, app: null, subject: "", emailText: "", sending: false, error: "" })
                }
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
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

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              {acceptModal.error ? (
                <p className="text-xs text-rose-600">{acceptModal.error}</p>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={sendAcceptEmail}
                disabled={acceptModal.sending}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {acceptModal.sending ? "Sending…" : "Accept + Send Email"}
              </button>
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
                              onClick={() => openEditField(app, "payment")}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-70 ${paymentPill(
                                meta.paymentStatus
                              )}`}
                            >
                              {meta.paymentStatus === "unpaid" ? "Not paid" : meta.paymentStatus.replace(/_/g, " ")}
                            </button>
                            {app.instagram_or_website ? (
                              (() => {
                                const val = app.instagram_or_website.trim();
                                const isIg = val.startsWith("@");
                                const href = isIg
                                  ? `https://instagram.com/${val.slice(1)}`
                                  : val.startsWith("http")
                                    ? val
                                    : `https://${val}`;
                                return (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={isIg ? `Instagram: ${val}` : `Website: ${val}`}
                                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition hover:opacity-70 ${
                                      isIg
                                        ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                                        : "bg-sky-50 text-sky-600 ring-1 ring-sky-200"
                                    }`}
                                  >
                                    {isIg ? <Instagram className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
                                  </a>
                                );
                              })()
                            ) : null}
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
                              onClick={() => setActiveApplication(app)}
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
