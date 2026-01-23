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

// Tours are temporarily disabled (no env var required).
// Flip to `true` when tours are back.
const TOURS_ENABLED = false;

// Supabase client setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const todayStartUtc = new Date();
    todayStartUtc.setUTCHours(0, 0, 0, 0);

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
      "/whitelotus/booking",
      "/whitelotus/rent",
      "/shop",
      "/shop/ceremonial-cacao",
      "/cacao-prep",
      "/policies",
      "/policies/terms",
      "/policies/privacy",
      "/policies/store",
      "/policies/tickets",
    ];

    // Icelandic (/is) exists ONLY for selected translated pages.
    // Do NOT add /is variants for English-only pages.
    const translatedStaticPaths = [
      "/about",
      "/events",
      "/contact",
      "/restaurant",
      "/restaurant/book-table",
      "/whitelotus",
      "/whitelotus/booking",
      "/whitelotus/rent",
      "/shop",
      "/shop/ceremonial-cacao",
      "/cacao-prep",
      "/policies",
      "/policies/terms",
      "/policies/privacy",
      "/policies/store",
    ];

    // Fetch dynamic event pages from Supabase with error handling
    const { data: events, error } = await supabase
      .from("events")
      .select("slug, date, created_at")
      .gte("date", todayStartUtc.toISOString())
      .order("date", { ascending: true });

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

    // Fetch dynamic tour pages (disabled unless TOURS_ENABLED)
    let tours = null;
    if (TOURS_ENABLED) {
      const { data } = await supabase
        .from("tours")
        .select("slug, created_at")
        .order("created_at", { ascending: false });
      tours = data;
    }

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
        if (!event.slug || !(event.date || event.created_at)) {
          console.warn("Invalid event data:", event);
          return "";
        }

        return `
      <url>
        <loc>${baseUrl}/events/${encodeURIComponent(event.slug)}</loc>
        <lastmod>${
          new Date(event.date || event.created_at)
            .toISOString()
            .split("T")[0]
        }</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>
    `;
      })
      .filter(Boolean); // Remove any empty strings

    const isEventPages = events
      .map((event) => {
        if (!event.slug || !(event.date || event.created_at)) return "";
        return `
      <url>
        <loc>${baseUrl}/is/events/${encodeURIComponent(event.slug)}</loc>
        <lastmod>${
          new Date(event.date || event.created_at)
            .toISOString()
            .split("T")[0]
        }</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>
    `;
      })
      .filter(Boolean);

    // Convert tours into URLs (disabled unless TOURS_ENABLED)
    const tourPages = TOURS_ENABLED
      ? tours
          ?.map((tour) => {
            if (!tour?.slug) return "";
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
          .filter(Boolean) || []
      : [];

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

    const isCategoryPages =
      categories
        ?.map((category) => {
          if (!category.slug) return "";
          return `
      <url>
        <loc>${baseUrl}/is/shop/${encodeURIComponent(category.slug)}</loc>
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

    const isProductPages =
      products
        ?.map((product) => {
          if (!product.slug || !product.category_slug) return "";
          return `
      <url>
        <loc>${baseUrl}/is/shop/${encodeURIComponent(
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
      ...translatedStaticPaths.map(
        (path) => `
      <url>
        <loc>${baseUrl}/is${path}</loc>
        <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
    `
      ),
      ...eventPages,
      ...isEventPages,
      ...tourPages,
      ...categoryPages,
      ...isCategoryPages,
      ...productPages,
      ...isProductPages,
    ];

    // Final safety filter: ensure no /tours URLs ever appear while disabled.
    const filteredUrls = TOURS_ENABLED
      ? urls
      : urls.filter((xml) => !/<loc>[^<]*\/tours(\/|<)/.test(xml));

    // Properly formatted XML response with validation
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${filteredUrls.join("\n")}
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
