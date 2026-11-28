"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Send, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

const COPY = {
  en: {
    launcherTop: "Ask Mama",
    launcherBottom: "Chat with us",
    chatTitle: "Ask Mama",
    formTitle: "Message the team",
    greeting: "Hi 🌱 What can I help you with?",
    placeholder: "Type your question…",
    thinking: "Thinking…",
    toTeam: "Message the team",
    backToChat: "Back to chat",
    aiNote: "AI answers can be wrong. For allergies, always check with staff.",
    error: "Sorry, I couldn't answer just now. You can message the team instead and they'll get back to you 💚",
    rateLimited: "You've sent a lot of messages. Please try again in a few minutes, or message the team.",
    chips: ["Opening hours?", "Book a table", "Upcoming events", "Gift cards"],
    transcriptIntro: "From my chat with the website assistant:",
  },
  is: {
    launcherTop: "Spurðu Mama",
    launcherBottom: "Spjallaðu við okkur",
    chatTitle: "Spurðu Mama",
    formTitle: "Skilaboð til teymisins",
    greeting: "Hæ 🌱 Hvernig get ég aðstoðað?",
    placeholder: "Skrifaðu spurninguna þína…",
    thinking: "Augnablik…",
    toTeam: "Senda teyminu skilaboð",
    backToChat: "Aftur í spjall",
    aiNote: "Svör gervigreindar geta verið röng. Varðandi ofnæmi, spurðu alltaf starfsfólkið.",
    error: "Því miður gat ég ekki svarað núna. Þú getur sent teyminu skilaboð og þau hafa samband 💚",
    rateLimited: "Þú hefur sent mörg skilaboð. Reyndu aftur eftir smá stund, eða sendu teyminu skilaboð.",
    chips: ["Opnunartími?", "Bóka borð", "Næstu viðburðir", "Gjafakort"],
    transcriptIntro: "Úr spjallinu mínu við aðstoðina á vefnum:",
  },
};

