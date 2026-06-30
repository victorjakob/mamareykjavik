"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import toast from "react-hot-toast";
import AttendeesPanel from "./AttendeesPanel";
import SalesPanel from "./SalesPanel";
import {
  LayoutGrid,
  Users,
  BarChart2,
  DoorOpen,
  Pencil,
  KeyRound,
  Copy,
  RefreshCw,
  ExternalLink,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

const ORANGE = "#ff914d";
const DARK = "#2c1810";
const MUTED = "#9a7a62";
const BORDER = "#f0e6d8";

function isk(n) {
  return new Intl.NumberFormat("is-IS").format(Math.round(Number(n) || 0));
}

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "attendees", label: "Attendees", icon: Users },
  { id: "sales", label: "Ticket sales", icon: BarChart2 },
  { id: "door", label: "Door check-in", icon: DoorOpen },
  { id: "edit", label: "Edit", icon: Pencil },
];

// The four non-overview tabs still open the existing standalone screens for
// now; Phase 2 mounts them inline and lets the token visitor use them too.
const LINKS = {
  attendees: { href: "attendance", label: "Open attendees", icon: Users, blurb: "Guest list, check-in and messaging." },
  sales: { href: "sales-stats", label: "Open ticket sales", icon: BarChart2, blurb: "Revenue by method, daily sales and the host/venue split." },
  door: { href: "gatekeeper", label: "Open door kiosk", icon: DoorOpen, blurb: "The tablet check-in kiosk for the door." },
  edit: { href: "edit", label: "Open editor", icon: Pencil, blurb: "Event details, timing, pricing and hosts." },
};

function MetricCard({ label, value, sub }) {
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

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4 py-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>
      <span className="inline-flex items-center gap-2 text-sm" style={{ color: MUTED }}>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
        {label}
      </span>
      <span className="text-sm text-right" style={{ color: DARK }}>{value}</span>
    </div>
  );
}

