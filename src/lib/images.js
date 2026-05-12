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

// ─── The Private Space ────────────────────────────────────────────────────────
// Cloudinary folder: Healing-Space (display folder only — public_ids are bare
// filenames with no folder prefix in the URL path, since these were uploaded
// under Cloudinary's new "asset folder" system).
//
// Two landscape images for hero/banner; six portrait images for gallery;
// one vertical phone-shot video.

// Hero / banner (landscape orientations)
export const PRIVATE_SPACE_HERO = `${CDN}/f_auto,q_auto,w_1920/IMG_5693_wjdmqj.jpg`;
export const PRIVATE_SPACE_BANNER = `${CDN}/f_auto,q_auto,w_1600/IMG_5694_o5qvyg.jpg`;
export const PRIVATE_SPACE_BANNER_OG = `${CDN}/w_1200,h_630,c_fill,q_auto,f_auto/IMG_5694_o5qvyg.jpg`;
export const PRIVATE_SPACE_HOMEPAGE_CARD = `${CDN}/f_auto,q_auto,w_1200,h_1200,c_fill,g_auto/IMG_5694_o5qvyg.jpg`;

// Gallery (portrait orientations)
export const PRIVATE_SPACE_GALLERY = [
  `${CDN}/f_auto,q_auto,w_1200/IMG_5687_uhusuk.jpg`,
  `${CDN}/f_auto,q_auto,w_1200/IMG_5688_beh9rb.jpg`,
  `${CDN}/f_auto,q_auto,w_1200/IMG_5689_uz0yaq.jpg`,
  `${CDN}/f_auto,q_auto,w_1200/IMG_5690_hiupnn.jpg`,
  `${CDN}/f_auto,q_auto,w_1200/IMG_5691_hs2nlt.jpg`,
  `${CDN}/f_auto,q_auto,w_1200/IMG_5692_cwlors.jpg`,
];

// Vertical phone-shot video (5.6s loop, 1080x1920). Original is .mov;
// Cloudinary auto-transcodes to mp4/webm via the f_<format> transformation.
const VIDEO_CDN = "https://res.cloudinary.com/dy8q4hf0k/video/upload";
export const PRIVATE_SPACE_VIDEO_MP4 = `${VIDEO_CDN}/q_auto,f_mp4,w_720/IMG_5695_gf7elb.mp4`;
export const PRIVATE_SPACE_VIDEO_WEBM = `${VIDEO_CDN}/q_auto,f_webm,w_720/IMG_5695_gf7elb.webm`;
export const PRIVATE_SPACE_VIDEO_POSTER = `${VIDEO_CDN}/so_0,f_jpg,q_auto,w_720/IMG_5695_gf7elb.jpg`;
