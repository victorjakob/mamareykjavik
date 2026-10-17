"use client";

// Mobile-first claim view, same look as /pay/result (espresso band, white
// card on cream, Cormorant headings). States: unclaimed → confirm modal →
// claimed; plus claimed / cancelled / expired / invalid messages.

import { useState } from "react";
import Link from "next/link";

function fmt(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Atlantic/Reykjavik",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Atlantic/Reykjavik",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const MESSAGES = {
  cancelled: {
    eyebrow: "Credit cancelled",
    title: "Not available",
    body: "This credit has been cancelled. If you think that's a mistake, write to team@mama.is.",
  },
  expired: {
    eyebrow: "Credit expired",
    title: "This one has expired",
    body: "Sorry, this credit is past its date. Write to team@mama.is and we'll sort it out.",
  },
  invalid: {
    eyebrow: "Link not valid",
    title: "We can't find this credit",
    body: "Please check the link, or write to team@mama.is.",
  },
};

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#fbf5ec]">
      <section
        data-navbar-theme="dark"
        className="relative overflow-hidden bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12] pt-24 sm:pt-28 pb-16 px-5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,145,77,0.35) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(31,92,75,0.3) 0%, transparent 55%)",
          }}
        />
      </section>
      <main className="relative -mt-14 px-5 pb-16">
        <div className="max-w-md mx-auto rounded-3xl bg-white shadow-[0_10px_40px_-12px_rgba(44,24,16,0.25)] border border-[#f0e3d2] px-6 pt-0 pb-8 text-center">
          {children}
        </div>
        <p className="mt-8 text-center text-[12px] text-[#9a7a62]">
          Mama Reykjavík · Bankastræti 2 · team@mama.is
        </p>
      </main>
    </div>
  );
}

function Badge({ tone, children }) {
  const cls =
    tone === "ok"
      ? "bg-[#ff914d] text-white"
      : tone === "done"
        ? "bg-[#1f5c4b] text-white"
        : "bg-[#f3e7d9] text-[#8a5a3a]";
  return (
    <div className={`mx-auto -mt-8 mb-5 w-16 h-16 rounded-full flex items-center justify-center ring-8 ring-white ${cls}`}>
      {children}
    </div>
  );
}

function Title({ eyebrow, children }) {
  return (
    <>
      <p className="text-[11px] tracking-[0.3em] uppercase text-[#c76a2b] font-semibold mb-2">{eyebrow}</p>
      <h1
        className="font-cormorant italic font-light text-[#2c1810] text-[2.3rem] leading-tight mb-3"
        style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
      >
        {children}
      </h1>
    </>
  );
}

function ItemBox({ credit, children }) {
  return (
    <div className="mb-6 rounded-2xl bg-[#fbf5ec] border border-dashed border-[#e6cfb3] px-5 py-4">
      <p className="text-[12px] uppercase tracking-[0.15em] text-[#9a7a62] mb-1">Good for</p>
      <p className="text-[20px] font-semibold text-[#2c1810] leading-snug">{credit.item_label}</p>
      {children}
    </div>
  );
}

