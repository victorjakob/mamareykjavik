import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Validate required environment variables
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  !process.env.NEXT_PUBLIC_BASE_URL
) {
  throw new Error("Required environment variables are not set");
}

// Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Static paths (pages that don't change)
    const staticPaths = [
      "/",
      "/about",
      "/events",
      "/contact",
      "/restaurant/menu",
      "/restaurant/book-table",
    ];

    // Fetch dynamic event pages from Supabase with error handling
    const { data: events, error } = await supabase
      .from("events")
      .select("slug, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return NextResponse.json(
        { error: "Failed to fetch events from database" },
        { status: 500 }
      );
    }

    if (!events) {
      console.error("No events data received");
      return NextResponse.json(
        { error: "No events data received from database" },
        { status: 500 }
      );
    }

    // Convert events into URLs for sitemap with input sanitization
    const eventPages = events
      .map((event) => {
        if (!event.slug || !event.created_at) {
          console.warn("Invalid event data:", event);
          return "";
        }

        return `
      <url>
        <loc>${baseUrl}/events/${encodeURIComponent(event.slug)}</loc>
        <lastmod>${
          new Date(event.created_at).toISOString().split("T")[0]
        }</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>
    `;
      })
      .filter(Boolean); // Remove any empty strings

    // Combine static + dynamic pages
    const urls = [
      ...staticPaths.map(
        (path) => `
      <url>
        <loc>${baseUrl}${path}</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>${path === "/" ? "1.0" : "0.8"}</priority>
      </url>
    `
      ),
      ...eventPages,
    ];

    // Properly formatted XML response with validation
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.join("\n")}
    </urlset>`;

    // Validate XML structure
    if (!sitemap.includes("<?xml") || !sitemap.includes("</urlset>")) {
      throw new Error("Invalid XML structure generated");
    }

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=21600, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate sitemap" },
      { status: 500 }
    );
  }
}
