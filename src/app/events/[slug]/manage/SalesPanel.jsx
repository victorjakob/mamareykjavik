"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, BarChart2 } from "lucide-react";

const ORANGE = "#ff914d";
const DARK = "#2c1810";
const MUTED = "#9a7a62";
const BORDER = "#f0e6d8";

function isk(n) {
  return new Intl.NumberFormat("is-IS").format(Math.round(Number(n) || 0));
}

// Payment-processor service fees we absorb, by ticket status. When switched on
// these come off the gross before the host/venue split, so the split reflects
// the real net takings rather than the headline amount.
const FEE_RATE = { paid: 0.05, card: 0.025 }; // online card 5%, card reader 2.5%
const FEE_LABEL = { paid: "5%", card: "2.5%" };

// A clearly-tappable labelled switch for the per-method service fee.
function FeeSwitch({ on, label, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      title={on ? "Fee applied — tap to take it out of the split" : "Fee off — tap to apply it"}
      className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] transition-colors"
      style={
        on
          ? { background: "#fff3ea", borderColor: "#ffd9bf", color: "#8a4b22" }
          : { background: "#faf6f0", borderColor: "#ece3d7", color: MUTED }
      }
    >
      <span>{label}</span>
      <span
        aria-hidden
        style={{
          position: "relative",
          width: 24,
          height: 14,
          borderRadius: 999,
          background: on ? ORANGE : "#cbbfae",
          transition: "background .15s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: on ? 12 : 2,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#fff",
            transition: "left .15s",
          }}
        />
      </span>
    </button>
  );
}

const VIOLET = "#6d28d9";

