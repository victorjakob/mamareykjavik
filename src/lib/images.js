/**
 * Central image URL constants for Mama Reykjavik.
 *
 * All brand-critical images live on Cloudinary — permanent URLs with no
 * expiry tokens, automatic format/quality optimisation, and global CDN delivery.
 *
 * OG variants are pre-transformed to 1200×630 (the required Open Graph size)
 * with auto quality and format. Use these for all metadata/social sharing.
 *
 * To update an image: re-upload to Cloudinary and change the constant here.
 * The update propagates everywhere automatically.
 */

const CDN = "https://res.cloudinary.com/dy8q4hf0k/image/upload";

// ─── Mama Restaurant Banner ───────────────────────────────────────────────────
export const MAMA_BANNER = `${CDN}/mama-reykjavik/mamabanner.jpg`;
export const MAMA_BANNER_OG = `${CDN}/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg`;

// ─── White Lotus Banner ───────────────────────────────────────────────────────
export const WHITE_LOTUS_BANNER = `${CDN}/mama-reykjavik/whitelotusbanner.jpg`;
export const WHITE_LOTUS_BANNER_OG = `${CDN}/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/whitelotusbanner.jpg`;
