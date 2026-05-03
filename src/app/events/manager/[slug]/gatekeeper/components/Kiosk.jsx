// The kiosk itself — the door-facing UI once Gatekeeper is active.
//
// Flow state machine:
//   welcome      → "Have a ticket?" / "Need a ticket?"
//     ├── hasTicket → ticket picker → welcome (done)
//     └── walkin    → identity → payment → (tip) → complete → welcome
//
// The kiosk has a small, quiet "lock" button in the corner that takes the
// staff to the ExitPinScreen — which then hands off to the reconciliation
// payload when the PIN is confirmed.

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Lock,
  Search,
  X,
  CircleDollarSign,
  CreditCard,
  ArrowLeftRight,
  HeartHandshake,
  ArrowLeft,
} from "lucide-react";
import {
  TONE,
  SACRED_GRADIENT,
  Eyebrow,
  KioskTitle,
  BigButton,
  Panel,
  BigInput,
  BigCheckbox,
  KioskSpinner,
  EnsoCircle,
  SealDot,
} from "./ui";

const METHOD_META = {
  cash:     { label: "Cash",          Icon: CircleDollarSign, sub: "Pay the host in cash" },
  pos:      { label: "Card",          Icon: CreditCard,       sub: "Tap or insert at the POS" },
  transfer: { label: "Bank transfer", Icon: ArrowLeftRight,   sub: "Send via your banking app" },
  exchange: { label: "Exchange",      Icon: HeartHandshake,   sub: "Barter, work-trade, or gift" },
};

const TIP_SUGGESTIONS = [500, 1000, 2000]; // ISK — gentle, not pushy

