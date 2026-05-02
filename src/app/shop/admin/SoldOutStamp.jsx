"use client";

/**
 * "Sold out" stamp rendered on top of the product image.
 *
 * Used on listing cards (ListCategories, ListProducts) and on the
 * single-product page so the unavailable state is unmistakable.
 *
 * The parent must give it a relatively-positioned ancestor — this is
 * absolutely positioned to fill its parent.
 */
export default function SoldOutStamp({ size = "md", language = "en" }) {
  const text = language === "is" ? "Uppselt" : "Sold Out";

  // tune for card vs detail-page image
  const fontSize =
    size === "sm"
      ? "clamp(0.9rem, 1.6vw, 1.1rem)"
      : size === "lg"
      ? "clamp(2rem, 4vw, 3.2rem)"
      : "clamp(1.2rem, 2.6vw, 1.8rem)";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
    >
      {/* dimming wash so the stamp reads on any image */}
      <div className="absolute inset-0 bg-[#1a1410]/35" />
      {/* the stamp itself — slight rotation, soft red, ribbon-style border */}
      <div
        className="relative -rotate-[8deg] border-[3px] border-[#c0392b]/85 bg-[#c0392b]/15 px-6 py-2 text-center font-serif italic text-[#fff5f0] backdrop-blur-[2px]"
        style={{
          fontSize,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          boxShadow:
            "0 0 0 1px rgba(192,57,43,0.25), 0 8px 30px rgba(26,20,16,0.35)",
        }}
      >
        {text}
      </div>
    </div>
  );
}
