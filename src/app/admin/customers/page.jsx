"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { Search, Plus, Loader2, X, Users, GitMerge } from "lucide-react";
import AdminGuard from "../AdminGuard";
import { AdminShell, AdminHero, AdminPanel, AdminPillButton } from "@/app/admin/components/AdminShell";
import { useRole } from "@/hooks/useRole";
import { DISCOUNT_CATEGORIES } from "@/lib/customers/shared";

// ───────────────────────────────────────────────────────
// /admin/customers — Mama's one customer list
//
// The till only searches and applies; everything is managed here. An account
// that is "off" cannot be charged to, but its discount still applies.
// ───────────────────────────────────────────────────────

export default function CustomersPage() {
  return (
    <AdminGuard>
      <AdminOnly />
    </AdminGuard>
  );
}

function AdminOnly() {
  const role = useRole();
  if (role !== "admin") {
    return (
      <AdminShell>
        <AdminHero eyebrow="Admin" title="Customers" subtitle="Admins only" size="compact" />
        <p className="text-center text-[#9a7a62] text-sm">Customer records are for admins only.</p>
      </AdminShell>
    );
  }
  return <Customers />;
}

const kr = (n) => (n == null ? "" : `${Number(n).toLocaleString("is-IS")} kr`);
const day = (d) => (d ? format(new Date(d), "d MMM yyyy") : "");
const acc = (c) => c.customer_accounts && (Array.isArray(c.customer_accounts) ? c.customer_accounts[0] : c.customer_accounts);
const scopeLabel = (scope) =>
  !scope?.length ? "whole menu" : scope.map((id) => DISCOUNT_CATEGORIES.find((c) => c.id === id)?.label ?? id).join(", ");

