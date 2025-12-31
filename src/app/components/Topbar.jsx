"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Desktop from "./Navbar/Desktop";
import Mobile from "./Navbar/Mobile";
import { usePathname } from "next/navigation";
import ContactChatbox from "./Navbar/ContactChatbox";

export default function Topbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only show logo when at the very top of the page
      if (currentScrollY === 0) {
        setIsVisible(true);
      } else {
        // Hide logo as soon as user scrolls down
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Hide navbar on homepage, booking form, and booking detail pages
  if (
    pathname === "/" ||
    pathname === "/whitelotus/booking" ||
    pathname?.startsWith("/whitelotus/booking/")
  ) {
    return null;
  }

  const isWhiteLotusPage = pathname === "/whitelotus";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-start relative">
            {/* Logo - Non-clickable, scroll-based visibility */}
            {!isWhiteLotusPage && (
              <div className="relative z-50 pointer-events-none">
                <div
                  className={`relative w-32 sm:w-32 md:w-36 lg:w-40 xl:w-48 aspect-[724/787] transition-all duration-500 ease-in-out ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-4"
                  }`}
                >
                  <Image
                    src="/mamaimg/mamalogo.png"
                    alt="Logo"
                    priority
                    fill
                    sizes="(max-width: 640px) 192px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            )}

            <Desktop />
          </div>
        </div>
        <Mobile />
      </nav>
      <ContactChatbox />
    </>
  );
}
