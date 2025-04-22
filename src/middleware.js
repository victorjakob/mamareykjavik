import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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

  // Check authentication using NextAuth
  const token = await getToken({ req });

  // If accessing protected route and not authenticated, redirect to login
  if (
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/profile")
  ) {
    if (!token) {
      const returnUrl = encodeURIComponent(req.nextUrl.pathname);
      return NextResponse.redirect(
        new URL(`/auth?callbackUrl=${returnUrl}`, req.url)
      );
    }
  }

  return res;
}

// Apply middleware to protect certain routes
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"], // Combined matchers
};
