"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSupabase } from "@/lib/SupabaseProvider";
import Desktop from "./Navbar/Desktop";
import Mobile from "./Navbar/Mobile";

export default function Topbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, profile } = useSupabase();
  const menuRef = useRef(null);

  // Show loading state or render content
  if (loading) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-opacity-0 pointer-events-none">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-start">
          {/* Logo */}
          <Link href="/" className="pointer-events-auto">
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

          <Desktop user={user} profile={profile} />
          <Mobile
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            user={user}
            profile={profile}
            menuRef={menuRef}
          />
        </div>
      </div>
    </nav>
  );
}
