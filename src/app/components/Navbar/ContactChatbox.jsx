"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import React from "react"; // Added missing import

// Helper to detect mobile (client-side only)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/sendgrid/contact-form/route.js", {
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
        width: undefined, // let Tailwind handle width
        height: undefined, // let Tailwind handle height
        borderRadius: undefined, // let Tailwind handle radius
        backgroundColor: "#fff",
        boxShadow: "0 8px 32px 0 rgba(16, 185, 129, 0.18)",
        pointerEvents: "auto",
      }
    : {
        width: undefined,
        height: undefined,
        minWidth: 140,
        minHeight: 44,
        borderRadius: undefined,
        backgroundColor: "#059669",
        boxShadow: "0 4px 24px 0 rgba(16, 185, 129, 0.15)",
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
              className="fixed bottom-3 right-3 z-[9999] flex items-center justify-center rounded-full shadow-lg bg-primary-green hover:bg-primary-green/90 transition-colors text-white w-[44px] h-[44px] focus:outline-none cursor-pointer select-none"
              aria-label="Open contact chatbox"
              onClick={() => setOpen(true)}
            >
              <MessageSquare className="h-5 w-5" />
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
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-0 right-0 left-0 z-[9999] w-full max-w-full mx-auto h-auto max-h-[90dvh] rounded-t-2xl bg-white shadow-2xl flex flex-col"
              style={{ pointerEvents: "auto" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-primary-green text-white rounded-t-2xl border-b border-primary-green/20">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-medium text-base">Contact Us</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white hover:text-primary-green text-2xl font-bold focus:outline-none"
                  aria-label="Close chatbox"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col px-4 py-4 gap-4"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-green resize-none bg-white text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60 text-sm"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
                {status === "success" && (
                  <div className="text-green-600 text-center text-sm">
                    Thank you! Your message has been sent.
                  </div>
                )}
                {status === "error" && (
                  <div className="text-red-600 text-center text-sm">
                    Something went wrong. Please try again.
                  </div>
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
        bottom-3 right-3 sm:bottom-6 sm:right-6
        ${
          open
            ? "w-[calc(100vw-24px)] h-auto max-h-[90dvh] rounded-none sm:w-[360px] sm:h-[480px] sm:rounded-2xl"
            : "w-[44px] h-[44px] rounded-full sm:w-[140px] sm:h-[44px] sm:rounded-full"
        }
      `}
      layout
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{ ...morphStyles }}
    >
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center  rounded-full shadow-lg hover:bg-primary-green transition-colors text-white text-sm font-normal tracking-wide focus:outline-none cursor-pointer select-none pointer-events-auto w-[44px] h-[44px] sm:w-full sm:h-full gap-0 sm:gap-2 px-0 sm:px-3 py-0 sm:py-1.5"
          aria-label="Open contact chatbox"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="ml-1 hidden sm:inline">Contact</span>
        </button>
      ) : (
        <div className="flex flex-col h-full w-full bg-white rounded-none sm:rounded-2xl shadow-2xl pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3 bg-primary-green text-white rounded-t-none sm:rounded-t-2xl border-b border-primary-green/20">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium text-base sm:text-lg">
                Contact Us
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-primary-green text-2xl font-bold focus:outline-none"
              aria-label="Close chatbox"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col px-3 py-3 sm:px-5 sm:py-4 gap-4"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-green bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-green resize-none bg-white text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-green hover:bg-primary-green/90 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
            {status === "success" && (
              <div className="text-green-600 text-center text-sm">
                Thank you! Your message has been sent.
              </div>
            )}
            {status === "error" && (
              <div className="text-red-600 text-center text-sm">
                Something went wrong. Please try again.
              </div>
            )}
          </form>
        </div>
      )}
    </motion.div>
  );
}