export default function Kiosk({ slug, event, config, onUnlockRequested }) {
  const [screen, setScreen] = useState("welcome"); // welcome | picker | walkin | payment | tip | done
  const [tickets, setTickets] = useState(null); // lazy-loaded for picker
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Walk-in draft
  const [form, setForm] = useState({
    buyer_name: "",
    buyer_email: "",
    payment: null,      // "cash" | "pos" | "transfer" | "exchange"
    tip: 0,
    receipt: false,
    exchange_note: "",
  });

  const [lastAttendee, setLastAttendee] = useState(null);
  const idleTimerRef = useRef(null);

  // After a confirmation screen, bounce back to welcome automatically.
  useEffect(() => {
    if (screen !== "done") return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => reset(), 6500);
    return () => idleTimerRef.current && clearTimeout(idleTimerRef.current);
  }, [screen]);

  // Also bounce back to welcome if the kiosk has been idle on an
  // in-progress screen for too long — respects privacy at the door.
  useEffect(() => {
    if (screen === "welcome" || screen === "done") return;
    const t = setTimeout(() => reset(), 90_000); // 90s idle
    return () => clearTimeout(t);
  }, [screen, form]);

  const reset = () => {
    setScreen("welcome");
    setForm({
      buyer_name: "",
      buyer_email: "",
      payment: null,
      tip: 0,
      receipt: false,
      exchange_note: "",
    });
    setSearch("");
    setError(null);
    setLastAttendee(null);
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch(`/api/events/gatekeeper/${slug}/tickets`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not load tickets");
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTickets(false);
    }
  };

  const openPicker = async () => {
    setScreen("picker");
    setSearch("");
    if (!tickets) await loadTickets();
  };

  const checkInTicket = async (ticket) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/gatekeeper/${slug}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: ticket.id, used: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Check-in failed");
      // Mirror update locally so the list shows the new state if the
      // guest bounces back by accident.
      setTickets((cur) => (cur || []).map((t) => (t.id === ticket.id ? data.ticket : t)));
      setLastAttendee({ name: ticket.buyer_name, type: "ticket" });
      setScreen("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitWalkIn = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        buyer_name: form.buyer_name,
        buyer_email: form.buyer_email || "",
        payment: form.payment,
        price: Number(event?.price || 0),
        tip: form.tip || 0,
        receipt: form.receipt,
        exchange_note: form.exchange_note || "",
      };
      const res = await fetch(`/api/events/gatekeeper/${slug}/walkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Walk-in failed");
      setLastAttendee({ name: form.buyer_name, type: "walkin", method: form.payment });
      setScreen("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    const q = search.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter(
      (t) =>
        (t.buyer_name || "").toLowerCase().includes(q) ||
        (t.buyer_email || "").toLowerCase().includes(q)
    );
  }, [tickets, search]);

  return (
    <div className="relative" style={{ minHeight: "100dvh", background: SACRED_GRADIENT }}>
      {/* Persistent lock button (always available — staff can close anytime). */}
      <button
        type="button"
        onClick={onUnlockRequested}
        className="fixed rounded-full flex items-center justify-center"
        aria-label="Close Gatekeeper"
        style={{
          top: "clamp(1rem, 2vw, 1.4rem)",
          right: "clamp(1rem, 2vw, 1.4rem)",
          width: 44, height: 44,
          background: "rgba(247,242,232,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${TONE.line}`,
          color: TONE.muted,
          zIndex: 30,
        }}
      >
        <Lock className="h-4 w-4" />
      </button>

      <div className="mx-auto w-full" style={{ maxWidth: 960, padding: "clamp(2rem, 5vw, 4rem) clamp(1.25rem, 3vw, 2.5rem)" }}>
        <AnimatePresence mode="wait">
          {screen === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center relative"
            >
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: "translate(-50%, -54%)",
                  pointerEvents: "none",
                }}
              >
                <EnsoCircle
                  size={340}
                  stroke={1}
                  color={TONE.bronze}
                  opacity={0.075}
                  breathing
                />
              </div>

              <div className="relative">
                <Eyebrow align="center">Check-in</Eyebrow>
                <div className="mt-4">
                  <KioskTitle weight="poetic">
                    <span style={{ color: TONE.ink }}>Welcome</span>
                  </KioskTitle>
                </div>
                <p
                  className="mt-5 mx-auto font-semibold"
                  style={{
                    color: TONE.ink,
                    fontSize: "clamp(1.25rem, 2.4vw, 1.55rem)",
                    maxWidth: 720,
                    lineHeight: 1.3,
                  }}
                >
                  {event?.name || "Tonight's event"}
                </p>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto">
                  <ChoiceCard
                    onClick={openPicker}
                    title="I have a ticket"
                    sub="Find my name on the list"
                    emphasis={false}
                  />
                  <ChoiceCard
                    onClick={() => setScreen("walkin")}
                    title="I need a ticket"
                    sub="Buy one here at the door"
                    emphasis={true}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {screen === "picker" && (
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <BackRow onBack={reset} label="Start over" />
              <div className="text-center">
                <KioskTitle>Find your name</KioskTitle>
              </div>

              <div className="mt-8 mx-auto max-w-xl">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: TONE.muted }} />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type your name"
                    className="w-full rounded-2xl pl-14 pr-14 py-5 focus:outline-none font-semibold"
                    style={{
                      background: "#fff",
                      border: `1.5px solid ${TONE.line}`,
                      color: TONE.ink,
                      fontSize: "clamp(1.15rem, 2vw, 1.35rem)",
                    }}
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-5 top-1/2 -translate-y-1/2" aria-label="Clear">
                      <X className="h-5 w-5" style={{ color: TONE.muted }} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 max-w-xl mx-auto">
                {loadingTickets && <KioskSpinner label="Loading the list" />}
                {!loadingTickets && filteredTickets.length === 0 && (
                  <div className="text-center py-10">
                    <p style={{ color: TONE.muted }}>
                      {search ? "No match found. You can get a ticket at the door instead." : "No tickets on the list yet."}
                    </p>
                    <div className="mt-6">
                      <BigButton onClick={() => setScreen("walkin")} tone="ink">
                        I need a ticket
                      </BigButton>
                    </div>
                  </div>
                )}
                {!loadingTickets && filteredTickets.length > 0 && (
                  <div className="space-y-2.5">
                    {filteredTickets.map((t) => (
                      <TicketRow key={t.id} ticket={t} onPick={checkInTicket} submitting={submitting} />
                    ))}
                  </div>
                )}
              </div>
              {error && <p className="mt-6 text-center text-sm" style={{ color: TONE.danger }}>{error}</p>}
            </motion.div>
          )}

          {screen === "walkin" && (
            <motion.div
              key="walkin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <BackRow onBack={() => setScreen("welcome")} label="Back" />
              <div className="text-center"><KioskTitle>Your name</KioskTitle></div>

              <div className="mt-8 space-y-6">
                <BigInput
                  label="Your name"
                  value={form.buyer_name}
                  onChange={(v) => setForm({ ...form, buyer_name: v })}
                  placeholder="First and last name"
                  autoFocus
                  required
                />
                <BigInput
                  label="Email"
                  value={form.buyer_email}
                  onChange={(v) => setForm({ ...form, buyer_email: v })}
                  placeholder="you@example.com"
                  type="email"
                  inputMode="email"
                />
                <p className="text-xs" style={{ color: TONE.muted }}>
                  Only used for Mama updates and your receipt. Never spam.
                </p>
              </div>

              <div className="mt-10">
                <BigButton
                  onClick={() => setScreen("payment")}
                  disabled={!form.buyer_name.trim()}
                >
                  Continue →
                </BigButton>
              </div>
            </motion.div>
          )}

          {screen === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <BackRow onBack={() => setScreen("walkin")} label="Back" />
              <div className="text-center"><KioskTitle>How are you paying?</KioskTitle></div>
              <p
                className="text-center mt-3 font-semibold"
                style={{ color: TONE.ink, fontSize: "clamp(1.05rem, 1.8vw, 1.2rem)" }}
              >
                Ticket · {Number(event?.price || 0).toLocaleString()} ISK
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {config.enabled_methods.map((m) => {
                  const meta = METHOD_META[m];
                  if (!meta) return null;
                  const selected = form.payment === m;
                  const Icon = meta.Icon;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm({ ...form, payment: m })}
                      className="text-left rounded-[20px] p-5 transition-all"
                      style={{
                        background: selected ? TONE.warm : "#fff",
                        border: `1.5px solid ${selected ? TONE.bronze : TONE.line}`,
                        boxShadow: "none",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-xl flex items-center justify-center"
                          style={{
                            width: 48, height: 48,
                            background: selected ? "#fff" : TONE.warm,
                            border: `1px solid ${selected ? TONE.bronze : TONE.line}`,
                          }}
                        >
                          <Icon className="h-5 w-5" style={{ color: selected ? TONE.bronze : TONE.sepia }} />
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: TONE.ink, fontSize: "clamp(1rem, 1.6vw, 1.1rem)" }}>
                            {meta.label}
                          </p>
                          <p className="text-sm" style={{ color: TONE.muted }}>{meta.sub}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Transfer details inline — the guest can transfer immediately */}
              {form.payment === "transfer" && (
                <Panel className="mt-5">
                  <Eyebrow>Transfer to</Eyebrow>
                  <div className="mt-3 space-y-1.5" style={{ color: TONE.ink, fontSize: "1.05rem" }}>
                    <p><span style={{ color: TONE.muted }}>KT · </span><strong>{config.bank_details.kt || "—"}</strong></p>
                    <p><span style={{ color: TONE.muted }}>Bank · </span><strong>{config.bank_details.bank || "—"}</strong></p>
                    {config.bank_details.explanation && (
                      <p><span style={{ color: TONE.muted }}>Reference · </span><strong>{config.bank_details.explanation}</strong></p>
                    )}
                  </div>
                </Panel>
              )}

              {/* Exchange requires a short note */}
              {form.payment === "exchange" && (
                <div className="mt-5">
                  <label className="block">
                    <span className="block mb-2 uppercase text-[10px] font-semibold" style={{ letterSpacing: "0.3em", color: TONE.sepia }}>
                      Tell us what you're offering
                    </span>
                    <textarea
                      autoFocus
                      value={form.exchange_note}
                      onChange={(e) => setForm({ ...form, exchange_note: e.target.value })}
                      rows={3}
                      maxLength={300}
                      placeholder="e.g. Volunteering at the next cacao ceremony, trading a sound bath session, gifting tonight in exchange for future…"
                      className="w-full rounded-2xl px-5 py-4 focus:outline-none"
                      style={{
                        background: TONE.warm,
                        border: `1.5px solid ${TONE.line}`,
                        color: TONE.ink,
                        fontSize: "1.05rem",
                        resize: "none",
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Receipt — only if host enabled */}
              {config.receipt_enabled && (
                <div className="mt-5">
                  <BigCheckbox
                    checked={form.receipt}
                    onChange={(v) => setForm({ ...form, receipt: v })}
                    label="Email me a receipt"
                    sub={form.receipt ? "Email is required if you want a receipt." : "Optional. Leave unchecked if you don't need one."}
                  />
                  {form.receipt && !form.buyer_email && (
                    <div className="mt-3">
                      <BigInput
                        label="Email for receipt"
                        value={form.buyer_email}
                        onChange={(v) => setForm({ ...form, buyer_email: v })}
                        placeholder="you@example.com"
                        type="email"
                        inputMode="email"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-10">
                <BigButton
                  onClick={() => {
                    if (config.tip_enabled && form.payment !== "exchange") {
                      setScreen("tip");
                    } else {
                      submitWalkIn();
                    }
                  }}
                  disabled={
                    !form.payment ||
                    (form.payment === "exchange" && !form.exchange_note.trim()) ||
                    (form.receipt && !form.buyer_email.trim()) ||
                    submitting
                  }
                >
                  {submitting ? "Saving…" : (config.tip_enabled && form.payment !== "exchange" ? "Continue →" : "Complete check-in")}
                </BigButton>
              </div>
              {error && <p className="mt-4 text-center text-sm" style={{ color: TONE.danger }}>{error}</p>}
            </motion.div>
          )}

          {screen === "tip" && (
            <motion.div
              key="tip"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-xl mx-auto"
            >
              <BackRow onBack={() => setScreen("payment")} label="Back" />
              <div className="text-center"><KioskTitle>Add a tip?</KioskTitle></div>
              <p
                className="text-center mt-3"
                style={{ color: TONE.sepia, fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)" }}
              >
                Optional. Goes directly to the host.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {TIP_SUGGESTIONS.map((amt) => {
                  const selected = form.tip === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setForm({ ...form, tip: amt })}
                      className="rounded-[20px] py-5 text-center font-semibold transition-all"
                      style={{
                        background: selected ? "#fff" : TONE.warm,
                        border: `1.5px solid ${selected ? TONE.bronze : TONE.line}`,
                        color: TONE.ink,
                        fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
                        boxShadow: "none",
                      }}
                    >
                      {amt.toLocaleString()} ISK
                    </button>
                  );
                })}
              </div>

              <div className="mt-3">
                <label className="block">
                  <span className="block mb-2 uppercase text-[10px] font-semibold" style={{ letterSpacing: "0.3em", color: TONE.sepia }}>
                    Custom amount (ISK)
                  </span>
                  <input
                    type="number"
                    value={form.tip || ""}
                    onChange={(e) => setForm({ ...form, tip: Number(e.target.value) || 0 })}
                    min={0}
                    step={100}
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full rounded-2xl px-5 py-4 focus:outline-none"
                    style={{
                      background: TONE.warm,
                      border: `1.5px solid ${TONE.line}`,
                      color: TONE.ink,
                      fontSize: "1.1rem",
                    }}
                  />
                </label>
              </div>

              <div className="mt-4 flex gap-3">
                <BigButton tone="ghost" onClick={() => { setForm({ ...form, tip: 0 }); submitWalkIn(); }} disabled={submitting}>
                  {submitting ? "Saving…" : "No thank you"}
                </BigButton>
                <BigButton tone="ink" onClick={submitWalkIn} disabled={submitting}>
                  {submitting ? "Saving…" : form.tip > 0 ? `Add ${form.tip.toLocaleString()} ISK` : "Complete"}
                </BigButton>
              </div>
              {error && <p className="mt-4 text-center text-sm" style={{ color: TONE.danger }}>{error}</p>}
            </motion.div>
          )}

          {screen === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center relative"
            >
              <div className="relative mx-auto" style={{ width: 200, height: 200 }}>
                <EnsoCircle
                  size={200}
                  stroke={1.75}
                  color={TONE.bronze}
                  opacity={0.75}
                  drawIn
                />
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-hidden
                >
                  <SealDot size={14} color={TONE.ember} />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.25 }}
                className="mt-8"
              >
                <div>
                  <KioskTitle>
                    <span style={{ color: TONE.ink }}>
                      Welcome, {lastAttendee?.name?.split(" ")[0] || "friend"}
                    </span>
                  </KioskTitle>
                </div>
                <p
                  className="mt-4 mx-auto max-w-md font-semibold"
                  style={{
                    color: TONE.bronze,
                    fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  You're checked in
                </p>
              </motion.div>

              {config.upsell_enabled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.7 }}
                  className="mt-10 mx-auto max-w-md"
                >
                  <Panel tone="warm">
                    <Eyebrow>Good to know</Eyebrow>
                    <p className="mt-3" style={{ color: TONE.ink, fontSize: "1.02rem", lineHeight: 1.65 }}>
                      The restaurant upstairs is open — stews, curries, handmade naan. A block of ceremonial cacao rests at the counter too, if one wants to come home with you.
                    </p>
                  </Panel>
                </motion.div>
              )}

              <p
                className="mt-10 text-[10px] uppercase"
                style={{ color: TONE.muted, letterSpacing: "0.42em" }}
              >
                Returning shortly
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── bits ──────────────────────────────────────────────────────────────────

function ChoiceCard({ title, sub, onClick, emphasis }) {
  return (
    <motion.button
      whileTap={{ scale: 0.988 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      onClick={onClick}
      className="text-center rounded-[26px] transition-all relative overflow-hidden"
      style={{
        minHeight: "clamp(11rem, 24vh, 13rem)",
        padding: "clamp(1.8rem, 3vw, 2.4rem)",
        background: emphasis ? TONE.warm : TONE.paper,
        color: TONE.ink,
        border: `1px solid ${emphasis ? TONE.bronze + "88" : TONE.line}`,
        boxShadow: emphasis
          ? `0 18px 44px -26px ${TONE.bronze}40, inset 0 1px 0 rgba(255,250,238,0.7)`
          : "0 10px 24px -26px rgba(36,24,16,0.16), inset 0 1px 0 rgba(255,250,238,0.6)",
      }}
    >
      {emphasis && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: -40,
            bottom: -40,
            pointerEvents: "none",
          }}
        >
          <EnsoCircle size={180} stroke={1} color={TONE.bronze} opacity={0.12} />
        </div>
      )}

      <div className="relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <SealDot size={6} color={emphasis ? TONE.bronze : TONE.muted} />
          <p
            className="uppercase text-[10px] font-semibold"
            style={{ letterSpacing: "0.42em", color: emphasis ? TONE.bronze : TONE.muted }}
          >
            {emphasis ? "At the door" : "Guest list"}
          </p>
        </div>
        <p
          className="font-semibold"
          style={{
            fontFamily: "ui-serif, Georgia, serif",
            fontSize: "clamp(1.85rem, 4vw, 2.4rem)",
            lineHeight: 1.1,
            color: TONE.ink,
            letterSpacing: "-0.012em",
          }}
        >
          {title}
        </p>
        <p
          className="mt-3 font-medium"
          style={{
            color: TONE.sepia,
            fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)",
          }}
        >
          {sub}
        </p>
      </div>
    </motion.button>
  );
}

function TicketRow({ ticket, onPick, submitting }) {
  const used = !!ticket.used;
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      disabled={used || submitting}
      onClick={() => onPick(ticket)}
      className="w-full text-left rounded-2xl p-5 flex items-center justify-between gap-3 transition-all"
      style={{
        background: used ? "#f3f0ec" : "#fff",
        border: `1.5px solid ${used ? TONE.line : TONE.lineHi}`,
        opacity: used ? 0.6 : 1,
        cursor: used ? "default" : "pointer",
      }}
    >
      <div className="min-w-0">
        <p
          className="font-semibold truncate"
          style={{
            color: TONE.ink,
            fontSize: "clamp(1.15rem, 1.9vw, 1.3rem)",
            letterSpacing: "-0.01em",
          }}
        >
          {ticket.buyer_name}
        </p>
        {ticket.buyer_email && (
          <p
            className="truncate"
            style={{ color: TONE.muted, fontSize: "clamp(0.85rem, 1.3vw, 0.95rem)" }}
          >
            {ticket.buyer_email}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {used ? (
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase"
            style={{
              background: "#fff",
              color: TONE.moss,
              border: `1px solid ${TONE.line}`,
              letterSpacing: "0.24em",
            }}
          >
            <SealDot size={6} color={TONE.moss} /> Arrived
          </span>
        ) : (
          <span
            className="rounded-full px-5 py-2 text-[12px] font-semibold uppercase"
            style={{
              background: TONE.ink,
              color: TONE.paper,
              letterSpacing: "0.24em",
            }}
          >
            Check in
          </span>
        )}
      </div>
    </motion.button>
  );
}

function BackRow({ onBack, label }) {
  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"
        style={{ background: "#fff", border: `1.5px solid ${TONE.line}`, color: TONE.sepia }}
      >
        <ArrowLeft className="h-4 w-4" /> {label}
      </button>
    </div>
  );
}