export default function ClaimView({ id, initialCredit, initialStatus, previewModal = false }) {
  const [credit, setCredit] = useState(initialCredit);
  const [status, setStatus] = useState(initialStatus);
  const [confirmOpen, setConfirmOpen] = useState(previewModal);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function redeem() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/claim/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.credit) setCredit(data.credit);
      if (res.ok && data.ok) {
        setStatus("claimed");
      } else if (data.status) {
        setStatus(data.status);
      } else {
        throw new Error(data.error || "Something went wrong");
      }
      setConfirmOpen(false);
    } catch (err) {
      setError(err.message || "Something went wrong — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "claimed" && credit) {
    return (
      <Shell>
        <Badge tone="done">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </Badge>
        <Title eyebrow="Claimed · Notað">Show this at the counter</Title>
        <p className="text-[15px] text-[#5e4636] leading-relaxed mb-6">
          Sýndu starfsfólkinu þennan skjá. Enjoy!
        </p>
        <ItemBox credit={credit}>
          <div className="mt-3 pt-3 border-t border-[#efe0cc] flex items-baseline justify-between gap-4 text-left">
            <span className="text-[12px] uppercase tracking-[0.15em] text-[#9a7a62]">Claimed</span>
            <span className="text-[14px] font-medium text-[#2c1810]">{fmt(credit.claimed_at)}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-4 text-left">
            <span className="text-[12px] uppercase tracking-[0.15em] text-[#9a7a62]">Code</span>
            <span className="text-[22px] font-semibold tracking-[0.2em] text-[#2c1810]">{credit.code}</span>
          </div>
        </ItemBox>
        <p className="text-[12px] text-[#9a7a62]">This credit has been used and can&apos;t be used again.</p>
      </Shell>
    );
  }

  if (status !== "unclaimed" || !credit) {
    const m = MESSAGES[status] || MESSAGES.invalid;
    return (
      <Shell>
        <Badge tone="neutral">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
            <path strokeLinecap="round" d="M12 7v6" />
            <circle cx="12" cy="17" r="0.6" fill="currentColor" />
          </svg>
        </Badge>
        <Title eyebrow={m.eyebrow}>{m.title}</Title>
        <p className="text-[15px] text-[#5e4636] leading-relaxed mb-6">{m.body}</p>
        {credit && status !== "invalid" && <ItemBox credit={credit} />}
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-[#ff914d] hover:bg-[#ff7a2e] text-[#1a0f08] rounded-full text-[14px] font-semibold tracking-[0.06em] transition-colors"
        >
          Back to mama.is
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <Badge tone="ok">
        <span className="text-2xl leading-none" aria-hidden>🌿</span>
      </Badge>
      <Title eyebrow="A little something from Mama">Your credit</Title>
      <p className="text-[15px] text-[#5e4636] leading-relaxed mb-6">
        {credit.customer_name ? `For ${credit.customer_name}. ` : ""}Use it at the counter at Mama, Bankastræti 2.
      </p>
      <ItemBox credit={credit}>
        {credit.expires_at && (
          <p className="mt-2 text-[12px] text-[#9a7a62]">Valid until {fmtDate(credit.expires_at)}</p>
        )}
      </ItemBox>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-[#ff914d] hover:bg-[#ff7a2e] text-[#1a0f08] rounded-full text-[15px] font-semibold tracking-[0.06em] transition-colors"
      >
        Use credit · Nota inneign
      </button>
      <p className="mt-3 text-[12px] text-[#9a7a62]">Tap this when you&apos;re at the counter, ready to order.</p>

      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <h2
              className="font-cormorant italic text-[#2c1810] text-[1.8rem] leading-tight mb-3"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Use it now?
            </h2>
            <p className="text-[14px] text-[#5e4636] leading-relaxed mb-1">
              By clicking this you will use it and it will not be usable again.
            </p>
            <p className="text-[13px] text-[#8a7261] leading-relaxed mb-4">
              Með því að smella notar þú inneignina og hún verður ekki nothæf aftur.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full mb-4 px-4 py-3 rounded-xl text-sm text-[#2c1810] placeholder-[#9a7a62] bg-[#faf6f2] border border-[#e8ddd3] focus:outline-none focus:border-[#ff914d]/60"
            />
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={redeem}
                disabled={busy}
                className="w-full px-6 py-3.5 bg-[#ff914d] hover:bg-[#ff7a2e] text-[#1a0f08] rounded-full text-[15px] font-semibold disabled:opacity-60"
              >
                {busy ? "Using…" : "Yes, use it · Já, nota"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
                className="w-full px-6 py-3 border border-[#e6cfb3] text-[#5c2e12] rounded-full text-[14px] font-medium"
              >
                Not yet · Ekki strax
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
