"use client";

import { usePathname } from "next/navigation";
import ProfileHero from "@/app/profile/components/ProfileHero";
import PageBackground from "@/app/components/ui/PageBackground";

export default function EventManagerShell({ children }) {
  const pathname = usePathname() || "";
  // The Gatekeeper is a tablet kiosk — it needs a full-bleed, chrome-less
  // surface, so we skip the shell's hero + background on those routes.
  const isKiosk = /\/events\/manager\/[^/]+\/gatekeeper(\/|$)/.test(pathname);

  if (isKiosk) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen relative" data-navbar-theme="light">
      <PageBackground />
      <ProfileHero
        compact
        eyebrow="Host tools"
        title="Event manager"
        subtitle="Your events & promo codes"
      />
      <div className="relative z-10 pt-2">
        {children}
      </div>
    </div>
  );
}
