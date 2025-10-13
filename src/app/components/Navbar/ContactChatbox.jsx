"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import React from "react";

// Helper to detect mobile (client-side only)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(null);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function ContactChatbox() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  // Don't render anything until we know if it's mobile
  if (isMobile === null) {
    return null;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  // Animation variants
  const morphStyles = open
    ? {
        width: undefined,
        height: undefined,
        borderRadius: undefined,
        backgroundColor: "#fff",
        boxShadow: "0 10px 40px 0 rgba(16, 185, 129, 0.15)",
        pointerEvents: "auto",
      }
    : {
        width: undefined,
        height: undefined,
        minWidth: 140,
        minHeight: 48,
        borderRadius: undefined,
        backgroundColor: "#059669",
        boxShadow: "0 6px 30px 0 rgba(16, 185, 129, 0.20)",
        pointerEvents: "auto",
      };

  // --- MOBILE: Slide up animation ---
  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {!open && (
            <motion.button
              key="chatbox-btn"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="fixed bottom-4 right-4 z-[9999] flex items-center justify-center rounded-full shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 text-white w-14 h-14 focus:outline-none cursor-pointer select-none border-2 border-white/20"
              aria-label="Open contact chatbox"
              onClick={() => setOpen(true)}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare className="h-6 w-6" strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {open && (
            <motion.div
              key="chatbox-mobile"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className="fixed bottom-0 right-0 left-0 z-[9999] w-full max-w-full mx-auto h-auto max-h-[90dvh] rounded-t-3xl bg-white shadow-2xl flex flex-col"
              style={{ pointerEvents: "auto" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-3xl">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-5 w-5" strokeWidth={2.5} />
                  <span className="font-medium text-base">Contact Us</span>
                </div>
                <motion.button
                  onClick={() => setOpen(false)}
                  className="text-white/90 hover:text-white focus:outline-none"
                  aria-label="Close chatbox"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" strokeWidth={2.5} />
                </motion.button>
              </div>
              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col px-5 py-5 gap-5 overflow-y-auto"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-light text-slate-600 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 bg-slate-50 hover:bg-white transition-all text-sm text-slate-800 placeholder:text-slate-400"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-slate-600 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 bg-slate-50 hover:bg-white transition-all text-sm text-slate-800 placeholder:text-slate-400"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-slate-600 mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 resize-none bg-slate-50 hover:bg-white transition-all text-sm text-slate-800 placeholder:text-slate-400"
                      placeholder="Your message..."
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-600 text-center text-sm font-light bg-emerald-50 py-2 rounded-lg"
                  >
                    ✓ Thank you! Your message has been sent.
                  </motion.div>
                )}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-center text-sm font-light bg-red-50 py-2 rounded-lg"
                  >
                    ⚠ Something went wrong. Please try again.
                  </motion.div>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // --- DESKTOP: Morphing animation ---
  return (
    <motion.div
      className={`fixed z-[9999] flex flex-col items-end pointer-events-auto
        bottom-4 right-4 sm:bottom-6 sm:right-6
        ${
          open
            ? "w-[calc(100vw-24px)] h-auto max-h-[90dvh] rounded-none sm:w-[380px] sm:h-[520px] sm:rounded-3xl"
            : "w-[56px] h-[56px] rounded-full sm:w-[150px] sm:h-[48px] sm:rounded-full"
        }
      `}
      layout
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      style={{ ...morphStyles }}
    >
      {!open ? (
        <motion.button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center rounded-full shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 text-white text-sm font-light focus:outline-none cursor-pointer select-none pointer-events-auto w-[56px] h-[56px] sm:w-full sm:h-full gap-0 sm:gap-2.5 px-0 sm:px-4 py-0 sm:py-2 border-2 border-white/20"
          aria-label="Open contact chatbox"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageSquare className="h-6 w-6 sm:h-5 sm:w-5" strokeWidth={2.5} />
          <span className="hidden sm:inline">Contact</span>
        </motion.button>
      ) : (
        <div className="flex flex-col h-full w-full bg-white rounded-none sm:rounded-3xl shadow-2xl pointer-events-auto overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-none sm:rounded-t-3xl">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-5 w-5" strokeWidth={2.5} />
              <span className="font-medium text-base sm:text-lg">
                Contact Us
              </span>
            </div>
            <motion.button
              onClick={() => setOpen(false)}
              className="text-white/90 hover:text-white focus:outline-none"
              aria-label="Close chatbox"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </motion.button>
          </div>
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col px-5 py-5 gap-5 overflow-y-auto flex-1"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-light text-slate-600 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 bg-slate-50 hover:bg-white transition-all text-sm text-slate-800 placeholder:text-slate-400"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-light text-slate-600 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 bg-slate-50 hover:bg-white transition-all text-sm text-slate-800 placeholder:text-slate-400"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-light text-slate-600 mb-1.5">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 resize-none bg-slate-50 hover:bg-white transition-all text-sm text-slate-800 placeholder:text-slate-400"
                  placeholder="Your message..."
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-600 text-center text-sm font-light bg-emerald-50 py-2 rounded-lg"
              >
                ✓ Thank you! Your message has been sent.
              </motion.div>
            )}
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-center text-sm font-light bg-red-50 py-2 rounded-lg"
              >
                ⚠ Something went wrong. Please try again.
              </motion.div>
            )}
          </form>
        </div>
      )}
    </motion.div>
  );
}
