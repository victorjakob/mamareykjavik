"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminGuard from "./AdminGuard";
import Link from "next/link";
import ProfileHero from "@/app/profile/components/ProfileHero";
import {
  CalendarRange,
  Users,
  Coffee,
  ShoppingBag,
  Map,
  Loader2,
  CreditCard,
  ClipboardList,
  MessageSquare,
  Flower2,
  Coins,
  HandHeart,
  Mail,
  Mailbox,
  DoorOpen,
  Workflow,
  Heart,
  Sparkles,
  ChevronDown,
} from "lucide-react";

/**
 * Admin Command Centre.
 *
 * Five sections, four visible by default and one ("More") collapsed.
 * Each section answers a single question:
 *  - Today          → "What needs me right now?"
 *  - Events         → "Things on a date"
 *  - People         → "Who's allowed to do what"
 *  - Commerce       → "Things people buy"
 *  - More           → "Still here, just out of the way"
 *
 * URLs are unchanged from the previous flat layout — only labels and grouping.
 */

const EASE = [0.22, 1, 0.36, 1];

const SECTIONS = [
  {
    id: "today",
    title: "Today",
    purpose: "What needs you right now",
    layout: "wide",
    tiles: [
      {
        href: "/private-space/admin",
        label: "Private Space",
        icon: DoorOpen,
        desc: "White Lotus venue booking requests",
        brand: "WL",
      },
      {
        href: "/private-session/admin",
        label: "Private Sessions",
        icon: Heart,
        desc: "Practitioner sessions · today & upcoming",
        brand: "WL",
      },
    ],
  },
  {
    id: "events",
    title: "Events & Experiences",
    purpose: "Things that happen on a date",
    layout: "grid",
    tiles: [
      {
        href: "/admin/manage-events",
        label: "Events",
        icon: CalendarRange,
        desc: "All events · create, edit, stats",
        brand: "WL",
      },
      {
        href: "/admin/manage-series",
        label: "Series",
        icon: Sparkles,
        desc: "Recurring event series",
        brand: "WL",
      },
      {
        href: "/admin/manage-events/host-invites",
        label: "Host Invites",
        icon: ClipboardList,
        desc: "Invite hosts to events",
        brand: "WL",
      },
      {
        href: "/admin/summer-market",
        label: "Summer Market",
        icon: Flower2,
        desc: "Seasonal market applications",
        brand: "Mama",
      },
    ],
  },
  {
    id: "people",
    title: "People & Access",
    purpose: "Who's allowed to do what",
    layout: "grid",
    tiles: [
      {
        href: "/admin/subscribers",
        label: "Subscribers",
        icon: Mailbox,
        desc: "Newsletter list, sources & weekly letter",
        brand: "Both",
      },
      {
        href: "/admin/manage-users",
        label: "Users",
        icon: Users,
        desc: "Roles & accounts",
        brand: "Both",
      },
      {
        href: "/admin/memberships",
        label: "Memberships",
        icon: HandHeart,
        desc: "Free · Tribe · High Ticket",
        brand: "Both",
      },
      {
        href: "/admin/work-credit",
        label: "Work Credits",
        icon: Coins,
        desc: "Mama Coins & subscriptions",
        brand: "Mama",
      },
    ],
  },
  {
    id: "commerce",
    title: "Commerce",
    purpose: "Things people buy",
    layout: "grid",
    tiles: [
      {
        href: "/admin/manage-store",
        label: "Store",
        icon: ShoppingBag,
        desc: "Products, orders & categories",
        brand: "Mama",
      },
      {
        href: "/admin/manage-menu",
        label: "Menu",
        icon: Coffee,
        desc: "Restaurant menu items",
        brand: "Mama",
      },
      {
        href: "/admin/cards",
        label: "Cards",
        icon: CreditCard,
        desc: "Meal · gift · custom · tribe",
        brand: "Both",
      },
    ],
  },
  {
    id: "more",
    title: "More",
    purpose: "Still here, just out of the way",
    layout: "grid",
    tiles: [
      {
        href: "/admin/bookings",
        label: "Bookings",
        icon: ClipboardList,
        desc: "White Lotus venue enquiries",
        brand: "WL",
      },
      {
        href: "/admin/reviews",
        label: "Reviews",
        icon: MessageSquare,
        desc: "Customer feedback",
        brand: "Both",
      },
      {
        href: "/admin/manage-trips",
        label: "Trips",
        icon: Map,
        desc: "Tours & travel sessions",
        brand: "Both",
      },
      {
        href: "/admin/email",
        label: "Email",
        icon: Mail,
        desc: "Templates, previews & newsletter",
        brand: "Both",
      },
      {
        href: "/admin/automations",
        label: "Automations",
        icon: Workflow,
        desc: "Crons, webhooks & admin triggers",
        brand: "Both",
      },
    ],
  },
];

