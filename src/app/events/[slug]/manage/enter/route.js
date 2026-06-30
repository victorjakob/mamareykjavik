import { NextResponse } from "next/server";
import {
  resolveEventAccess,
  eventCookieName,
  EVENT_COOKIE_MAX_AGE,
} from "@/lib/eventAccess";

export const dynamic = "force-dynamic";

// One-time exchange for the email link: validate ?k=<token>, drop a secure
// httpOnly cookie scoped to this event, then redirect to the clean URL so the
// token disappears from the address bar, history and any referrer.
export async function GET(req, { params }) {
  const { slug } = await params;
  const url = new URL(req.url);
  const k = url.searchParams.get("k");
  const clean = new URL(`/events/${slug}/manage`, url.origin);

  const access = await resolveEventAccess(slug, { queryToken: k });

  if (access.notFound) {
    clean.searchParams.set("denied", "notfound");
    return NextResponse.redirect(clean);
  }
  if (!access.allowed) {
    clean.searchParams.set("denied", "1");
    return NextResponse.redirect(clean);
  }

  const res = NextResponse.redirect(clean);

  // Only stash the cookie when access actually came via the token — a
  // logged-in host doesn't need it. The cookie holds the secret out of the
  // URL and is compared to the live token, so a reset revokes it instantly.
  if (access.mode === "token" && k) {
    res.cookies.set(eventCookieName(access.event.id), k, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: EVENT_COOKIE_MAX_AGE,
    });
  }

  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
