import Link from "next/link";
import { KeyRound, LogIn, CalendarSearch } from "lucide-react";

// Shown when the caller is neither a logged-in host/admin nor holding a valid
// token. Friendly, never leaks whether the event exists beyond the basics.
export default function ManageDenied({ reason = "auth", slug }) {
  const backTo = `/auth?callbackUrl=${encodeURIComponent(
    `/events/${slug || ""}/manage`
  )}`;

  const variants = {
    auth: {
      icon: LogIn,
      title: "Sign in to manage this event",
      body: "Use your host login — or just open the private link from your event email, which gets you straight in with no password.",
      href: backTo,
      cta: "Sign in",
    },
    denied: {
      icon: KeyRound,
      title: "This link isn't valid anymore",
      body: "The private link may have been reset. Ask whoever set up the event for a fresh link, or sign in with your host account.",
      href: backTo,
      cta: "Sign in instead",
    },
    notfound: {
      icon: CalendarSearch,
      title: "Event not found",
      body: "We couldn't find that event. The link may be mistyped, or the event may have been removed.",
      href: "/events",
      cta: "Browse events",
    },
  };

  const v = variants[reason] || variants.auth;
  const Icon = v.icon;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div
        className="w-full max-w-md rounded-2xl bg-white text-center px-8 py-10"
        style={{ border: "1.5px solid #f0e6d8", boxShadow: "0 2px 14px rgba(60,30,10,0.07)" }}
      >
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: "#fff3ea" }}
        >
          <Icon className="h-7 w-7" style={{ color: "#ff914d" }} strokeWidth={1.75} />
        </div>
        <h1 className="text-xl font-semibold" style={{ color: "#2c1810" }}>
          {v.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "#9a7a62" }}>
          {v.body}
        </p>
        <Link
          href={v.href}
          className="mt-6 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium"
          style={{ background: "#ff914d", color: "#fff", boxShadow: "0 2px 8px rgba(255,145,77,0.28)" }}
        >
          {v.cta}
        </Link>
      </div>
    </div>
  );
}
