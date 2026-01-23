import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req) {
  const pathname = req.nextUrl.pathname;
  const hostname = req.headers.get("host");

  // Locale is URL-based:
  // - English: /
  // - Icelandic: /is/...
  const locale = pathname === "/is" || pathname.startsWith("/is/") ? "is" : "en";

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", locale);

  // Handle domain-specific redirects
  if (hostname === "whitelotus.is") {
    return NextResponse.redirect(new URL("/events", req.url));
  }
  if (hostname === "mamareykjavik.is") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If accessing protected route and not authenticated, redirect to login
  if (pathname.startsWith("/admin") || pathname.startsWith("/profile")) {
    // Check authentication using NextAuth (only for protected routes)
    const token = await getToken({ req });
    if (!token) {
      const returnUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/auth?callbackUrl=${returnUrl}`, req.url)
      );
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Apply proxy to all pages (not API/static assets) so RootLayout can read x-locale.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|site.webmanifest|.*\\..*).*)",
  ],
};
