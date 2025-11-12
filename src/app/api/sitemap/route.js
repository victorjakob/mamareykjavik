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
      "/restaurant",
      "/restaurant/menu",
      "/restaurant/book-table",
      "/brand",
      "/collaborations",
      "/whitelotus",
      "/whitelotus/rent",
      "/shop",
      "/shop/ceremonial-cacao",
      "/cacao-prep",
      "/tours",
      "/policies",
      "/policies/terms",
      "/policies/privacy",
      "/policies/store",
      "/policies/tickets",
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

    // Fetch dynamic tour pages
    const { data: tours } = await supabase
      .from("tours")
      .select("slug, created_at")
      .order("created_at", { ascending: false });

    // Fetch shop categories and products
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .order("updated_at", { ascending: false });

    const { data: products } = await supabase
      .from("products")
      .select("slug, category_slug, updated_at")
      .order("updated_at", { ascending: false });

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

    // Convert tours into URLs
    const tourPages =
      tours
        ?.map((tour) => {
          if (!tour.slug) return "";
          return `
      <url>
        <loc>${baseUrl}/tours/${encodeURIComponent(tour.slug)}</loc>
        <lastmod>${
          new Date(tour.created_at).toISOString().split("T")[0]
        }</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
      </url>
    `;
        })
        .filter(Boolean) || [];

    // Convert categories into URLs
    const categoryPages =
      categories
        ?.map((category) => {
          if (!category.slug) return "";
          return `
      <url>
        <loc>${baseUrl}/shop/${encodeURIComponent(category.slug)}</loc>
        <lastmod>${
          new Date(category.updated_at).toISOString().split("T")[0]
        }</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
      </url>
    `;
        })
        .filter(Boolean) || [];

    // Convert products into URLs
    const productPages =
      products
        ?.map((product) => {
          if (!product.slug || !product.category_slug) return "";
          return `
      <url>
        <loc>${baseUrl}/shop/${encodeURIComponent(
          product.category_slug
        )}/${encodeURIComponent(product.slug)}</loc>
        <lastmod>${
          new Date(product.updated_at).toISOString().split("T")[0]
        }</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
      </url>
    `;
        })
        .filter(Boolean) || [];

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
      ...tourPages,
      ...categoryPages,
      ...productPages,
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