function Customers() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async (query) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(query ?? "")}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRows(data.customers);
    } catch (e) {
      toast.error(e.message || "Could not load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
  }, [q, load]);

  const onAccount = rows.filter((c) => acc(c)?.active).length;

  return (
    <AdminShell>
      <AdminHero
        eyebrow="Admin · Restaurant"
        title="Customers"
        subtitle="One list for the till, bookings, Tribe and gift cards"
        size="compact"
        action={
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff914d] text-black text-sm font-semibold rounded-full hover:bg-[#ff7a2e]"
          >
            <Plus className="w-4 h-4" /> Add customer
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a7a62]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, company, email, phone or kennitala"
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#e8ddd3] text-sm text-[#2c1810] outline-none focus:border-[#ff914d]"
          />
        </div>
        <p className="text-sm text-[#9a7a62]">
          {rows.length} customers · {onAccount} on account
        </p>
      </div>

      <AdminPanel padded={false} icon={Users} title="Customers" subtitle="Tap a customer to edit, see history or merge">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[#ff914d]" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#9a7a62]">No customers match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.15em] text-[#9a7a62] border-b border-[#f0e6d8]">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium text-right">Discount</th>
                  <th className="px-5 py-3 font-medium">Account</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const a = acc(c);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setOpenId(c.id)}
                      className="border-b border-[#f6efe6] last:border-0 cursor-pointer hover:bg-[#fff8f1]"
                    >
                      <td className="px-5 py-3 text-[#2c1810] font-medium">
                        {c.name}
                        {a?.is_staff ? <span className="ml-2 text-[11px] text-[#9a7a62]">staff</span> : null}
                      </td>
                      <td className="px-5 py-3 text-[#6b5040]">{c.company ?? ""}</td>
                      <td className="px-5 py-3 text-right text-[#2c1810]">
                        {a?.discount_pct ? `${a.discount_pct}%` : ""}
                        {a?.discount_pct && a?.discount_scope?.length ? <span className="text-[#9a7a62]"> · some</span> : null}
                      </td>
                      <td className="px-5 py-3">
                        {a ? (
                          a.active ? (
                            <span className="text-emerald-700">On</span>
                          ) : (
                            <span className="text-[#9a7a62]">Off</span>
                          )
                        ) : (
                          <span className="text-[#c9b8a8]">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      {openId ? (
        <CustomerDrawer
          id={openId}
          onClose={() => setOpenId(null)}
          onChanged={() => load(q)}
          onOpen={(id) => setOpenId(id)}
        />
      ) : null}
      {adding ? (
        <AddCustomer
          onClose={() => setAdding(false)}
          onCreated={(id) => {
            setAdding(false);
            load(q);
            setOpenId(id);
          }}
        />
      ) : null}
    </AdminShell>
  );
}

// ── Shared bits ────────────────────────────────────────

function Drawer({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/30" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-xl overflow-y-auto bg-[#fffaf4] shadow-xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#fffaf4] border-b border-[#f0e6d8]">
          <h2 className="font-cormorant italic text-2xl text-[#2c1810]">{title}</h2>
          <button onClick={onClose} className="p-2 text-[#9a7a62] hover:text-[#2c1810]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.15em] text-[#9a7a62] mb-1">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-[#9a7a62] mt-1">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full px-3 py-2.5 rounded-lg bg-white border border-[#e8ddd3] text-sm text-[#2c1810] outline-none focus:border-[#ff914d]";

function Section({ title, children }) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-[0.2em] text-[#9a7a62] mb-3">{title}</h3>
      {children}
    </section>
  );
}

// ── Customer drawer: details, account, history, merge ─

function CustomerDrawer({ id, onClose, onChanged, onOpen }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [account, setAccount] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/customers/${id}`);
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Could not load");
      return;
    }
    const c = json.customer;
    setData(json);
    setForm({
      name: c.name ?? "",
      company: c.company ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      kennitala: c.kennitala ?? "",
      kind: c.kind ?? "person",
      preferred_language: c.preferred_language ?? "",
      notes: c.notes ?? "",
      marketing_opt_in: c.marketing_opt_in === true,
    });
    const a = c.customer_accounts;
    setAccount(
      a
        ? {
            exists: true,
            active: a.active,
            discount_pct: a.discount_pct ?? 0,
            discount_scope: a.discount_scope ?? [],
            monthly_cap_isk: a.monthly_cap_isk ?? "",
            is_staff: a.is_staff,
            payday_customer_id: a.payday_customer_id ?? "",
          }
        : { exists: false, active: false, discount_pct: 0, discount_scope: [], monthly_cap_isk: "", is_staff: false, payday_customer_id: "" },
    );
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const touchedAccount =
        account.exists || account.active || account.discount_pct > 0 || account.is_staff || account.monthly_cap_isk !== "";
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...(touchedAccount
            ? {
                account: {
                  active: account.active,
                  discount_pct: account.discount_pct,
                  discount_scope: account.discount_scope.length ? account.discount_scope : null,
                  monthly_cap_isk: account.monthly_cap_isk === "" ? null : account.monthly_cap_isk,
                  is_staff: account.is_staff,
                  payday_customer_id: account.payday_customer_id,
                },
              }
            : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Saved");
      onChanged();
      load();
    } catch (e) {
      toast.error(e.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (!data || !form || !account) {
    return (
      <Drawer title="Customer" onClose={onClose}>
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-[#ff914d]" />
        </div>
      </Drawer>
    );
  }

  const c = data.customer;
  const h = data.history;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleScope = (catId) =>
    setAccount({
      ...account,
      discount_scope: account.discount_scope.includes(catId)
        ? account.discount_scope.filter((x) => x !== catId)
        : [...account.discount_scope, catId],
    });

  return (
    <Drawer title={c.name} onClose={onClose}>
      {c.merged_into ? (
        <div className="rounded-lg bg-[#fff1e6] border border-[#ffd8bd] p-3 text-sm text-[#6b3a1a]">
          Merged into another customer.{" "}
          <button className="underline" onClick={() => onOpen(c.merged_into)}>
            Open the one kept
          </button>
        </div>
      ) : null}

      <Section title="At the till">
        <p className="text-sm text-[#2c1810]">
          {account.discount_pct > 0
            ? `${account.discount_pct}% off ${scopeLabel(account.discount_scope)}`
            : "No discount"}
          {" · "}
          {account.active ? "can put it on account" : "pays by card or cash"}
          {account.is_staff ? " · staff" : ""}
        </p>
      </Section>

      <Section title="Details">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Name">
              <input className={inputClass} value={form.name} onChange={set("name")} />
            </Field>
          </div>
          <Field label="Company">
            <input className={inputClass} value={form.company} onChange={set("company")} />
          </Field>
          <Field label="Kennitala">
            <input className={inputClass} value={form.kennitala} onChange={set("kennitala")} inputMode="numeric" />
          </Field>
          <Field label="Email">
            <input className={inputClass} value={form.email} onChange={set("email")} type="email" />
          </Field>
          <Field label="Phone">
            <input className={inputClass} value={form.phone} onChange={set("phone")} />
          </Field>
          <Field label="Person or company">
            <select className={inputClass} value={form.kind} onChange={set("kind")}>
              <option value="person">Person</option>
              <option value="company">Company</option>
            </select>
          </Field>
          <Field label="Language">
            <select className={inputClass} value={form.preferred_language} onChange={set("preferred_language")}>
              <option value="">Not set</option>
              <option value="is">Icelandic</option>
              <option value="en">English</option>
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Notes">
              <textarea className={inputClass} rows={2} value={form.notes} onChange={set("notes")} />
            </Field>
          </div>
          <label className="col-span-2 flex items-center gap-2 text-sm text-[#2c1810]">
            <input
              type="checkbox"
              checked={form.marketing_opt_in}
              onChange={(e) => setForm({ ...form, marketing_opt_in: e.target.checked })}
            />
            Agreed to marketing emails
          </label>
          {c.address || c.town ? (
            <p className="col-span-2 text-xs text-[#9a7a62]">
              Registry address: {[c.address, c.postal_code, c.town].filter(Boolean).join(", ")}
            </p>
          ) : null}
        </div>
      </Section>

      <Section title="Account and discount">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <AdminPillButton active={account.active} onClick={() => setAccount({ ...account, active: true })}>
              Account on
            </AdminPillButton>
            <AdminPillButton active={!account.active} onClick={() => setAccount({ ...account, active: false })}>
              Account off
            </AdminPillButton>
          </div>
          <p className="text-xs text-[#9a7a62] -mt-2">
            Off only stops charging to the account. The discount below still applies at the till.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Discount %">
              <input
                className={inputClass}
                type="number"
                min={0}
                max={100}
                value={account.discount_pct}
                onChange={(e) => setAccount({ ...account, discount_pct: Number(e.target.value) })}
              />
            </Field>
            <Field label="Monthly limit (kr)" hint="Empty means no limit">
              <input
                className={inputClass}
                type="number"
                min={0}
                value={account.monthly_cap_isk}
                onChange={(e) => setAccount({ ...account, monthly_cap_isk: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Discount applies to" hint="Nothing ticked means the whole menu">
            <div className="flex flex-wrap gap-2 mt-1">
              {DISCOUNT_CATEGORIES.map((cat) => (
                <AdminPillButton
                  key={cat.id}
                  active={account.discount_scope.includes(cat.id)}
                  onClick={() => toggleScope(cat.id)}
                >
                  {cat.label}
                </AdminPillButton>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm text-[#2c1810]">
              <input
                type="checkbox"
                checked={account.is_staff}
                onChange={(e) => setAccount({ ...account, is_staff: e.target.checked })}
              />
              Staff account
            </label>
            <Field label="Payday customer id">
              <input
                className={inputClass}
                value={account.payday_customer_id}
                onChange={(e) => setAccount({ ...account, payday_customer_id: e.target.value })}
              />
            </Field>
          </div>
          {account.exists && c.customer_accounts?.activated_at ? (
            <p className="text-xs text-[#9a7a62]">
              Turned on {day(c.customer_accounts.activated_at)}
              {c.customer_accounts.activated_by ? ` by ${c.customer_accounts.activated_by}` : ""}
            </p>
          ) : null}
        </div>
      </Section>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-full bg-[#ff914d] text-black text-sm font-semibold hover:bg-[#ff7a2e] disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>

      <Section title="History">
        <History h={h} />
      </Section>

      {!c.merged_into ? <Merge id={id} onMerged={(into) => { onChanged(); onOpen(into); }} /> : null}

      <p className="text-xs text-[#c9b8a8]">
        Added {day(c.created_at)} · from {c.created_from}
        {c.source_table ? ` (${c.source_table})` : ""}
      </p>
    </Drawer>
  );
}

function History({ h }) {
  const lines = [
    ...h.bills.map((b) => ({
      at: b.closed_at ?? b.opened_at,
      what: `Till bill ${b.receipt_number ?? ""}`.trim(),
      detail: `${kr(b.total_isk)}${b.discount_isk ? ` · ${kr(b.discount_isk)} off` : ""} · ${b.status}`,
    })),
    ...h.bookings.map((b) => ({
      at: b.booking_date,
      what: `Booking ${b.reference_id}`,
      detail: `${b.party} people · ${String(b.booking_time).slice(0, 5)} · ${b.status}`,
    })),
    ...h.tribeCards.map((t) => ({
      at: t.issued_at,
      what: "Tribe card",
      detail: `${t.discount_percent}% · ${t.status}${t.expires_at ? ` · until ${day(t.expires_at)}` : ""}`,
    })),
    ...h.giftCards.map((g) => ({
      at: g.created_at,
      what: "Gift card bought",
      detail: `${kr(g.amount)} · ${kr(g.remaining_balance)} left · ${g.status}`,
    })),
  ].sort((a, b) => String(b.at).localeCompare(String(a.at)));

  if (!lines.length && !h.mergedFrom.length) {
    return <p className="text-sm text-[#9a7a62]">Nothing yet.</p>;
  }
  return (
    <div className="space-y-2">
      {lines.map((l, i) => (
        <div key={i} className="flex justify-between gap-3 text-sm border-b border-[#f6efe6] pb-2">
          <span className="text-[#2c1810]">
            {l.what}
            <span className="block text-xs text-[#9a7a62]">{l.detail}</span>
          </span>
          <span className="text-xs text-[#9a7a62] shrink-0">{day(l.at)}</span>
        </div>
      ))}
      {h.mergedFrom.length ? (
        <p className="text-xs text-[#9a7a62]">Merged in: {h.mergedFrom.map((m) => m.name).join(", ")}</p>
      ) : null}
    </div>
  );
}

function Merge({ id, onMerged }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(q)}`);
      const json = await res.json().catch(() => ({}));
      setResults((json.customers ?? []).filter((c) => c.id !== id).slice(0, 6));
    }, 250);
    return () => clearTimeout(t);
  }, [q, id]);

  const merge = async (into) => {
    if (!window.confirm(`Merge this customer into ${into.name}? Their cards, bookings and bills move over.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/customers/${id}/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ into: into.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(`Merged into ${into.name}`);
      onMerged(into.id);
    } catch (e) {
      toast.error(e.message || "Could not merge");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section title="Duplicate?">
      <p className="text-xs text-[#9a7a62] mb-2">
        Find the customer to keep. This one is merged into it, and its cards, bookings and till bills move over.
      </p>
      <input className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the one to keep" />
      <div className="mt-2 space-y-1">
        {results.map((r) => (
          <button
            key={r.id}
            disabled={busy}
            onClick={() => merge(r)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#f0e6d8] text-sm text-left hover:border-[#ff914d]"
          >
            <span>
              {r.name}
              {r.company ? <span className="text-[#9a7a62]"> · {r.company}</span> : null}
            </span>
            <GitMerge className="w-4 h-4 text-[#ff914d]" />
          </button>
        ))}
      </div>
    </Section>
  );
}

function AddCustomer({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", kennitala: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const canSave = useMemo(() => form.name.trim().length >= 2, [form.name]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Customer added");
      onCreated(json.id);
    } catch (e) {
      toast.error(e.message || "Could not add");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer title="Add customer" onClose={onClose}>
      <p className="text-sm text-[#9a7a62]">
        At the till, customers are created automatically from a kennitala. Use this for anyone you want to set up ahead.
      </p>
      <div className="space-y-3">
        <Field label="Name">
          <input className={inputClass} value={form.name} onChange={set("name")} autoFocus />
        </Field>
        <Field label="Company">
          <input className={inputClass} value={form.company} onChange={set("company")} />
        </Field>
        <Field label="Kennitala">
          <input className={inputClass} value={form.kennitala} onChange={set("kennitala")} inputMode="numeric" />
        </Field>
        <Field label="Email">
          <input className={inputClass} value={form.email} onChange={set("email")} type="email" />
        </Field>
        <Field label="Phone">
          <input className={inputClass} value={form.phone} onChange={set("phone")} />
        </Field>
      </div>
      <button
        onClick={save}
        disabled={!canSave || saving}
        className="w-full py-3 rounded-full bg-[#ff914d] text-black text-sm font-semibold hover:bg-[#ff7a2e] disabled:opacity-50"
      >
        {saving ? "Adding…" : "Add customer"}
      </button>
    </Drawer>
  );
}
