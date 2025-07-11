"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Desktop from "./Navbar/Desktop";
import Mobile from "./Navbar/Mobile";
import { usePathname } from "next/navigation";
import ContactChatbox from "./Navbar/ContactChatbox";

export default function Topbar() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-start relative">
            {/* Logo - Always visible */}
            <Link href="/" className="relative z-50 pointer-events-auto">
              <div className="relative w-32 sm:w-32 md:w-36 lg:w-40 xl:w-48 aspect-[724/787]">
                <Image
                  src="/mamaimg/mamalogo.png"
                  alt="Logo"
                  priority
                  fill
                  sizes="(max-width: 640px) 192px"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </Link>

            <Desktop />
          </div>
        </div>
        <Mobile />
      </nav>
      <ContactChatbox />
    </>
  );
}
