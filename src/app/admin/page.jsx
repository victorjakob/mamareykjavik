"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AdminGuard from "./AdminGuard";
import Link from "next/link";
import ProfileHero from "@/app/profile/components/ProfileHero";
import {
  PlusCircle,
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
} from "lucide-react";

/**
 * Admin Command Centre — tile dashboard.
 * Dark espresso tiles on a cream surface. Bold cormorant italic labels,
 * clear secondary descriptions, warm orange accents.
 */
const TILES = [
  { href: "/admin/manage-trips",   label: "Manage Trips",   icon: Map,           desc: "Tours & travel sessions" },
  { href: "/admin/create-event",   label: "Create Event",   icon: PlusCircle,    desc: "New White Lotus event" },
  { href: "/admin/manage-events",  label: "Manage Events",  icon: CalendarRange, desc: "Edit, delete & stats" },
  { href: "/admin/manage-users",   label: "Manage Users",   icon: Users,         desc: "Roles & accounts" },
  { href: "/admin/manage-menu",    label: "Manage Menu",    icon: Coffee,        desc: "Restaurant menu items" },
  { href: "/admin/manage-store",   label: "Manage Store",   icon: ShoppingBag,   desc: "Products & categories" },
  { href: "/admin/work-credit",    label: "Work Credits",   icon: Coins,         desc: "Mama Coins & subscriptions" },
  { href: "/admin/memberships",    label: "Memberships",    icon: HandHeart,     desc: "Free · Tribe · High Ticket" },
  { href: "/admin/cards",          label: "Cards",          icon: CreditCard,    desc: "Meal, gift & custom cards" },
  { href: "/admin/bookings",       label: "Bookings",       icon: ClipboardList, desc: "White Lotus venue enquiries" },
  { href: "/admin/reviews",        label: "Reviews",        icon: MessageSquare, desc: "Customer feedback" },
  { href: "/admin/summer-market",  label: "Summer Market",  icon: Flower2,       desc: "Market applications" },
];

const EASE = [0.22, 1, 0.36, 1];

export default function AdminDashboard() {
  const [navigatingTo, setNavigatingTo] = useState(null);

  return (
    <AdminGuard>
      <div className="relative min-h-screen" style={{ background: "#f9f4ec" }}>
        <ProfileHero
          title="Command Centre"
          eyebrow="Admin"
          subtitle="Mama Reykjavík · Full site control"
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-8 sm:pt-10 -mt-4 sm:-mt-6">
          {/* Lead-in label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mb-6 sm:mb-8 flex items-center gap-3"
          >
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#ff914d]/60" />
            <span className="text-[11px] uppercase tracking-[0.4em] text-[#9a7a62] font-medium">
              Workspaces
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e8ddd3]" />
          </motion.div>

          {/* Tile grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {TILES.map((tile, i) => {
              const Icon = tile.icon;
              const isLoading = navigatingTo === tile.href;
              return (
                <motion.div
                  key={tile.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.04, ease: EASE }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <Link
                    href={tile.href}
                    onClick={() => setNavigatingTo(tile.href)}
                    className="group relative flex flex-col gap-4 rounded-2xl overflow-hidden p-6 sm:p-7 transition-all duration-300 h-full"
                    style={{
                      background:
                        "linear-gradient(155deg, #221508 0%, #1a0f06 100%)",
                      border: "1px solid rgba(255,145,77,0.12)",
                      boxShadow:
                        "0 4px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)",
                    }}
                  >
                    {/* Top warm accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(to right, #ff914d 0%, #ffb06a 45%, transparent 85%)",
                      }}
                    />
                    {/* Hover radial glow */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse 90% 110% at 0% 0%, rgba(255,145,77,0.14) 0%, transparent 65%)",
                      }}
                    />

                    {/* Icon */}
                    <div className="relative z-10 flex items-start justify-between">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(255,145,77,0.22) 0%, rgba(255,145,77,0.08) 100%)",
                          border: "1px solid rgba(255,145,77,0.28)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                        }}
                      >
                        {isLoading ? (
                          <Loader2
                            className="w-5 h-5 text-[#ff914d] animate-spin"
                            strokeWidth={1.8}
                          />
                        ) : (
                          <Icon
                            className="w-5 h-5 text-[#ffb06a]"
                            strokeWidth={1.75}
                          />
                        )}
                      </div>

                      <span
                        className="text-[#6a5848] group-hover:text-[#ff914d] transition-all duration-300 text-lg translate-x-0 group-hover:translate-x-1"
                        aria-hidden
                      >
                        →
                      </span>
                    </div>

                    {/* Text block */}
                    <div className="relative z-10 mt-2">
                      <h2
                        className="font-cormorant italic font-light leading-tight text-[#f4ece1] group-hover:text-white transition-colors duration-300"
                        style={{ fontSize: "clamp(1.6rem, 2.4vw, 1.9rem)" }}
                      >
                        {tile.label}
                      </h2>
                      <p className="mt-1.5 text-[13px] sm:text-sm leading-relaxed text-[#b8a898] group-hover:text-[#d4c6b6] transition-colors duration-300">
                        {tile.desc}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Back to profile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-14 text-center"
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
