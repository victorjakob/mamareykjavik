"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import TribeCardVisual from "./TribeCardVisual";
import { useLanguage } from "@/hooks/useLanguage";

// Client body for /tribe-card/[token] — extracted so page.jsx can stay a
// server component and expose `generateMetadata`. See ../[token]/page.jsx.

const COPY = {
  en: {
    notFound: "Card not found",
    about: "About the Tribe Card",
    aboutHref: "/tribe-card",
    eyebrow: "Mama · Tribe",
    heading: "Your Tribe Card",
    howTitle: "How to use it",
    howItems: [
      "When you pay, open your card and show it to the team — your discount is applied on the spot.",
      "Sign in at mama.is and your card lives in your profile, ready whenever you visit.",
      "You can also bookmark this page or keep the welcome email handy as a backup.",
    ],
    openInProfile: "Open in my profile",
    madeWithLove: "Made with love · Mama Reykjavík",
    profileHref: "/profile/my-tribe-card",
  },
  is: {
    notFound: "Kort finnst ekki",
    about: "Um Ættbálkurkortið",
    aboutHref: "/is/tribe-card",
    eyebrow: "Mama · Ættbálkur",
    heading: "Ættbálkurkortið þitt",
    howTitle: "Hvernig á að nota það",
    howItems: [
      "Þegar þú greiðir opnarðu kortið og sýnir teyminu — afslátturinn er færður strax.",
      "Skráðu þig inn á mama.is og kortið þitt geymist í prófílnum, tilbúið þegar þú kemur við.",
      "Þú getur líka bókað síðuna eða haldið móttökutölvupóstinum við hendi sem öryggisafrit.",
    ],
    openInProfile: "Opna í prófílnum mínum",
    madeWithLove: "Gert með ást · Mama Reykjavík",
    profileHref: "/profile/my-tribe-card",
  },
};

export default function TribeCardTokenClient() {
  const { token } = useParams();
  const { language } = useLanguage();
  const t = COPY[language === "is" ? "is" : "en"];

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const res = await fetch(`/api/tribe-cards/by-token/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load card");
        if (alive) setCard(data.card);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (token) run();
    return () => {
      alive = false;
    };
  }, [token]);

  if (loading) {
    return (
      <div
        data-navbar-theme="dark"
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12]"
      >
        <Loader2 className="w-8 h-8 text-[#ff914d] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff6ea] via-white to-[#f5efe6]">
        <section
          data-navbar-theme="dark"
          className="bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12] pt-28 sm:pt-32 pb-12 px-5"
        />
        <div className="flex items-center justify-center px-5 pt-10 pb-16">
          <div className="max-w-sm text-center bg-white/85 border border-[#eadfd2] rounded-2xl p-8">
            <AlertCircle className="w-10 h-10 text-[#c76a2b] mx-auto mb-4" />
            <h1 className="font-cormorant italic text-[#2c1810] text-2xl mb-2">
              {t.notFound}
            </h1>
            <p className="text-[#6a5040] text-sm mb-6">{error}</p>
            <Link
              href={t.aboutHref}
              className="inline-block px-5 py-2.5 bg-[#c76a2b] text-white rounded-full text-sm font-semibold"
            >
              {t.about}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff6ea] via-white to-[#f5efe6]">
      {/* Dark warm hero — keeps the navbar legible. */}
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
            {t.eyebrow}
          </p>
          <h1
            className="font-cormorant italic text-white text-3xl sm:text-[44px] font-light"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {t.heading}
          </h1>
        </div>
      </section>

      <div className="pb-20 px-5">
        <div className="max-w-xl mx-auto pt-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-8">
              <TribeCardVisual card={card} />
            </div>

            <div className="bg-white/80 border border-[#eadfd2] rounded-2xl p-5 sm:p-6 mb-5">
              <p className="text-[12px] tracking-[0.18em] uppercase text-[#8a4a20] font-semibold mb-2">
                {t.howTitle}
              </p>
              <ul className="text-[14px] text-[#4e3c30] leading-relaxed space-y-1.5">
                {t.howItems.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <Link
                href={t.profileHref}
                className="text-[13px] text-[#c76a2b] hover:text-[#a5551f] underline underline-offset-4"
              >
                {t.openInProfile}
              </Link>
            </div>

            <p className="text-center mt-10 text-[12px] text-[#8a7261]">
              {t.madeWithLove}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
