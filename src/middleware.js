import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const hostname = req.headers.get("host");

  // Handle domain-specific redirects
  if (hostname === "whitelotus.is") {
    return NextResponse.redirect(new URL("/events", req.url));
  }
  if (hostname === "mamareykjavik.is") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If accessing protected route and not authenticated, redirect to login
  if (
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/profile")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }
  }

  return res;
}

// Apply middleware to protect certain routes
export const config = {
  matcher: ["/:path*", "/admin/:path*", "/profile/:path*"], // Combined matchers
};
