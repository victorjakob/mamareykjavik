"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCart } from "@/providers/CartProvider";
import { useSession } from "next-auth/react";
import { localizeHref, stripIsPrefix, hasIsCounterpart, addIsPrefix } from "@/lib/i18n-routing";
import { useLanguage } from "@/hooks/useLanguage";

// ── Logos ──────────────────────────────────────────────────────────────────────
const LOGO_DEFAULT = "/mamaimg/mamalogo.png";
const LOGO_DARK =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_240,h_280,c_limit,q_auto,f_auto/v1776035352/Mama_white_fj5nfg.png";

// ── Navigation items ───────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Eat",         href: "/restaurant",             num: "01" },
  { label: "Menu",        href: "/restaurant/menu",        num: "02" },
  { label: "Events",      href: "/events",                 num: "03" },
  { label: "Shop",        href: "/shop",                   num: "04" },
  { label: "White Lotus", href: "/whitelotus",             num: "05" },
  { label: "About",       href: "/about",                  num: "06" },
];

// ── Small SVG helpers ──────────────────────────────────────────────────────────
function IconCart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// Hand-drawn ornamental divider — matches the rest of the site's flourishes
function Ornament({ width = 80, className = "text-[#b8935a]" }) {
  return (
    <svg
      width={width}
      height="12"
      viewBox="0 0 80 12"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 6 Q 14 1 24 6 T 44 6 T 64 6"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <circle cx="40" cy="6" r="1.4" fill="currentColor" />
      <path
        d="M64 6 Q 70 2 78 6"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// Labels + soulful descriptors, bilingual — shown in the mobile panel
const MOBILE_NAV_COPY = {
  en: {
    "/restaurant":        { label: "Eat",         sub: "The kitchen, the table" },
    "/restaurant/menu":   { label: "Menu",        sub: "What we're serving today" },
    "/events":            { label: "Events",      sub: "Cacao, workshops, music nights" },
    "/shop":              { label: "Shop",        sub: "Small-batch, made by hand" },
    "/whitelotus":        { label: "White Lotus", sub: "The venue upstairs" },
    "/about":             { label: "About",       sub: "Who we are, what we pour" },
    wander:      "Wander Mama",
    basket:      "The Basket",
    bookTable:   "Book a table",
    signIn:      "Sign in",
    myProfile:   "My profile",
    whisper:     "From the Mama table, with love.",
  },
  is: {
    "/restaurant":        { label: "Borða",       sub: "Eldhúsið, borðið" },
    "/restaurant/menu":   { label: "Matseðill",   sub: "Það sem er á borðum í dag" },
    "/events":            { label: "Viðburðir",   sub: "Kakó, vinnustofur, tónlistarkvöld" },
    "/shop":              { label: "Verslun",     sub: "Smáframleitt, með höndum" },
    "/whitelotus":        { label: "White Lotus", sub: "Salurinn á efri hæðinni" },
    "/about":             { label: "Um okkur",    sub: "Hver við erum, hvað við hellum" },
    wander:      "Reika um Mama",
    basket:      "Karfan",
    bookTable:   "Bóka borð",
    signIn:      "Skrá inn",
    myProfile:   "Mín síða",
    whisper:     "Frá borði Mama, með ást.",
  },
};

function MobileMenu({
  onClose,
  pathname,
  isActive,
  session,
  canSwitchLang,
  targetLangPath,
  isIcelandicPath,
  nextLangLabel,
  setLanguage,
  cartItemCount,
}) {
  const { language } = useLanguage();
  const copy = MOBILE_NAV_COPY[language] || MOBILE_NAV_COPY.en;

  return (
    <motion.div
      key="mobile-menu-paper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-[#f7f1e7] text-[#2b1f15]"
      style={{
        height: "100dvh",
        // Respect the iPhone notch/status bar so the top-row doesn't hide behind it
        paddingTop: "env(safe-area-inset-top)",
        // Pull the bottom row away from the absolute screen edge so it doesn't feel glued
        paddingBottom: "max(env(safe-area-inset-bottom), clamp(0.75rem, 2.5vh, 1.75rem))",
      }}
    >
      {/* Paper texture overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* ambient warm glow at top */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[90vw] max-w-[680px] rounded-full bg-[#ff914d]/[0.07] blur-[120px]"
      />

      {/* ── Top bar — reserves just enough height to clear the fixed header's
            hamburger + cart chip; kept compact so "Wander Mama" sits high on screen ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex items-center justify-end px-5 h-[clamp(3.25rem,8.5vh,4.5rem)] shrink-0"
      >
        {cartItemCount > 0 && (
          <Link
            href="/shop/cart"
            onClick={onClose}
            aria-label={copy.basket}
            className="relative flex items-center justify-center rounded-full border border-[#1a1410]/15 text-[#1a1410]/75 hover:text-[#1a1410] hover:border-[#7a5a3a]/50 transition-all duration-300 bg-[#f7f1e7]/40 mr-[52px]"
            style={{ width: "clamp(2rem, 9vw, 2.4rem)", height: "clamp(2rem, 9vw, 2.4rem)" }}
          >
            <IconCart />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff914d] text-[#1a1410] text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-[0_1px_4px_rgba(255,145,77,0.35)]">
              {cartItemCount}
            </span>
          </Link>
        )}
      </motion.div>

      {/* ── Eyebrow — hairline + "Wander Mama" ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative flex items-center justify-center gap-3 shrink-0"
        style={{
          paddingTop: "clamp(3.25rem, 9vh, 6rem)",
          paddingBottom: "clamp(0.75rem, 1.5vh, 1.25rem)",
        }}
      >
        <span className="h-px w-8 bg-[#b8935a]/50" />
        <span className="text-[9px] uppercase tracking-[0.45em] text-[#b8935a] font-light">
          {copy.wander}
        </span>
        <span className="h-px w-8 bg-[#b8935a]/50" />
      </motion.div>

      {/* ── Nav items — each link gets an equal slice of the remaining height
            so they're always spread across the screen instead of squished ── */}
      <nav
        className="relative flex-1 flex flex-col px-6 sm:px-8 py-[clamp(0.4rem,1.5vh,1rem)] overflow-hidden min-h-0"
        aria-label="Mobile navigation"
      >
        {NAV_LINKS.map(({ href }, i) => {
          const entry = copy[href];
          if (!entry) return null;
          const active = isActive(href);
          const num = i < ROMAN.length ? ROMAN[i] : String(i + 1);

          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.38,
                delay: 0.16 + i * 0.045,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex-1 min-h-0 flex items-center"
            >
              <Link
                href={localizeHref(pathname, href)}
                onClick={onClose}
                className={`group w-full flex items-center gap-4 py-[clamp(0.3rem,0.8vh,0.7rem)] border-b transition-colors duration-300 ${
                  active
                    ? "border-[#7a5a3a]/35"
                    : "border-[#b8935a]/20 hover:border-[#7a5a3a]/40"
                }`}
              >
                <span
                  className={`font-serif italic leading-none shrink-0 w-6 transition-colors duration-300 ${
                    active
                      ? "text-[#7a5a3a]"
                      : "text-[#b8935a]/75 group-hover:text-[#7a5a3a]"
                  }`}
                  style={{ fontSize: "clamp(0.9rem, 2.8vw, 1.1rem)" }}
                >
                  {num}
                </span>

                <div className="flex-1 min-w-0">
                  <span
                    className={`block font-serif italic leading-[1.02] tracking-[-0.01em] transition-colors duration-300 ${
                      active
                        ? "text-[#7a5a3a]"
                        : "text-[#1a1410] group-hover:text-[#7a5a3a]"
                    }`}
                    style={{ fontSize: "clamp(1.25rem, 5.5vw, 1.9rem)" }}
                  >
                    {entry.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-[9px] uppercase tracking-[0.24em] font-light transition-colors duration-300 ${
                      active
                        ? "text-[#7a5a3a]/90"
                        : "text-[#6b5a48]/80 group-hover:text-[#1a1410]"
                    }`}
                  >
                    {entry.sub}
                  </span>
                </div>

                <span
                  className={`ml-2 shrink-0 text-[#7a5a3a] transition-all duration-300 ${
                    active
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  }`}
                >
                  <svg
                    width="14"
                    height="9"
                    viewBox="0 0 14 10"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M1 5h12M9 1l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* ── Bottom row — generous, warm, not glued to the screen edge ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-4 mt-[clamp(0.75rem,2vh,1.25rem)] px-4 py-[clamp(0.85rem,2.2vh,1.35rem)] flex items-center gap-3 rounded-[28px] shrink-0 border border-[#b8935a]/30 bg-gradient-to-b from-[#ede4d1]/70 to-[#e6dbc3]/85 backdrop-blur-sm shadow-[0_10px_30px_-12px_rgba(26,20,16,0.18)]"
      >
        {/* subtle warm glow behind the cta */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-6 right-24 top-1/2 -translate-y-1/2 h-[80%] rounded-full bg-[#ff914d]/[0.14] blur-[32px]"
        />

        {/* Left side — language toggle */}
        {canSwitchLang && (
          <motion.div whileTap={{ scale: 0.94 }} className="relative shrink-0">
            <Link
              href={targetLangPath}
              onClick={() => {
                setLanguage(isIcelandicPath ? "en" : "is");
                onClose();
              }}
              aria-label={`Switch to ${isIcelandicPath ? "English" : "Icelandic"}`}
              className="flex items-center justify-center rounded-full border border-[#b8935a]/55 text-[#1a1410] hover:border-[#7a5a3a] hover:bg-[#b8935a]/10 transition-all duration-300 text-[10px] font-semibold tracking-[0.08em] bg-[#f7f1e7]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
              style={{
                width: "clamp(2.55rem, 11vw, 3rem)",
                height: "clamp(2.55rem, 11vw, 3rem)",
              }}
            >
              {nextLangLabel}
            </Link>
          </motion.div>
        )}

        {/* Book a table — warm orange pill, more generous, slight press on tap */}
        <motion.a
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.015 }}
          href="https://www.dineout.is/mamareykjavik?isolation=true"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="relative flex-1 inline-flex items-center justify-center gap-2.5 px-5 rounded-full text-[#1a1410] text-[11px] uppercase tracking-[0.26em] font-medium transition-colors duration-300 shadow-[0_8px_26px_rgba(255,145,77,0.35),inset_0_1px_0_rgba(255,255,255,0.4)]"
          style={{
            paddingTop: "clamp(0.95rem, 2.4vh, 1.35rem)",
            paddingBottom: "clamp(0.95rem, 2.4vh, 1.35rem)",
            backgroundImage:
              "linear-gradient(135deg, #ffa566 0%, #ff914d 48%, #f37a2f 100%)",
          }}
        >
          {/* little sparkle dot */}
          <span
            aria-hidden
            className="inline-block w-1.5 h-1.5 rounded-full bg-[#1a1410]/85 shadow-[0_0_0_3px_rgba(26,20,16,0.08)]"
          />
          <span>{copy.bookTable}</span>
          <svg
            width="12"
            height="9"
            viewBox="0 0 14 10"
            fill="none"
            aria-hidden
            className="-mr-0.5"
          >
            <path
              d="M1 5h12M9 1l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.a>

        {/* Right side — profile icon */}
        <motion.div whileTap={{ scale: 0.94 }} className="relative shrink-0">
          <Link
            href={session ? "/profile" : "/auth?mode=login"}
            onClick={onClose}
            aria-label={session ? copy.myProfile : copy.signIn}
            className="relative flex items-center justify-center rounded-full border border-[#b8935a]/55 text-[#1a1410] hover:border-[#7a5a3a] hover:bg-[#b8935a]/10 transition-all duration-300 bg-[#f7f1e7]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
            style={{
              width: "clamp(2.55rem, 11vw, 3rem)",
              height: "clamp(2.55rem, 11vw, 3rem)",
            }}
          >
            <IconUser />
            {/* warm "you're in" dot — or a soft invite dot when signed out */}
            <span
              aria-hidden
              className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#f7f1e7] ${
                session ? "bg-[#ff914d]" : "bg-[#b8935a]/80"
              }`}
            />
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DarkNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [logoTheme, setLogoTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);
  // Portal-mount flag: createPortal needs document.body, which only exists client-side.
  // We render null on the server + first client paint, then portal after mount. This is
  // required so the navbar can escape any ancestor stacking context (e.g. provider
  // wrappers with transform/filter/contain) that would otherwise let page components
  // overlap the fixed header on iOS Safari + Chrome mobile.
  const [portalReady, setPortalReady] = useState(false);
  const { cartItemCount } = useCart();
  const { data: session } = useSession();
  const { setLanguage } = useLanguage();
  const pathname = usePathname();
  const basePath = stripIsPrefix(pathname);
  const logoRef = useRef(null);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  // Language toggle logic — hide on pages that have no /is counterpart.
  const isIcelandicPath = pathname === "/is" || pathname?.startsWith("/is/");
  const canSwitchLang = hasIsCounterpart(pathname);
  const targetLangPath = isIcelandicPath ? basePath : addIsPrefix(basePath);
  const nextLangLabel = isIcelandicPath ? "EN" : "IS";

  // Detect scroll depth
  useEffect(() => {
    const updateNavbarState = () => {
      setScrolled(window.scrollY > 60);

      if (!logoRef.current) return;

      const rect = logoRef.current.getBoundingClientRect();
      const sampleX = Math.min(
        Math.max(Math.round(rect.left + rect.width * 0.42), 0),
        window.innerWidth - 1
      );
      const sampleY = Math.min(
        Math.max(Math.round(rect.top + Math.min(rect.height * 0.45, 72)), 0),
        window.innerHeight - 1
      );

      const elements = document.elementsFromPoint(sampleX, sampleY);
      const themedSection = elements.find(
        (element) =>
          element instanceof HTMLElement &&
          element.closest("[data-navbar-theme]")
      );

      const nextTheme =
        themedSection instanceof HTMLElement
          ? themedSection.closest("[data-navbar-theme]")?.getAttribute(
              "data-navbar-theme"
            ) || "light"
          : "light";

      setLogoTheme(nextTheme === "dark" ? "dark" : "light");
    };

    const onScroll = () => window.requestAnimationFrame(updateNavbarState);
    const onResize = () => updateNavbarState();

    updateNavbarState();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (href) =>
    basePath === href || basePath === href + "/";

  const isWlRentPage = basePath === "/whitelotus/rent";
  /** Rent inquiry hero: fade Eat/Menu/… out at top; fade in after scroll. */
  const hideWlRentTopNav = isWlRentPage && !scrolled;

  const navbarTree = (
    <>
      {/* ── Fixed top bar ──────────────────────────────────────────────────── */}
      {/*
        iOS Safari note: position:fixed elements can lose their compositor layer
        during momentum scroll when the page has transformed/animated siblings,
        which makes the navbar appear behind other sections. Forcing a GPU layer
        (translateZ) + isolation keeps it pinned above everything.
      */}
      <header
        className="fixed top-0 left-0 right-0 z-[210] pointer-events-none"
        style={{
          transform: "translate3d(0,0,0)",
          WebkitTransform: "translate3d(0,0,0)",
          willChange: "transform",
          isolation: "isolate",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
        }}
      >
        <motion.div
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="w-full pointer-events-none"
        >
          {/* pointer-events-none on the row so gaps between logo / nav / actions pass clicks through */}
          <div className="max-w-7xl mx-auto px-5 lg:px-10 h-[76px] flex items-center justify-between overflow-visible pointer-events-none">

            {/* Left — Logo */}
            <Link
              href="/"
              ref={logoRef}
              className="pointer-events-auto relative w-[88px] sm:w-[108px] md:w-[128px] lg:w-[150px] aspect-[5/6] shrink-0 self-start -mt-2 sm:-mt-2.5 md:-mt-3 lg:-mt-[16px] -mb-12 sm:-mb-14 md:-mb-16 lg:-mb-20 z-10 hover:opacity-90 transition-opacity "
            >
              {/* Soft white glow behind the logo center — makes text legible on any bg */}
              <div
                className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[54%] aspect-square rounded-full pointer-events-none"
                aria-hidden
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.35) 54%, transparent 76%)",
                  filter: "blur(11px)",
                }}
              />

              {/* Single logo — always the same regardless of background */}
              <div className="absolute inset-0">
                <Image
                  src={LOGO_DEFAULT}
                  alt="Mama Reykjavik"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Center — Nav links (desktop) */}
            <nav
              className={[
                "pointer-events-auto hidden lg:flex items-center gap-8 rounded-full px-5 py-2",
                isWlRentPage
                  ? [
                      "transition-[opacity,transform,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                      hideWlRentTopNav
                        ? "opacity-0 pointer-events-none translate-y-[-6px]"
                        : "opacity-100 translate-y-0",
                    ].join(" ")
                  : "transition-all duration-300",
                scrolled
                  ? "bg-[rgba(13,11,9,0.72)] border border-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.22)]"
                  : "bg-transparent border border-transparent",
              ].join(" ")}
              aria-label="Main navigation"
              aria-hidden={isWlRentPage && hideWlRentTopNav}
            >
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={localizeHref(pathname, href)}
                  className={`text-sm tracking-wide transition-all duration-200 relative group ${
                    isActive(href)
                      ? "text-[#ff914d]"
                      : "text-white/55 hover:text-white"
                  }`}
                >
                  {label}
                  {/* Underline dot on active */}
                  {isActive(href) && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ff914d]"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right — Actions */}
            <div className="pointer-events-auto flex items-center gap-2.5">

              {/* Language toggle — desktop only; mobile has it inside the opened menu */}
              {canSwitchLang && (
                <Link
                  href={targetLangPath}
                  onClick={() => setLanguage(isIcelandicPath ? "en" : "is")}
                  aria-label={`Switch to ${isIcelandicPath ? "English" : "Icelandic"}`}
                  className="relative hidden lg:flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 hover:border-white/30 hover:text-white transition-all duration-200 text-[11px] font-semibold tracking-wide"
                >
                  {nextLangLabel}
                </Link>
              )}

              {/* Cart badge */}
              {cartItemCount > 0 && (
                <Link
                  href="/shop/cart"
                  aria-label="View cart"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/55 hover:border-white/30 hover:text-white transition-all duration-200"
                >
                  <IconCart />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff914d] text-black text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {cartItemCount}
                  </span>
                </Link>
              )}

              {/* Sign in / Profile (desktop only) — subtle pill for contrast on heroes */}
              <Link
                href={session ? "/profile" : "/auth?mode=login"}
                className={`hidden lg:flex items-center gap-1.5 rounded-full px-4 py-2 text-white/90 transition-all duration-300 hover:text-white ${
                  scrolled
                    ? "bg-[rgba(13,11,9,0.78)] backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.14)]"
                    : "bg-[rgba(8,6,4,0.5)] backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
                }`}
                aria-label={session ? "Profile" : "Sign in"}
              >
                <IconUser />
                <span className="text-xs tracking-wide font-medium">
                  {session
                    ? session.user?.name?.split(" ")[0] || "Profile"
                    : "Sign in"}
                </span>
              </Link>

              {/* Book CTA pill (desktop) */}
              <a
                href="https://www.dineout.is/mamareykjavik?isolation=true"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex items-center px-5 py-2 bg-[#ff914d] text-black text-xs font-semibold rounded-full tracking-wide shadow-[0_2px_14px_rgba(255,145,77,0.32)] hover:scale-[1.02] hover:brightness-105 transition-all duration-200 ml-1"
              >
                Book a table
              </a>

              {/* Mobile hamburger — stays in place as a floating toggle; morphs to X when open */}
              {(() => {
                const useLightIcon = menuOpen || logoTheme !== "dark";
                return (
                  <motion.button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    initial={false}
                    animate={menuOpen ? "open" : "closed"}
                    whileTap={{ scale: 0.94 }}
                    className={`lg:hidden relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      useLightIcon
                        ? "bg-white hover:bg-white ring-1 ring-black/10 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.28)]"
                        : "bg-white/[0.08] hover:bg-white/[0.14] ring-1 ring-white/25 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.55)] backdrop-blur-md"
                    }`}
                  >
                    <span className="relative block h-[14px] w-[22px]">
                      <motion.span
                        aria-hidden
                        className={`absolute left-0 right-0 h-[2px] rounded-full ${
                          useLightIcon ? "bg-[#1a1410]" : "bg-white"
                        }`}
                        style={{ top: 0, transformOrigin: "50% 50%" }}
                        variants={{
                          closed: { y: 0, rotate: 0 },
                          open: { y: 6, rotate: 45 },
                        }}
                        transition={{ type: "spring", stiffness: 280, damping: 22 }}
                      />
                      <motion.span
                        aria-hidden
                        className={`absolute left-0 right-0 h-[2px] rounded-full ${
                          useLightIcon ? "bg-[#1a1410]" : "bg-white"
                        }`}
                        style={{ top: 6, transformOrigin: "50% 50%" }}
                        variants={{
                          closed: { opacity: 1, scaleX: 1 },
                          open: { opacity: 0, scaleX: 0.2 },
                        }}
                        transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                      />
                      <motion.span
                        aria-hidden
                        className={`absolute left-0 right-0 h-[2px] rounded-full ${
                          useLightIcon ? "bg-[#1a1410]" : "bg-white"
                        }`}
                        style={{ top: 12, transformOrigin: "50% 50%" }}
                        variants={{
                          closed: { y: 0, rotate: 0 },
                          open: { y: -6, rotate: -45 },
                        }}
                        transition={{ type: "spring", stiffness: 280, damping: 22 }}
                      />
                    </span>
                  </motion.button>
                );
              })()}
            </div>
          </div>
        </motion.div>
      </header>

      {/* ── Mobile fullscreen menu — warm paper editorial ─────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <MobileMenu
            onClose={() => setMenuOpen(false)}
            pathname={pathname}
            isActive={isActive}
            session={session}
            canSwitchLang={canSwitchLang}
            targetLangPath={targetLangPath}
            isIcelandicPath={isIcelandicPath}
            nextLangLabel={nextLangLabel}
            setLanguage={setLanguage}
            cartItemCount={cartItemCount}
          />
        )}
      </AnimatePresence>
    </>
  );

  // Render through a portal at document.body so the navbar escapes ANY ancestor
  // stacking context or CSS containment that could let page components overlap it.
  // React context (useCart/useSession/useLanguage) is preserved through portals.
  if (!portalReady || typeof document === "undefined") return null;

  // Kiosk / gatekeeper mode → no site chrome. The gatekeeper page is meant to
  // look like a dedicated tablet app, not the marketing site.
  if (pathname && /\/events\/manager\/[^/]+\/gatekeeper(\/|$)/.test(pathname)) {
    return null;
  }

  return createPortal(navbarTree, document.body);
}
