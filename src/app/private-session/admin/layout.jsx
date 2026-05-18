// Admin chrome for /private-session/admin/*. Auth-gated: non-admins 404,
// per spec ("do not show a login prompt at these URLs").
//
// Top nav stays simple — Today / Practitioners — and now sits centered as a
// pill row. Sub-pages carry their own contextual headers, so the previous
// "Private sessions / Admin" title block was removed to avoid duplication.

import { notFound } from "next/navigation";
import Link from "next/link";

import { isAdmin } from "@/util/getRole";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Private Sessions · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  if (!(await isAdmin())) notFound();

  // Top padding has to clear the global DarkNavbar AND its logo, which
  // visually hangs below the 76px bar (up to ~164px on lg).
  return (
    <div className="min-h-screen bg-[#0d0b09]">
      <header data-navbar-theme="dark" className="bg-[#0d0b09] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 md:pt-36 lg:pt-44 pb-6">
          <nav
            aria-label="Private sessions admin"
            className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-[11px] uppercase tracking-[0.22em]"
          >
            <AdminNavLink href="/private-session/admin">Sessions</AdminNavLink>
            <AdminNavLink href="/private-session/admin/practitioners">
              Practitioners
            </AdminNavLink>
            <Link
              href="/private-session"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/15 text-[#d8cfc1] hover:bg-white/[0.06] hover:border-[#ff914d]/40 hover:text-[#f0ebe3] transition-colors duration-200"
            >
              View public
              <span aria-hidden>→</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">{children}</main>
    </div>
  );
}

function AdminNavLink({ href, children }) {
  // Pill style — clearly clickable. No server-side pathname so no active
  // styling; sub-pages carry their own context header instead.
  return (
    <Link
      href={href}
      className="inline-flex items-center px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#d8cfc1] hover:bg-[#ff914d]/15 hover:border-[#ff914d]/40 hover:text-[#f0ebe3] transition-colors duration-200"
    >
      {children}
    </Link>
  );
}
