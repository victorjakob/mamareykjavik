"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  UserCircle,
  Ticket,
  CalendarRange,
  Settings,
  LogOut,
  Loader2,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import { useRole } from "@/hooks/useRole";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import PageBackground from "@/app/components/ui/PageBackground";
import WorkCredit from "./WorkCredit";
import MealCardsWidget from "./components/MealCardsWidget";
import TribeCardWidget from "./components/TribeCardWidget";
import MembershipWidget from "./components/MembershipWidget";
import ProfileHero from "./components/ProfileHero";

const NAV_ITEMS = [
  { href: "/profile/my-profile", title: "Profile",        desc: "Name, email & password", icon: UserCircle,    requiresNonGmail: true },
  { href: "/profile/my-tickets", title: "My Tickets",     desc: "Upcoming & past events",  icon: Ticket },
  { href: "/events/manager",     title: "Event Manager",  desc: "Create & manage events",  icon: CalendarRange, roles: ["host", "admin"] },
  { href: "/admin",              title: "Admin",          desc: "Full site control",        icon: Settings,      roles: ["admin"] },
  { href: "/admin/bookings",     title: "Bookings",       desc: "Venue enquiries",          icon: ClipboardList, roles: ["admin"] },
];

export default function ProfileSelector() {
  const { data: session, status } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState(null);
  const role = useRole();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Friend";
  const initial = firstName.charAt(0).toUpperCase();
  const isGmailUser = user?.provider === "google";

  const visibleItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (item.requiresNonGmail && isGmailUser) return false;
        if (item.roles && !item.roles.includes(role)) return false;
        return true;
      }),
    [role, isGmailUser]
  );

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut({ callbackUrl: "/auth" });
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setSigningOut(false);
    }
  };

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <PageBackground />
      <LoadingSpinner />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <PageBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: "#fff3e8", border: "2px solid #ffd6aa" }}>
          <UserCircle className="w-10 h-10" style={{ color: "#ff914d" }} />
        </div>
        <h2 className="font-cormorant font-light italic text-4xl mb-3" style={{ color: "#2c1810" }}>Please Sign In</h2>
        <p className="mb-10 text-base" style={{ color: "#9a7a62" }}>Sign in to access your profile and bookings.</p>
        <Link href="/auth"
          className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-full shadow-md"
          style={{ background: "#ff914d", color: "#fff" }}>
          Sign In
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <PageBackground />

      <div className="relative z-10">
        <ProfileHero firstName={firstName} />

        <div
          className="mx-auto max-w-sm px-6 pb-20 pt-2 sm:max-w-xl lg:max-w-5xl lg:px-10"
          data-navbar-theme="light"
        >

          {/* ── Avatar ────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center -mt-10 mb-10"
          >
            <div className="relative inline-flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.28, 0.12, 0.28] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-24 w-24 rounded-full"
                style={{ border: "1.5px solid rgba(255,145,77,0.35)" }}
              />
              <div
                className="relative z-10 flex h-[68px] w-[68px] items-center justify-center rounded-full shadow-lg"
                style={{ background: "linear-gradient(135deg, #ff914d 0%, #ffb06a 100%)", boxShadow: "0 8px 28px rgba(255,145,77,0.35)" }}
              >
                <span className="font-cormorant italic leading-none text-white select-none" style={{ fontSize: "2rem" }}>
                  {initial}
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm font-medium" style={{ color: "#2c1810" }}>{user?.name || user?.email}</p>
            <p className="text-xs mt-0.5" style={{ color: "#c0a890" }}>{user?.email}</p>
          </motion.div>

          {/* ── Two-column layout ─────────────────────────────── */}
          <div className="lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-x-12 lg:items-start">

            {/* Left — Wallet (Mama Coins + meal cards) */}
            <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1"
              >
                <WorkCredit userEmail={user?.email} />
                <MembershipWidget />
                <MealCardsWidget />
                <TribeCardWidget />
              </motion.div>
            </aside>

            {/* Right — Navigation */}
            <div className="min-w-0 mt-10 lg:mt-0">

              {/* Section label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.28 }}
                className="mb-4 flex items-center gap-3"
              >
                <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, #e8ddd3)" }} />
                <span className="text-[10px] uppercase tracking-[0.5em] select-none" style={{ color: "#c0a890" }}>
                  Quick access
                </span>
                <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, #e8ddd3)" }} />
              </motion.div>

              {/* ── Nav list ──────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "#fefcf8",
                  border: "1.5px solid #e8ddd3",
                  boxShadow: "0 2px 16px rgba(60,30,10,0.06)",
                }}
              >
                {visibleItems.map((item, i) => {
                  const Icon = item.icon;
                  const isLoading = navigatingTo === item.href;
                  const isLast = i === visibleItems.length - 1;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.38 + i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setNavigatingTo(item.href)}
                        className="group relative flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-[#fff7f0]/60"
                        style={!isLast ? { borderBottom: "1px solid #f0e8dc" } : undefined}
                      >
                        {/* Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md"
                          style={{
                            background: "rgba(255,145,77,0.08)",
                            border: "1px solid rgba(255,145,77,0.12)",
                          }}
                        >
                          {isLoading ? (
                            <Loader2 className="w-[18px] h-[18px] animate-spin" style={{ color: "#ff914d" }} strokeWidth={1.6} />
                          ) : (
                            <Icon className="w-[18px] h-[18px] transition-colors duration-200" style={{ color: "#c0a890" }} strokeWidth={1.6} />
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-medium leading-snug group-hover:text-[#ff914d] transition-colors duration-200" style={{ color: "#2c1810" }}>
                            {item.title}
                          </p>
                          <p className="text-xs mt-0.5 leading-snug" style={{ color: "#b0a498" }}>
                            {item.desc}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight
                          className="w-4 h-4 shrink-0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#ff914d]"
                          style={{ color: "#d4ccc2" }}
                          strokeWidth={1.8}
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* ── Sign out ──────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mt-10 flex justify-center lg:justify-end"
              >
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-wide transition-all duration-200 disabled:cursor-not-allowed"
                  style={{ color: "#c0a890", border: "1px solid transparent" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#9a7a62";
                    e.currentTarget.style.borderColor = "#e8ddd3";
                    e.currentTarget.style.background = "rgba(255,145,77,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#c0a890";
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {signingOut ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing out…</>
                  ) : (
                    <><LogOut className="w-3.5 h-3.5 group-hover:rotate-[-8deg] transition-transform duration-200" /> Sign out</>
                  )}
                </button>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
