"use client";

/**
 * DarkBackground
 * Standard dark page / section background: warm brown-black #1e1a15
 * with subtle orange ambient blobs + grain texture.
 * The dark counterpart to PageBackground.
 *
 * Two modes:
 *   fixed  (default) — fills the entire viewport behind the page, same as PageBackground.
 *                      Use on full dark pages.
 *   inset             — absolutely positioned inside its nearest `relative` ancestor.
 *                      Use inside a section/div that already controls its own size.
 *
 * Usage (full page):
 *   <div className="relative min-h-screen">
 *     <DarkBackground />
 *     ...content...
 *   </div>
 *
 * Usage (inside a section):
 *   <section className="relative overflow-hidden" style={{ background: "#1e1a15" }}>
 *     <DarkBackground mode="inset" />
 *     <div className="relative z-10">...content...</div>
 *   </section>
 */
export default function DarkBackground({ mode = "fixed" }) {
  const posClass = mode === "inset"
    ? "absolute inset-0 z-0 overflow-hidden pointer-events-none"
    : "fixed inset-0 -z-10 overflow-hidden pointer-events-none";

  return (
    <div aria-hidden="true" className={posClass} style={{ background: "#1e1a15" }}>

      {/* Blob top-left — warm amber ember */}
      <div
        className="absolute -top-16 -left-32 w-[500px] h-[420px] rounded-full"
        style={{ background: "rgba(255,145,77,0.06)", filter: "blur(140px)" }}
      />

      {/* Blob mid-right */}
      <div
        className="absolute top-[40%] -right-20 w-[380px] h-[380px] rounded-full"
        style={{ background: "rgba(255,145,77,0.04)", filter: "blur(120px)" }}
      />

      {/* Blob bottom-centre */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] rounded-full"
        style={{ background: "rgba(255,145,77,0.035)", filter: "blur(110px)" }}
      />

      {/* Central top radial wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,145,77,0.055) 0%, transparent 65%)",
        }}
      />

      {/* Subtle warm vignette on edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(10,7,4,0.35) 100%)",
        }}
      />

      {/* Grain / paper texture */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  );
}
