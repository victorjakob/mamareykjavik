"use client";

import { useEffect, useMemo, useState } from "react";
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

function Metric({ label, value, sub }) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: "#faf6f0" }}>
      <p className="text-xs" style={{ color: MUTED }}>{label}</p>
      <p className="mt-1 text-2xl font-semibold" style={{ color: DARK }}>
        {value}
        {sub ? <span className="ml-1 text-sm font-normal" style={{ color: MUTED }}>{sub}</span> : null}
      </p>
    </div>
  );
}

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

  const maxRevenue = useMemo(() => {
    if (!data) return 0;
    return Math.max(1, ...data.methods.map((m) => m.revenue));
  }, [data]);

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

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Metric label="Total revenue" value={isk(totals.revenue)} sub="kr" />
        <Metric label="Avg. ticket" value={isk(avg)} sub="kr" />
        <Metric label="Online share" value={onlinePct} sub="%" />
      </div>

      <p className="mb-3 mt-6 text-sm" style={{ color: MUTED }}>Revenue by payment method</p>
      <div className="flex flex-col gap-3">
        {methods.map((m) => {
          const rate = FEE_RATE[m.key];
          const on = feeOn[m.key];
          return (
            <div key={m.key}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <span style={{ color: DARK }}>{m.label}</span>
                  {rate ? (
                    <FeeSwitch
                      on={on}
                      label={`Service fee ${FEE_LABEL[m.key]}`}
                      onClick={() => toggleFee(m.key)}
                    />
                  ) : null}
                </span>
                <span className="shrink-0" style={{ color: MUTED }}>{isk(m.revenue)} kr · {m.tickets}</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "#f1e9df" }}>
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${Math.round((m.revenue / maxRevenue) * 100)}%`, background: ORANGE, minWidth: m.revenue > 0 ? 6 : 0 }}
                />
              </div>
            </div>
          );
        })}
      </div>

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
        {totalFees > 0 && (
          <div className="mt-3 flex items-center justify-between text-xs" style={{ color: MUTED }}>
            <span>Card service fees</span>
            <span>−{isk(totalFees)} kr · net {isk(netRevenue)} kr</span>
          </div>
        )}
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
    </div>
  );
}