function ChatBubble({ role, children }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          mine
            ? "rounded-br-md bg-[#110f0d] text-[#f0ebe3]"
            : "rounded-bl-md bg-white text-[#2c1810] ring-1 ring-[#eadfd2]",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

const mdComponents = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-words font-medium text-[#c45f1f] underline underline-offset-2"
    >
      {children}
    </a>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
};

export default function ContactChatbox() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();
  const pathname = usePathname() || "";
  const lang = /^\/is(\/|$)/.test(pathname) ? "is" : "en";
  const t = COPY[lang];

  // AI chat state. "chat" is the default view; "form" is the original
  // email-the-team form, still one tap away.
  const [mode, setMode] = useState("chat");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat, chatLoading, chatError, open, mode]);

  const hideChatbox =
    pathname.startsWith("/admin") ||
    /\/events\/manager\/[^/]+\/gatekeeper(\/|$)/.test(pathname);

  // The /restaurant page has its own mobile sticky CTA bar (Book/Call/Map/Wolt)
  // pinned to the bottom. Lift the launcher above it on small screens so it
  // doesn't cover the last cell; restore the normal position from md up where
  // that bar is hidden.
  const onRestaurant = /^\/(is\/)?restaurant\/?$/.test(pathname);
  const launcherBottom = onRestaurant
    ? "bottom-[calc(80px_+_env(safe-area-inset-bottom))] md:bottom-6"
    : "bottom-4 sm:bottom-6";

  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.mode === "form") setMode("form");
      setOpen(true);
    };
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

  // Auto-close the chat panel itself if the mobile/tablet menu opens on top of it.
  useEffect(() => {
    if (mobileNavOpen && open) setOpen(false);
  }, [mobileNavOpen, open]);

  if (isMobile === null || hideChatbox) return null;

  // The hamburger nav exists below `lg` (≈1024px), i.e. phones AND tablets.
  // The mobile-menu-toggle event only fires from that nav, so this single
  // boolean covers both screen sizes.
  const hideForMobileNav = mobileNavOpen;

  async function sendChat(text) {
    const content = (text ?? chatInput).trim();
    if (!content || chatLoading) return;
    const next = [...chat, { role: "user", content }];
    setChat(next);
    setChatInput("");
    setChatError(null);
    setChatLoading(true);
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "assistant", content: t.greeting }, ...next],
          page: pathname,
        }),
      });
      if (res.status === 503) {
        // Assistant not configured: quietly fall back to the contact form.
        goToForm(next);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) {
        setChatError(res.status === 429 ? t.rateLimited : t.error);
        return;
      }
      setChat((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setChatError(t.error);
    } finally {
      setChatLoading(false);
    }
  }

  function goToForm(history = chat) {
    const asked = history.filter((m) => m.role === "user").map((m) => `• ${m.content}`);
    if (asked.length && !form.message) {
      setForm((prev) => ({ ...prev, message: `${t.transcriptIntro}\n${asked.join("\n")}\n\n` }));
    }
    setStatus(null);
    setMode("form");
  }

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
            className={`fixed ${launcherBottom} right-4 z-[9999] flex h-14 items-center gap-3 rounded-full bg-[#110f0d] px-4 text-[#f0ebe3] shadow-[0_14px_36px_rgba(30,18,10,0.28)] ring-1 ring-[#ff914d]/25 transition-colors duration-200 hover:bg-[#1c1712] sm:right-6 sm:h-14 sm:px-5`}
            aria-label={t.launcherBottom}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff914d] text-[#1a1410]">
              <MessageCircle className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-[10px] uppercase tracking-[0.22em] text-[#ff914d]">
                {t.launcherTop}
              </span>
              <span className="block text-sm font-medium leading-tight">
                {t.launcherBottom}
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
              <div className="relative bg-[#110f0d] px-5 py-3.5 text-[#f0ebe3]">
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ff914d]/40 to-transparent" />

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff914d] text-[#1a1410]">
                      <MessageCircle className="h-4 w-4" strokeWidth={2.4} />
                    </span>
                    <h2 className="font-cormorant text-2xl italic leading-none">
                      {mode === "chat" ? t.chatTitle : t.formTitle}
                    </h2>
                    {mode === "chat" && (
                      <span className="rounded-full border border-[#ff914d]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff914d]">
                        AI
                      </span>
                    )}
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

              {mode === "chat" ? (
                <div className="flex max-h-[calc(90dvh-70px)] flex-col">
                  <div
                    ref={scrollRef}
                    className="h-[min(440px,calc(90dvh-210px))] space-y-3 overflow-y-auto px-4 py-4"
                  >
                    <ChatBubble role="assistant">{t.greeting}</ChatBubble>
                    {chat.map((m, i) => (
                      <ChatBubble key={i} role={m.role}>
                        {m.role === "assistant" ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                            {m.content}
                          </ReactMarkdown>
                        ) : (
                          m.content
                        )}
                      </ChatBubble>
                    ))}
                    {chatLoading && (
                      <ChatBubble role="assistant">
                        <span className="inline-flex items-center gap-2 text-[#9a7a62]">
                          <Sparkles className="h-3.5 w-3.5 animate-pulse" /> {t.thinking}
                        </span>
                      </ChatBubble>
                    )}
                    {chatError && (
                      <div className="rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm text-[#7a3d14] ring-1 ring-[#ffd2b0]">
                        {chatError}
                      </div>
                    )}
                    {chat.length === 0 && !chatLoading && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {t.chips.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => sendChat(c)}
                            className="rounded-full border border-[#e8ddd3] bg-white px-3 py-1.5 text-xs font-medium text-[#2c1810] transition-colors hover:border-[#ff914d] hover:text-[#c45f1f]"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#eadfd2] px-4 pb-4 pt-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendChat();
                      }}
                      className="flex items-end gap-2"
                    >
                      <textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value.slice(0, 800))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendChat();
                          }
                        }}
                        rows={1}
                        placeholder={t.placeholder}
                        aria-label={t.placeholder}
                        className={`${inputClass} max-h-28 resize-none py-2.5`}
                      />
                      <motion.button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        whileTap={{ scale: 0.94 }}
                        aria-label="Send"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ff914d] text-[#1a1410] transition-opacity disabled:opacity-40"
                      >
                        <Send className="h-4 w-4" strokeWidth={2.4} />
                      </motion.button>
                    </form>
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <p className="text-[10.5px] leading-snug text-[#9a7a62]">{t.aiNote}</p>
                      <button
                        type="button"
                        onClick={() => goToForm()}
                        className="shrink-0 text-xs font-semibold text-[#c45f1f] underline underline-offset-2"
                      >
                        {t.toTeam}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
              <form
                onSubmit={handleSubmit}
                className="max-h-[calc(90dvh-70px)] space-y-4 overflow-y-auto px-5 py-5"
              >
                <button
                  type="button"
                  onClick={() => setMode("chat")}
                  className="-mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a7a62] hover:text-[#c45f1f]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> {t.backToChat}
                </button>
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
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
