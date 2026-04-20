"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Leaf, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import TribeCardVisual from "@/app/tribe-card/components/TribeCardVisual";

export default function MyTribeCard() {
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const res = await fetch("/api/tribe-cards/mine");
        const data = await res.json();
        if (alive) setCard(data.card || null);
      } catch (err) {
        console.error("failed to load tribe card:", err);
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, []);

  const shareUrl = card ? `${window?.location?.origin || "https://mama.is"}/tribe-card/${card.access_token}` : "";

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy");
    }
  };

  // Shared dark warm hero so the site's white navbar stays legible.
  const Hero = ({ title = "Your Tribe Card" }) => (
    <section
      data-navbar-theme="dark"
      className="relative overflow-hidden bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12] pt-28 sm:pt-32 pb-12 px-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(circle at 22% 18%, rgba(255,145,77,0.3) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(31,92,75,0.25) 0%, transparent 55%)",
        }}
      />
      <div className="relative max-w-xl mx-auto text-center">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#f1c9a0] mb-2">
          Mama · Tribe
        </p>
        <h1
          className="font-cormorant italic text-white text-3xl sm:text-[44px] font-light"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          {title}
        </h1>
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff6ea] via-white to-[#f5efe6]">
        <Hero />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 text-[#c76a2b] animate-spin" />
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff6ea] via-white to-[#f5efe6]">
        <Hero title="Tribe Card" />
        <div className="pt-10 pb-20 px-5">
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[rgba(199,106,43,0.12)] flex items-center justify-center mb-5">
              <Leaf className="w-6 h-6 text-[#c76a2b]" strokeWidth={1.5} />
            </div>
            <h2
              className="font-cormorant italic text-[#2c1810] text-3xl mb-2"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              No Tribe Card yet
            </h2>
            <p className="text-[#6a5040] text-[14px] leading-relaxed mb-6">
              If you received a physical Tribe Card or we told you in person
              you&apos;re part of the tribe, you can request your digital card here.
            </p>
            <Link
              href="/tribe-card/request"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#c76a2b] hover:bg-[#a5551f] transition-colors text-white font-semibold rounded-full text-[14px]"
            >
              Request your card
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff6ea] via-white to-[#f5efe6]">
      <Hero />
      <div className="pt-8 pb-20 px-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-xl mx-auto"
        >
          <div className="flex justify-center mb-7">
            <TribeCardVisual card={card} />
          </div>

          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <Link
              href={`/tribe-card/${card.access_token}`}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#c76a2b] hover:bg-[#a5551f] transition-colors text-white font-semibold rounded-full text-[13px]"
            >
              Open card page
            </Link>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-[#c76a2b] text-[#c76a2b] hover:bg-[#c76a2b]/5 transition-colors rounded-full text-[13px] font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>

          <div className="bg-white/80 border border-[#eadfd2] rounded-2xl p-5">
            <p className="text-[12px] tracking-[0.18em] uppercase text-[#8a4a20] font-semibold mb-2">
              How to use it
            </p>
            <ul className="text-[14px] text-[#4e3c30] leading-relaxed space-y-1.5">
              <li>• When you pay, open your card here and show it to the team — your discount is applied on the spot.</li>
              <li>• Your card lives in your profile on mama.is, ready whenever you visit.</li>
              <li>• You can also share or bookmark the card link, or keep the welcome email handy as a backup.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
