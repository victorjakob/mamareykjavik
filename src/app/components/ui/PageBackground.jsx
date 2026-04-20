"use client";

/**
 * PageBackground
 * Standard cream page background with soft orange ambient blobs + grain texture.
 * Same treatment as the menu page (FoodMenu.jsx).
 *
 * Usage: drop <PageBackground /> as the first child inside any page wrapper.
 * The parent just needs `position: relative` (or `className="relative"`).
 */
export default function PageBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: "#f9f4ec" }}
    >
      {/* Blob top-left */}
      <div
        className="absolute -top-10 -left-40 w-[560px] h-[560px] rounded-full"
        style={{ background: "rgba(255,145,77,0.07)", filter: "blur(130px)" }}
      />

      {/* Blob mid-right */}
      <div
        className="absolute top-[45%] -right-28 w-[440px] h-[440px] rounded-full"
        style={{ background: "rgba(255,145,77,0.05)", filter: "blur(110px)" }}
      />

      {/* Blob bottom-centre */}
      <div
        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[580px] h-[300px] rounded-full"
        style={{ background: "rgba(255,145,77,0.04)", filter: "blur(100px)" }}
      />

      {/* Central top radial wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 45% at 50% 0%, rgba(255,145,77,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Grain / paper texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  );
}
