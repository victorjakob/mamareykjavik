"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9a7a62]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-[#e8ddd3] bg-[#fffaf5] px-4 py-3 text-sm text-[#2c1810] outline-none transition-all duration-200 placeholder:text-[#b8a998] hover:bg-white focus:border-[#ff914d] focus:ring-4 focus:ring-[#ff914d]/15";

export default function ContactChatbox() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();
  const pathname = usePathname() || "";

  const hideChatbox =
    pathname.startsWith("/admin") ||
    /\/events\/manager\/[^/]+\/gatekeeper(\/|$)/.test(pathname);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-contact-chatbox", handler);
    return () => window.removeEventListener("open-contact-chatbox", handler);
  }, []);

  // Listen for the mobile nav menu so we can hide the floating chat bubble
  // while the menu is open (prevents overlap with the profile icon on phones).
  useEffect(() => {
    if (typeof window === "undefined") return;
    setMobileNavOpen(document.body.dataset.mobileMenuOpen === "true");
    const handler = (e) => setMobileNavOpen(!!e.detail?.open);
    window.addEventListener("mobile-menu-toggle", handler);
    return () => window.removeEventListener("mobile-menu-toggle", handler);
  }, []);

  // Auto-close the chat panel itself if the mobile menu opens on top of it.
  useEffect(() => {
    if (mobileNavOpen && open && isMobile) setOpen(false);
  }, [mobileNavOpen, open, isMobile]);

  if (isMobile === null || hideChatbox) return null;

  const hideForMobileNav = isMobile && mobileNavOpen;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status) setStatus(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/sendgrid/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const panelMotion = isMobile
    ? {
        initial: { y: "100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "100%", opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 18, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 14, scale: 0.96 },
      };

  return (
    <>
      <AnimatePresence>
        {!open && !hideForMobileNav && (
          <motion.button
            key="contact-launcher"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="fixed bottom-4 right-4 z-[9999] flex h-14 items-center gap-3 rounded-full bg-[#110f0d] px-4 text-[#f0ebe3] shadow-[0_14px_36px_rgba(30,18,10,0.28)] ring-1 ring-[#ff914d]/25 transition-colors duration-200 hover:bg-[#1c1712] sm:bottom-6 sm:right-6 sm:h-14 sm:px-5"
            aria-label="Open contact form"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff914d] text-[#1a1410]">
              <MessageCircle className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-[10px] uppercase tracking-[0.22em] text-[#ff914d]">
                Contact
              </span>
              <span className="block text-sm font-medium leading-tight">
                Send a message
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            {isMobile && (
              <motion.button
                type="button"
                aria-label="Close contact form overlay"
                className="fixed inset-0 z-[9998] bg-black/35"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
            )}

            <motion.aside
              key="contact-panel"
              {...panelMotion}
              transition={{ type: "spring", stiffness: 430, damping: 34 }}
              className={[
                "fixed z-[9999] overflow-hidden bg-[#fffaf5] shadow-[0_24px_80px_rgba(30,18,10,0.28)] ring-1 ring-[#eadfd2]",
                isMobile
                  ? "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[2rem]"
                  : "bottom-6 right-6 w-[390px] rounded-[2rem]",
              ].join(" ")}
              aria-label="Contact form"
            >
              <div className="relative bg-[#110f0d] px-5 pb-6 pt-5 text-[#f0ebe3]">
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ff914d]/40 to-transparent" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d]">
                      Mama Reykjavik
                    </p>
                    <h2 className="mt-2 font-cormorant text-3xl italic leading-none">
                      How can we help?
                    </h2>
                    <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-[#b8aca0]">
                      Send us a note and the right person will get back to you.
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close contact form"
                    whileHover={{ scale: 1.06, rotate: 90 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                  >
                    <X className="h-4 w-4" strokeWidth={2.4} />
                  </motion.button>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="max-h-[calc(90dvh-150px)] space-y-4 overflow-y-auto px-5 py-5"
              >
                <Field label="Name">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Your name"
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="your@email.com"
                  />
                </Field>

                <Field label="Message">
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={isMobile ? 4 : 5}
                    className={`${inputClass} resize-none`}
                    placeholder="Tell us what you need..."
                  />
                </Field>

                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={[
                      "rounded-2xl px-4 py-3 text-sm",
                      status === "success"
                        ? "bg-green-50 text-green-800 ring-1 ring-green-200"
                        : "bg-red-50 text-red-800 ring-1 ring-red-200",
                    ].join(" ")}
                  >
                    {status === "success"
                      ? "Thank you. Your message has been sent."
                      : "Something went wrong. Please try again."}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff914d] px-5 py-3.5 text-sm font-semibold text-[#1a1410] transition-colors duration-200 hover:bg-[#ff914d]/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" strokeWidth={2.4} />
                  {loading ? "Sending..." : "Send message"}
                </motion.button>

                <p className="text-center text-[11px] leading-relaxed text-[#9a7a62]">
                  For table bookings, the Book a table button is usually fastest.
                </p>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
