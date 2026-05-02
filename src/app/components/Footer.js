"use client";

import { useMemo, useState, useEffect } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CookiePreferencesManager from "./CookiePreferencesManager";

export function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const pathname = usePathname();
  const [showCookiePreferences, setShowCookiePreferences] = useState(false);

  useEffect(() => {
    const handleOpenCookiePreferences = () => setShowCookiePreferences(true);
    window.addEventListener("openCookiePreferences", handleOpenCookiePreferences);
    return () => window.removeEventListener("openCookiePreferences", handleOpenCookiePreferences);
  }, []);

  if (
    pathname === "/" ||
    pathname === "/review" ||
    pathname === "/is/review" ||
    pathname === "/whitelotus/booking" ||
    /\/events\/manager\/[^/]+\/gatekeeper(\/|$)/.test(pathname || "")
  ) {
    return null;
  }

  return (
    <footer className="relative w-full overflow-hidden bg-[#110f0d] text-[#f0ebe3]">
      {/* Top gradient border */}
      <div className="relative z-10 h-px w-full bg-gradient-to-r from-transparent via-[#ff914d]/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-16">

          {/* — Mama Restaurant — */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]">Mama Reykjavík</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li>
                <Link href="/restaurant" className="text-sm text-[#c0b4a8] hover:text-[#f0ebe3] transition-colors duration-200">
                  Restaurant
                </Link>
              </li>
              <li>
                <Link href="/restaurant/menu" className="text-sm text-[#c0b4a8] hover:text-[#f0ebe3] transition-colors duration-200">
                  Menu
                </Link>
              </li>
              <li>
                <a href="https://www.dineout.is/mamareykjavik?isolation=true" target="_blank" rel="noopener noreferrer" className="text-sm text-[#c0b4a8] hover:text-[#f0ebe3] transition-colors duration-200">
                  Book a Table
                </a>
              </li>
              <li>
                <Link href="/catering" className="text-sm text-[#c0b4a8] hover:text-[#f0ebe3] transition-colors duration-200">
                  Catering
                </Link>
              </li>
              <li>
                <a
                  href="https://wolt.com/is/isl/reykjavik/restaurant/mama-reykjavik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#c0b4a8] hover:text-[#f0ebe3] transition-colors duration-200"
                >
                  Order on Wolt
                </a>
              </li>
            </ul>
            <p className="text-xs text-[#9a8e82] leading-relaxed mb-1">Open daily · 11:30 – 21:00</p>
            <p className="text-xs text-[#9a8e82]">+354 766 6262 · team@mama.is</p>
            <div className="flex gap-4 mt-5">
              <a href="https://www.facebook.com/mamareykjavik" target="_blank" rel="noopener noreferrer"
                className="text-[#9a8e82] hover:text-[#ff914d] transition-colors duration-200">
                <FaFacebook className="w-4.5 h-4.5" />
              </a>
              <a href="https://www.instagram.com/mamareykjavik" target="_blank" rel="noopener noreferrer"
                className="text-[#9a8e82] hover:text-[#ff914d] transition-colors duration-200">
                <FaInstagram className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* — Centre logos — */}
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex items-center gap-6 md:gap-8">
              <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden">
                <video
                  src="/mamaimg/mamalogovideo.mp4"
                  autoPlay loop muted playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-px h-12 md:h-16 bg-white/10" />
              <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32">
                <Image
                  src="https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1766567396/wl-darkbg_lfm9ye.png"
                  alt="White Lotus"
                  fill
                  sizes="(max-width: 768px) 80px, (max-width: 1024px) 112px, 128px"
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#9a8e82] text-center">
              Bankastræti 2 · Reykjavík
            </p>
            <Link
              href="/contact"
              className="rounded-full border border-[#ff914d]/35 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#ff914d] transition-all duration-200 hover:border-[#ff914d]/60 hover:bg-[#ff914d]/10"
            >
              Get in touch
            </Link>
          </div>

          {/* — White Lotus — */}
          <div className="md:text-right">
            <div className="flex items-center gap-3 mb-6 md:justify-end">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#ff914d]">White Lotus</span>
              <div className="w-6 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
            </div>
            <ul className="space-y-3 mb-6">
              <li>
                <Link href="/whitelotus" className="text-sm text-[#c0b4a8] hover:text-[#f0ebe3] transition-colors duration-200">
                  The Venue
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-sm text-[#c0b4a8] hover:text-[#f0ebe3] transition-colors duration-200">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/whitelotus/rent" className="text-sm text-[#c0b4a8] hover:text-[#f0ebe3] transition-colors duration-200">
                  Host Your Event
                </Link>
              </li>
              <li>
                <Link
                  href="/kornhladan"
                  className="text-sm text-[#c0b4a8] hover:text-[#f0ebe3] transition-colors duration-200"
                >
                  Kornhlaðan — Corporate Events
                </Link>
              </li>
            </ul>
            <p className="text-xs text-[#9a8e82] mb-1">+354 770 5111 · team@whitelotus.is</p>
            <div className="flex gap-4 mt-5 md:justify-end">
              <a href="https://www.facebook.com/profile.php?id=61566431262645" target="_blank" rel="noopener noreferrer"
                className="text-[#9a8e82] hover:text-[#ff914d] transition-colors duration-200">
                <FaFacebook className="w-4.5 h-4.5" />
              </a>
              <a href="https://www.instagram.com/whitelotusvenue" target="_blank" rel="noopener noreferrer"
                className="text-[#9a8e82] hover:text-[#ff914d] transition-colors duration-200">
                <FaInstagram className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.10] to-transparent mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#9a8e82]">
            © {currentYear} Blessing ehf. & White Lotus ehf.
          </p>
          <div className="flex items-center gap-5 text-[11px] text-[#9a8e82]">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("openCookiePreferences"))}
              className="hover:text-[#ff914d] transition-colors duration-200"
            >
              Cookie Preferences
            </button>
            <Link href="/policies" className="hover:text-[#ff914d] transition-colors duration-200">Policies</Link>
            <Link href="/contact" className="hover:text-[#ff914d] transition-colors duration-200">Contact</Link>
            <Link href="/brand" className="hover:text-[#ff914d] transition-colors duration-200">Brand</Link>
            <Link href="/collaborations" className="hover:text-[#ff914d] transition-colors duration-200">Collaborations</Link>
          </div>
        </div>
      </div>

      <CookiePreferencesManager
        isOpen={showCookiePreferences}
        onClose={() => setShowCookiePreferences(false)}
      />
    </footer>
  );
}
