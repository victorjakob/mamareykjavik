"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminGuard from "../AdminGuard";
import Link from "next/link";
import { CreditCard, Gift, ArrowRight, Building2, Loader2, Sparkles } from "lucide-react";
import { AdminShell, AdminHero } from "@/app/admin/components/AdminShell";

// ── Dark stat card ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, title, stats, linkHref, linkLabel, accent = "#ff914d", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1.5px solid #f0e6d8",
        boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
      }}
    >
      <div className="h-[1.5px]" style={{ background: `linear-gradient(to right, ${accent}, transparent 60%)` }} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,145,77,0.14)" }}>
            <Icon className="w-4 h-4 text-[#ff914d]" strokeWidth={1.5} />
          </div>
          <h2 className="text-[#2c1810] text-sm font-medium">{title}</h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {stats.map(({ label, value, highlight }) => (
            <div key={label} className="bg-[#faf6f2] rounded-lg p-3">
              <p className="text-[#9a7a62] text-[10px] uppercase tracking-wide mb-1">{label}</p>
              <p className={`font-cormorant italic text-2xl font-light ${highlight ? "text-[#ff914d]" : "text-[#2c1810]"}`}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <Link href={linkHref}
          className="inline-flex items-center gap-1.5 text-xs text-[#9a7a62] hover:text-[#ff914d] transition-colors">
          {linkLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function CardsOverview() {
  const [mealCardStats, setMealCardStats] = useState({ total: 0, active: 0, used: 0, expired: 0 });
  const [giftCardStats, setGiftCardStats] = useState({ total: 0, active: 0, used: 0, pending: 0 });
  const [customCardStats, setCustomCardStats] = useState({ total: 0, active: 0, used: 0, expired: 0 });
  const [tribeCardStats, setTribeCardStats] = useState({ total: 0, active: 0, expired: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [mealRes, giftRes, customRes, tribeRes, tribeReqRes] = await Promise.all([
        fetch("/api/admin/meal-cards"),
        fetch("/api/admin/gift-cards"),
        fetch("/api/admin/custom-cards"),
        fetch("/api/admin/tribe-cards"),
        fetch("/api/admin/tribe-cards/requests?status=pending"),
      ]);

      if (mealRes.ok) {
        const { cards = [] } = await mealRes.json();
        const now = new Date();
        setMealCardStats({
          total: cards.length,
          active: cards.filter((c) => c.status === "paid" && c.meals_remaining > 0 && new Date(c.valid_until) > now).length,
          used: cards.filter((c) => c.meals_remaining === 0 && c.status === "paid").length,
          expired: cards.filter((c) => new Date(c.valid_until) < now).length,
        });
      }
      if (giftRes.ok) {
        const { cards = [] } = await giftRes.json();
        setGiftCardStats({
          total: cards.length,
          active: cards.filter((c) => c.status === "paid" && c.remaining_balance > 0).length,
          used: cards.filter((c) => c.remaining_balance === 0 && c.status === "paid").length,
          pending: cards.filter((c) => c.status === "pending").length,
        });
      }
      if (customRes.ok) {
        const { cards = [] } = await customRes.json();
        setCustomCardStats({
          total: cards.length,
          active: cards.filter((c) => c.status === "active" && c.remaining_balance > 0).length,
          used: cards.filter((c) => c.status === "used" || c.remaining_balance === 0).length,
          expired: cards.filter((c) => c.status === "expired").length,
        });
      }
      if (tribeRes.ok) {
        const { cards = [] } = await tribeRes.json();
        const now = new Date();
        setTribeCardStats((s) => ({
          ...s,
          total: cards.length,
          active: cards.filter(
            (c) =>
              c.status === "active" &&
              (!c.expires_at || new Date(c.expires_at) >= now),
          ).length,
          expired: cards.filter(
            (c) =>
              c.status === "expired" ||
              (c.status === "active" &&
                c.expires_at &&
                new Date(c.expires_at) < now),
          ).length,
        }));
      }
      if (tribeReqRes.ok) {
        const { requests = [] } = await tribeReqRes.json();
        setTribeCardStats((s) => ({ ...s, pendingRequests: requests.length }));
      }
    } catch (err) {
      console.error("Error fetching card stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-[#ff914d] animate-spin" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminShell maxWidth="max-w-5xl">
        <AdminHero
          eyebrow="Admin"
          title="Cards Management"
          subtitle="Meal cards, gift cards, custom cards & tribe cards"
        />

          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard
              icon={CreditCard} title="Meal Cards" delay={0}
              stats={[
                { label: "Total", value: mealCardStats.total },
                { label: "Active", value: mealCardStats.active, highlight: true },
                { label: "Used", value: mealCardStats.used },
                { label: "Expired", value: mealCardStats.expired },
              ]}
              linkHref="/admin/cards/manage-meal-cards" linkLabel="Manage meal cards"
            />
            <StatCard
              icon={Gift} title="Gift Cards" delay={0.06}
              stats={[
                { label: "Total", value: giftCardStats.total },
                { label: "Active", value: giftCardStats.active, highlight: true },
                { label: "Used", value: giftCardStats.used },
                { label: "Pending", value: giftCardStats.pending },
              ]}
              linkHref="/admin/cards/giftcards" linkLabel="Manage gift cards"
            />
            <StatCard
              icon={Building2} title="Custom Cards" delay={0.12}
              stats={[
                { label: "Total", value: customCardStats.total },
                { label: "Active", value: customCardStats.active, highlight: true },
                { label: "Used", value: customCardStats.used },
                { label: "Expired", value: customCardStats.expired },
              ]}
              linkHref="/admin/cards/custom-cards" linkLabel="Manage custom cards"
            />
            <StatCard
              icon={Sparkles} title="Tribe Cards" delay={0.18}
              stats={[
                { label: "Pending", value: tribeCardStats.pendingRequests, highlight: tribeCardStats.pendingRequests > 0 },
                { label: "Active", value: tribeCardStats.active },
                { label: "Total", value: tribeCardStats.total },
                { label: "Expired", value: tribeCardStats.expired },
              ]}
              linkHref="/admin/cards/tribe-cards" linkLabel="Manage tribe cards"
            />
          </div>

          {/* Quick action tiles */}
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#7a6a5a] mb-4">Quick access</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: "/admin/cards/manage-meal-cards", icon: CreditCard, label: "Manage Meal Cards",   desc: "View & manage all purchases" },
              { href: "/admin/cards/giftcards",          icon: Gift,       label: "Manage Gift Cards",   desc: "View & manage gift cards" },
              { href: "/admin/cards/custom-cards",       icon: Building2,  label: "Manage Custom Cards", desc: "Companies & individuals" },
              { href: "/admin/cards/tribe-cards",        icon: Sparkles,   label: "Manage Tribe Cards",  desc: "Discount cards for the community" },
            ].map(({ href, icon: Icon, label, desc }, i) => (
              <motion.div key={href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3 + i * 0.05 }}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}
              >
                <Link href={href}
                  className="group relative flex items-center gap-4 rounded-xl overflow-hidden px-5 py-4"
                  style={{
                    background: "linear-gradient(145deg, #221508 0%, #1c1208 100%)",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)",
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] opacity-30 group-hover:opacity-80 transition-opacity"
                    style={{ background: "linear-gradient(to right, #ff914d, transparent 60%)" }} />
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[rgba(255,145,77,0.12)] group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4 text-[#ff914d]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#e8dfd6] text-sm font-medium group-hover:text-[#f0ebe3] transition-colors">{label}</p>
                    <p className="text-[#6a5a50] text-xs group-hover:text-[#9a8e82] transition-colors">{desc}</p>
                  </div>
                  <span className="text-[#3a2812] group-hover:text-[#ff914d]/50 transition-colors text-sm">→</span>
                </Link>
              </motion.div>
            ))}
          </div>
      </AdminShell>
    </AdminGuard>
  );
}
