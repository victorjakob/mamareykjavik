"use client";

import { useState } from "react";
import { formatPrice } from "@/util/IskFormat";

const inputCls =
  "w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-[#f0ebe3] placeholder-[#8a7e72] focus:border-[#ff914d]/60 focus:outline-none focus:ring-1 focus:ring-[#ff914d]/40 transition-colors [color-scheme:dark]";

export default function PrivateTourSection({ tour }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferred_date: "",
    group_size: tour.private_base_guests || 2,
    message: "",
  });

  const baseGuests = tour.private_base_guests || 4;
  const maxGuests = tour.private_max_guests || tour.max_capacity;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/tours/private-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tour_name: tour.name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send enquiry");
      }
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="relative bg-[#160f0a] border-t border-white/[0.06] py-24 px-6 text-center overflow-hidden">
      {/* Faint watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <span
          className="font-cormorant font-light italic text-white/[0.025]"
          style={{
            fontSize: "clamp(7rem, 20vw, 16rem)",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          Private
        </span>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
          <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
            Private journey
          </span>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
        </div>

        <h2
          className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-8"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}
        >
          Make it yours alone
        </h2>

        <div className="max-w-2xl mx-auto text-[#a09488] text-base leading-relaxed space-y-3 mb-10">
          {(tour.private_description || "").split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mb-10">
          <p className="font-cormorant font-light text-[#f0ebe3] text-2xl sm:text-3xl mb-1">
            {formatPrice(tour.private_base_price)}
            <span className="text-[#a09488] text-base sm:text-lg">
              {" "}
              · 1–{baseGuests} guests
            </span>
          </p>
          {tour.private_extra_guest_price && maxGuests > baseGuests && (
            <p className="text-sm text-[#8a7e72]">
              Each additional guest up to {maxGuests}:{" "}
              {formatPrice(tour.private_extra_guest_price)}
            </p>
          )}
        </div>

        {sent ? (
          <div className="max-w-md mx-auto p-7 rounded-2xl bg-white/[0.03] border border-[#ff914d]/25">
            <p className="text-[#f0ebe3] font-medium mb-2">
              Thank you — your enquiry is on its way ✦
            </p>
            <p className="text-sm text-[#a09488]">
              We&apos;ll reply within one working day to arrange your private
              departure.
            </p>
          </div>
        ) : open ? (
          <form onSubmit={submit} className="max-w-md mx-auto space-y-3 text-left">
            <input
              type="text"
              required
              placeholder="Your name"
              value={form.name}
              onChange={set("name")}
              className={inputCls}
            />
            <input
              type="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={set("email")}
              className={inputCls}
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={set("phone")}
              className={inputCls}
            />
            <div className="flex gap-3">
              <input
                type="date"
                required
                value={form.preferred_date}
                onChange={set("preferred_date")}
                className={inputCls + " flex-1"}
              />
              <select
                value={form.group_size}
                onChange={set("group_size")}
                className={inputCls + " w-auto"}
              >
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n} className="bg-[#160f0a]">
                    {n} guest{n === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              rows={3}
              placeholder="Anything we should know? (optional)"
              value={form.message}
              onChange={set("message")}
              className={inputCls + " resize-none"}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="w-full px-9 py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:bg-[#ff914d]/90 transition-all duration-200 disabled:opacity-50 shadow-[0_2px_20px_rgba(255,145,77,0.25)]"
            >
              {sending ? "Sending…" : "Send enquiry"}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/25 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-200"
          >
            Enquire about a private tour →
          </button>
        )}
      </div>
    </section>
  );
}