// Read-only: White Lotus door sales hand-entered in Mama Manager. Not part of
// the online ticket totals or the host/venue split above/below.
function WhiteLotusDoorSales({ doorSales }) {
  if (!doorSales || (doorSales.error && !doorSales.entries?.length)) return null;
  const { entries = [], total = 0 } = doorSales;
  return (
    <div className="mt-6 rounded-xl p-4" style={{ border: "1px solid #ddd6fe", background: "#f5f3ff" }}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold" style={{ color: VIOLET }}>White Lotus door sales (hand-entered)</span>
        <span className="text-sm font-semibold" style={{ color: VIOLET }}>{isk(total)} kr</span>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs" style={{ color: "#7c6aa8" }}>No White Lotus entries linked to this event yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => (
            <li key={e.id} className="rounded-lg bg-white px-3 py-2 text-sm" style={{ border: "1px solid #ede9fe" }}>
              <div className="flex justify-between gap-2">
                <span style={{ color: DARK }}>{e.report_date} · {e.event_name}</span>
                <span style={{ color: VIOLET }}>{isk(Number(e.terminal_amount || 0) + Number(e.cash_amount || 0))} kr</span>
              </div>
              <div className="text-xs" style={{ color: MUTED }}>
                Terminal {isk(e.terminal_amount)} kr · Cash {isk(e.cash_amount)} kr · by {e.submitted_by}
              </div>
              {e.notes ? <div className="mt-1 text-xs" style={{ color: MUTED }}>{e.notes}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SalesPanel({ slug }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [venueFee, setVenueFee] = useState(30);
  const [feeOn, setFeeOn] = useState({ paid: true, card: true });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/events/${slug}/manage/sales`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Couldn't load sales");
        if (alive) {
          setData(json);
          if (json.feeConfig) setFeeOn(json.feeConfig);
        }
      } catch (e) {
        if (alive) setError(e.message || "Couldn't load sales");
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  // Persist the toggle on the event so it's remembered next load and inherited
  // by a no-login host opening the same link. Optimistic, reverts on failure.
  async function toggleFee(key) {
    const next = !feeOn[key];
    setFeeOn((p) => ({ ...p, [key]: next }));
    try {
      const res = await fetch(`/events/${slug}/manage/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(key === "paid" ? { online: next } : { card: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setFeeOn((p) => ({ ...p, [key]: !next }));
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center rounded-xl px-6 py-10 text-center" style={{ background: "#fff5f4" }}>
        <AlertCircle className="mb-3 h-6 w-6" style={{ color: "#dc2626" }} />
        <p className="text-sm" style={{ color: "#b23b2d" }}>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16" style={{ color: MUTED }}>
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const { totals, methods } = data;

  if (totals.tickets === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl px-6 py-12 text-center" style={{ background: "#faf6f0" }}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#fff3ea" }}>
          <BarChart2 className="h-6 w-6" style={{ color: ORANGE }} strokeWidth={1.75} />
        </div>
        <p className="text-sm" style={{ color: MUTED }}>No sales yet. Revenue shows up here as tickets sell.</p>
      </div>
    );
  }

  const avg = totals.tickets ? totals.revenue / totals.tickets : 0;
  const online = methods.find((m) => m.key === "paid")?.tickets || 0;
  const onlinePct = totals.tickets ? Math.round((online / totals.tickets) * 100) : 0;

  const totalFees = methods.reduce((s, m) => {
    const rate = FEE_RATE[m.key];
    return s + (rate && feeOn[m.key] ? m.revenue * rate : 0);
  }, 0);
  const netRevenue = totals.revenue - totalFees;
  const host = Math.round((netRevenue * (100 - venueFee)) / 100);
  const venue = Math.round((netRevenue * venueFee) / 100);

  // Main row list (see sales route for how each row is derived). Rows with no
  // tickets and no revenue are hidden. Door overlaps POS/cash/transfer: a
  // walk-in paid by card shows under both "Ticket at door" and "POS".
  const r = data.rows || {};
  const doorSub = (() => {
    const parts = (r.door?.prices || []).map((p) =>
      p.price === 0 ? `${p.count} × free` : `${p.count} × ${isk(p.price)} kr`
    );
    if (r.door?.exchange) parts.push(`${r.door.exchange} × exchange (free)`);
    return parts.join(" · ");
  })();
  const saleRows = [
    { key: "online", label: "Online sales", feeKey: "paid", ...(r.online || {}) },
    { key: "door", label: "Ticket at door", sub: doorSub, ...(r.door || {}) },
    { key: "pos", label: "POS-registered tickets", feeKey: "card", ...(r.pos || {}) },
    { key: "cash", label: "Cash brought in", ...(r.cash || {}) },
    { key: "transfer", label: "Bank transfer", ...(r.transfer || {}) },
  ].filter((x) => (x.tickets || 0) > 0 || (x.revenue || 0) > 0);

  // Service fee row: same fee maths as before (FEE_RATE × method revenue,
  // per-method switch persisted on the event). Shown when either method sold.
  const feeRows = methods
    .filter((m) => FEE_RATE[m.key] && m.revenue > 0)
    .map((m) => ({ key: m.key, label: m.key === "paid" ? "Online" : "POS" }));

  return (
    <div>
      <div className="flex flex-col divide-y rounded-xl" style={{ border: `1px solid ${BORDER}`, borderColor: BORDER }}>
        {saleRows.map((r) => (
          <div key={r.key} className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-medium" style={{ color: DARK }}>{r.label}</span>
              </div>
              {r.sub ? <p className="mt-0.5 text-xs" style={{ color: MUTED }}>{r.sub}</p> : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-semibold" style={{ color: DARK }}>{isk(r.revenue)}<span className="ml-1 text-sm font-normal" style={{ color: MUTED }}>kr</span></p>
              <p className="text-xs" style={{ color: MUTED }}>{r.tickets} {r.tickets === 1 ? "ticket" : "tickets"}</p>
            </div>
          </div>
        ))}
        {feeRows.length > 0 && (
          <div className="flex items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <span className="text-base font-medium" style={{ color: DARK }}>Service fee</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {feeRows.map((f) => (
                  <FeeSwitch
                    key={f.key}
                    on={feeOn[f.key]}
                    label={`${f.label} ${FEE_LABEL[f.key]}`}
                    onClick={() => toggleFee(f.key)}
                  />
                ))}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-semibold" style={{ color: DARK }}>{totalFees > 0 ? "−" : ""}{isk(totalFees)}<span className="ml-1 text-sm font-normal" style={{ color: MUTED }}>kr</span></p>
              <p className="text-xs" style={{ color: MUTED }}>net {isk(netRevenue)} kr</p>
            </div>
          </div>
        )}
      </div>

      <WhiteLotusDoorSales doorSales={data.doorSales} />

      <div className="mt-6 rounded-xl p-4" style={{ border: `1px solid ${BORDER}` }}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-sm font-medium" style={{ color: DARK }}>Host / venue split</span>
          <span className="text-sm" style={{ color: MUTED }}>Venue {venueFee}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={venueFee}
          onChange={(e) => setVenueFee(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: ORANGE }}
        />
        <div className="mt-3 flex gap-3">
          <div className="flex-1 rounded-xl px-4 py-3" style={{ background: "#faf6f0" }}>
            <p className="text-xs" style={{ color: MUTED }}>Host keeps</p>
            <p className="mt-1 text-xl font-semibold" style={{ color: DARK }}>{isk(host)}<span className="ml-1 text-sm font-normal" style={{ color: MUTED }}>kr</span></p>
          </div>
          <div className="flex-1 rounded-xl px-4 py-3" style={{ background: "#faf6f0" }}>
            <p className="text-xs" style={{ color: MUTED }}>Venue</p>
            <p className="mt-1 text-xl font-semibold" style={{ color: DARK }}>{isk(venue)}<span className="ml-1 text-sm font-normal" style={{ color: MUTED }}>kr</span></p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-xs" style={{ color: MUTED }}>
        Total revenue {isk(totals.revenue)} kr · Avg. ticket {isk(avg)} kr · Online share {onlinePct}%
      </p>
    </div>
  );
}
