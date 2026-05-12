// Admin chrome for /private-session/admin/*. Auth-gated: non-admins 404,
// per spec ("do not show a login prompt at these URLs").
//
// Top nav stays simple — Today / Practitioners. Booking and waitlist
// screens are linked from inside the data pages.

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

  return (
    <div className="min-h-screen bg-[#0d0b09]">
      <header data-navbar-theme="dark" className="sticky top-0 z-30 bg-[#0d0b09]/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d] mb-1">
                Private sessions
              </div>
              <h1 className="font-cormorant text-3xl md:text-4xl italic text-[#f0ebe3]">
                Admin
              </h1>
            </div>
            <nav className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em]">
              <AdminNavLink href="/private-session/admin">Today</AdminNavLink>
              <AdminNavLink href="/private-session/admin/practitioners">
                Practitioners
              </AdminNavLink>
              <Link
                href="/private-session"
                className="ml-2 px-3 py-2 text-[#a09488] hover:text-[#f0ebe3] transition border-l border-white/[0.08] pl-4"
              >
                View public →
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">{children}</main>
    </div>
  );
}

function AdminNavLink({ href, children }) {
  // No active state tracking — Next can't tell us pathname server-side in this
  // layout without a client wrapper. Keep it simple; visual states live on the
  // page itself if needed.
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-md text-[#d8cfc1] hover:text-[#f0ebe3] hover:bg-white/[0.04] transition"
    >
      {children}
    </Link>
  );
}