export default function ManageHub({ event, mode, summary }) {
  const [tab, setTab] = useState("overview");
  const [token, setToken] = useState(event.manage_token);
  const [resetting, setResetting] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://mama.is";
  const link = `${origin}/events/${event.slug}/manage/enter?k=${token}`;
  const maskedLink = `${origin}/events/${event.slug}/manage/enter?k=${"•".repeat(12)}`;

  const dateStr = useMemo(() => {
    try { return format(new Date(event.date), "EEEE d MMMM yyyy · HH:mm"); }
    catch { return ""; }
  }, [event.date]);

  const daysToGo = useMemo(() => {
    const diff = new Date(event.date).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [event.date]);

  const seatsLeft = event.capacity ? Math.max(0, event.capacity - summary.soldCount) : null;
  const paymentLabel = { online: "Paid online", door: "Pay at the door", free: "Free" }[event.payment] || event.payment;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Private link copied");
    } catch {
      toast.error("Couldn't copy — long-press to copy manually");
    }
  }

  async function resetLink() {
    if (!window.confirm("Reset the private link? The old link stops working immediately for anyone who has it.")) return;
    setResetting(true);
    try {
      const res = await fetch(`/events/${event.slug}/manage/reset`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setToken(data.token);
      toast.success("New private link generated");
    } catch (e) {
      toast.error(e.message || "Reset failed");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-10 pt-24 sm:pt-28">
      <div
        className="overflow-hidden rounded-2xl bg-white"
        style={{ border: `1.5px solid ${BORDER}`, boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}
      >
        <div className="h-[3px] w-full" style={{ background: "linear-gradient(to right, #ff914d, #ffb06a40)" }} />

        <div className="px-5 pt-5 sm:px-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-semibold" style={{ color: DARK }}>{event.name}</h1>
                {event.sold_out && (
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "#fff1f0", color: "#dc2626" }}>
                    Sold out
                  </span>
                )}
              </div>
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm" style={{ color: MUTED }}>
                <Calendar className="h-4 w-4" strokeWidth={1.75} />
                {dateStr}
              </p>
            </div>
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium"
              style={{ background: "#fff", color: MUTED, border: `1.5px solid #e8ddd3` }}
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.9} />
              View public page
            </Link>
          </div>

          {/* Tab bar — underline row on desktop */}
          <div className="mt-5 hidden gap-1 sm:flex" style={{ borderBottom: `1px solid ${BORDER}` }}>
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className="inline-flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    color: active ? DARK : MUTED,
                    borderBottom: active ? `2px solid ${ORANGE}` : "2px solid transparent",
                    marginBottom: -1,
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab bar — wrapping pills on mobile, so nothing scrolls sideways */}
          <div className="mt-4 flex flex-wrap gap-2 pb-3.5 sm:hidden" style={{ borderBottom: `1px solid ${BORDER}` }}>
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                  style={
                    active
                      ? { background: "#fff3ea", color: "#8a4b22", border: "1px solid #ffd9bf" }
                      : { background: "#faf6f0", color: MUTED, border: "1px solid transparent" }
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 pb-7 pt-6 sm:px-7">
          {tab === "overview" ? (
            <div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard label="Tickets sold" value={summary.soldCount} sub={event.capacity ? `/ ${event.capacity}` : null} />
                <MetricCard label="Revenue" value={isk(summary.revenue)} sub="kr" />
                <MetricCard label={seatsLeft != null ? "Seats left" : "Checked in"} value={seatsLeft != null ? seatsLeft : summary.checkedIn} />
                <MetricCard label="Days to go" value={daysToGo} />
              </div>

              {/* Private link card */}
              <div className="mt-5 rounded-xl p-4" style={{ border: `1px solid ${BORDER}` }}>
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <KeyRound className="h-4 w-4" style={{ color: ORANGE }} strokeWidth={1.9} />
                  <span className="text-sm font-medium" style={{ color: DARK }}>Your private manage link</span>
                  <span className="ml-auto text-xs" style={{ color: MUTED }}>Full access · permanent · reset anytime</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <code
                    className="min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-xs"
                    style={{ background: "#faf6f0", color: MUTED }}
                    title="The real token is hidden — use Copy to grab the working link."
                  >
                    {maskedLink}
                  </code>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium"
                    style={{ background: "#fff", color: DARK, border: `1.5px solid #e8ddd3` }}
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={resetLink}
                    disabled={resetting}
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium disabled:opacity-50"
                    style={{ background: "#fff", color: DARK, border: `1.5px solid #e8ddd3` }}
                  >
                    {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.9} />}
                    Reset
                  </button>
                </div>
              </div>

              {/* Event details */}
              <div className="mt-5">
                <DetailRow icon={CreditCard} label="Price" value={Number(event.price) > 0 ? `${isk(event.price)} kr` : "Free"} />
                <DetailRow icon={CreditCard} label="Payment" value={paymentLabel} />
                <DetailRow icon={Clock} label="Duration" value={event.duration ? `${event.duration} ${Number(event.duration) === 1 ? "hour" : "hours"}` : null} />
                <DetailRow icon={MapPin} label="Location" value={event.location} />
                <DetailRow icon={Users} label="Host" value={event.host} />
                <DetailRow icon={Users} label="Co-host" value={event.host_secondary} />
              </div>
            </div>
          ) : tab === "attendees" ? (
            <AttendeesPanel slug={event.slug} />
          ) : tab === "sales" ? (
            <SalesPanel slug={event.slug} />
          ) : (
            <PlaceholderTab slug={event.slug} info={LINKS[tab]} />
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs" style={{ color: MUTED }}>
        The editor and door kiosk open in their own full-screen view — no separate login needed when you're here through your private link.
      </p>
    </div>
  );
}

function PlaceholderTab({ slug, info, caveat }) {
  if (!info) return null;
  const Icon = info.icon;
  return (
    <div className="flex flex-col items-center rounded-xl px-6 py-10 text-center" style={{ background: "#faf6f0" }}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#fff3ea" }}>
        <Icon className="h-6 w-6" style={{ color: ORANGE }} strokeWidth={1.75} />
      </div>
      <p className="max-w-sm text-sm" style={{ color: MUTED }}>{info.blurb}</p>
      <Link
        href={`/events/manager/${slug}/${info.href}`}
        className="mt-5 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium"
        style={{ background: ORANGE, color: "#fff", boxShadow: "0 2px 8px rgba(255,145,77,0.28)" }}
      >
        {info.label}
        <ArrowUpRight className="h-4 w-4" strokeWidth={1.9} />
      </Link>
      {caveat && (
        <p className="mt-3 text-xs" style={{ color: MUTED }}>
          This page still asks for a host login for now — wired to your private link in the next update.
        </p>
      )}
    </div>
  );
}