// ── Small components ─────────────────────────────────────────────────────────

function BrandChip({ brand }) {
  if (!brand) return null;
  const label = brand === "Both" ? "Mama · WL" : brand;
  return (
    <span
      className="text-[9px] uppercase tracking-[0.18em] text-[#9a7a62] bg-[#faf6f2] border border-[#e8ddd3] rounded-sm px-1.5 py-[2px] leading-none whitespace-nowrap"
      aria-label={`Brand: ${label}`}
    >
      {label}
    </span>
  );
}

function SectionHeader({ title, purpose, count, collapsible, open, onToggle }) {
  const Wrapper = collapsible ? "button" : "div";
  return (
    <Wrapper
      type={collapsible ? "button" : undefined}
      onClick={collapsible ? onToggle : undefined}
      className={`w-full flex items-center gap-3 mb-3 group ${
        collapsible ? "cursor-pointer" : ""
      }`}
    >
      <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#ff914d]/60" />
      <span className="text-[11px] uppercase tracking-[0.4em] text-[#9a7a62] font-medium">
        {title}
      </span>
      <span className="text-[11px] text-[#b8a898] hidden sm:inline">
        · {purpose}
      </span>
      <span className="text-[10px] text-[#c4b4a4] ml-1">
        ({count})
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e8ddd3]" />
      {collapsible && (
        <span
          className={`text-[#9a7a62] group-hover:text-[#ff914d] transition-all duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
        </span>
      )}
    </Wrapper>
  );
}

// Shared light-card vocabulary — matches AdminPanel / AdminStatCard in
// AdminShell.jsx so every surface on /admin/* reads as the same paper-and-
// ink system. White card, sand hairline border, soft warm shadow, top orange
// accent that brightens on hover.
const CARD_BASE = {
  background: "#ffffff",
  border: "1.5px solid #f0e6d8",
  boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
};
const CARD_HOVER_SHADOW =
  "0 6px 22px rgba(60,30,10,0.10), 0 0 0 1px rgba(255,145,77,0.18)";

function Tile({ tile, index, navigatingTo, onNavigate, wide = false }) {
  const Icon = tile.icon;
  const isLoading = navigatingTo === tile.href;

  // Thin horizontal row layout used for the Today section: short y-height,
  // icon on the left, title + description inline, brand chip on the right.
  if (wide) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 + index * 0.03, ease: EASE }}
        whileHover={{ y: -1, boxShadow: CARD_HOVER_SHADOW }}
        whileTap={{ scale: 0.99 }}
        style={{ borderRadius: 12 }}
      >
        <Link
          href={tile.href}
          onClick={() => onNavigate(tile.href)}
          className="group relative flex items-center gap-3 sm:gap-4 rounded-xl overflow-hidden px-4 sm:px-5 py-3.5 transition-colors duration-300"
          style={CARD_BASE}
        >
          {/* Left orange accent — vertical edge for the row layout. */}
          <div
            className="absolute top-0 bottom-0 left-0 w-[2px] transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,145,77,0.55) 0%, rgba(255,176,106,0.35) 50%, transparent 95%)",
              opacity: 0.7,
            }}
          />
          {/* Soft warm hover wash — barely there, just a hint of warmth. */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 140% at 0% 50%, rgba(255,145,77,0.06) 0%, transparent 65%)",
            }}
          />

          {/* Icon — light orange wash on the cream surface. */}
          <div
            className="relative z-10 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
            style={{ background: "rgba(255,145,77,0.14)" }}
          >
            {isLoading ? (
              <Loader2
                className="w-4 h-4 text-[#ff914d] animate-spin"
                strokeWidth={1.8}
              />
            ) : (
              <Icon className="w-4 h-4 text-[#ff914d]" strokeWidth={1.75} />
            )}
          </div>

          {/* Title + description inline */}
          <div className="relative z-10 flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
            <h2
              className="font-cormorant italic font-semibold text-[#2c1810] leading-tight whitespace-nowrap"
              style={{ fontSize: "clamp(1.15rem, 1.6vw, 1.35rem)" }}
            >
              {tile.label}
            </h2>
            <p className="text-[12px] sm:text-[13px] leading-snug text-[#9a7a62] truncate">
              {tile.desc}
            </p>
          </div>

          {/* Right slot */}
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <BrandChip brand={tile.brand} />
            <span
              className="text-[#c4b4a4] group-hover:text-[#ff914d] transition-all duration-300 text-base translate-x-0 group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default grid tile — compact vertical card used in the other sections.
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.04 + index * 0.025, ease: EASE }}
      whileHover={{ y: -2, boxShadow: CARD_HOVER_SHADOW }}
      whileTap={{ scale: 0.99 }}
      style={{ borderRadius: 12 }}
    >
      <Link
        href={tile.href}
        onClick={() => onNavigate(tile.href)}
        className="group relative flex flex-col gap-2.5 rounded-xl overflow-hidden p-4 sm:p-[18px] transition-colors duration-300 h-full"
        style={CARD_BASE}
      >
        {/* Top orange accent — same flourish as AdminPanel. */}
        <div
          className="absolute top-0 left-0 right-0 h-[1.5px] transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to right, rgba(255,145,77,0.55) 0%, rgba(255,176,106,0.35) 45%, transparent 90%)",
            opacity: 0.85,
          }}
        />
        {/* Soft warm hover wash */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 100% 110% at 0% 0%, rgba(255,145,77,0.07) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
            style={{ background: "rgba(255,145,77,0.14)" }}
          >
            {isLoading ? (
              <Loader2
                className="w-4 h-4 text-[#ff914d] animate-spin"
                strokeWidth={1.8}
              />
            ) : (
              <Icon className="w-4 h-4 text-[#ff914d]" strokeWidth={1.75} />
            )}
          </div>

          <div className="flex items-center gap-2">
            <BrandChip brand={tile.brand} />
            <span
              className="text-[#c4b4a4] group-hover:text-[#ff914d] transition-all duration-300 text-base translate-x-0 group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <h2
            className="font-cormorant italic font-semibold leading-tight text-[#2c1810]"
            style={{ fontSize: "clamp(1.2rem, 1.7vw, 1.45rem)" }}
          >
            {tile.label}
          </h2>
          <p className="mt-0.5 leading-snug text-[#9a7a62] text-[12px] sm:text-[13px]">
            {tile.desc}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function Section({ section, navigatingTo, onNavigate, open, onToggle }) {
  const isWide = section.layout === "wide";
  return (
    <section className="mb-6 sm:mb-8">
      <SectionHeader
        title={section.title}
        purpose={section.purpose}
        count={section.tiles.length}
        collapsible={Boolean(section.collapsed)}
        open={open}
        onToggle={onToggle}
      />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={section.collapsed ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div
              className={
                isWide
                  ? "grid grid-cols-1 md:grid-cols-2 gap-3"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              }
            >
              {section.tiles.map((tile, i) => (
                <Tile
                  key={tile.href}
                  tile={tile}
                  index={i}
                  navigatingTo={navigatingTo}
                  onNavigate={onNavigate}
                  wide={isWide}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [navigatingTo, setNavigatingTo] = useState(null);
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(SECTIONS.map((s) => [s.id, !s.collapsed])),
  );

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <AdminGuard>
      <div className="relative min-h-screen" style={{ background: "#f9f4ec" }}>
        <ProfileHero
          title="Command Centre"
          eyebrow="Admin"
          subtitle="Mama Reykjavík · White Lotus · Full site control"
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-8 sm:pt-10 -mt-4 sm:-mt-6">
          {SECTIONS.map((section) => (
            <Section
              key={section.id}
              section={section}
              navigatingTo={navigatingTo}
              onNavigate={setNavigatingTo}
              open={openSections[section.id]}
              onToggle={() => toggleSection(section.id)}
            />
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-[#9a7a62] text-xs tracking-[0.2em] uppercase hover:text-[#ff914d] transition-colors"
            >
              ← Back to profile
            </Link>
          </motion.div>
        </div>
      </div>
    </AdminGuard>
  );
}
