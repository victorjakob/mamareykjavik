"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function MenuItem({ item, index }) {
  return (
    <FadeUp delay={index * 0.04}>
      <div className="flex items-start justify-between gap-6 py-5 border-b border-[#1a1410]/[0.1] group">
        <div className="flex-1 min-w-0">
          <h3 className="text-[#100c08] text-base font-semibold tracking-wide text-balance mb-1 group-hover:text-[#b85a1c] transition-colors duration-200">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-[#9c9188] text-sm leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          )}
        </div>
        <span className="text-[#c45d18] text-sm font-light tracking-wide shrink-0 pt-0.5">
          {item.price.toLocaleString()} ISK
        </span>
      </div>
    </FadeUp>
  );
}

function MenuCategory({ category, items, categoryIndex }) {
  return (
    <FadeUp delay={categoryIndex * 0.08} className="mb-16 last:mb-0">
      {/* Category header */}
      <div className="mb-8 text-center">
        {/* Flanked number pip */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#1a1410]/12" />
          <span className="text-[10px] uppercase tracking-[0.45em] text-[#c45d18]/85 font-mono">
            {String(categoryIndex + 1).padStart(2, "0")}
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#1a1410]/12" />
        </div>

        {/* Category name */}
        <h2
          className="font-cormorant font-light italic text-[#1a1410] leading-none mb-6"
          style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}
        >
          {category.name}
        </h2>

        {/* Bottom ornament */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#1a1410]/14" />
          <div className="w-1 h-1 rounded-full bg-[#ff914d]/55" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#1a1410]/14" />
        </div>
      </div>

      {/* Items */}
      <div>
        {items.map((item, i) => (
          <MenuItem key={item.id} item={item} index={i} />
        ))}
      </div>
    </FadeUp>
  );
}

export default function FoodMenu({ menuData }) {
  const { categories, menuItems } = menuData;

  return (
    <div className="relative w-full px-6 py-16 overflow-hidden">
      {/* Soft warm accents on cream */}
      <div className="absolute top-28 -left-32 w-[420px] h-[420px] rounded-full bg-[#ff914d]/[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute top-[42%] -right-24 w-[360px] h-[360px] rounded-full bg-[#ff914d]/[0.05] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-[520px] h-[280px] rounded-full bg-[#ff914d]/[0.04] blur-[90px] pointer-events-none" />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 75% at 50% 28%, rgba(255,145,77,0.06) 0%, transparent 68%)",
        }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <div className="relative max-w-2xl mx-auto">
        {categories.map((category, idx) => {
          const items = menuItems.filter(
            (item) => item.category_id === category.id
          );
          if (!items.length) return null;
          return (
            <MenuCategory
              key={category.id}
              category={category}
              items={items}
              categoryIndex={idx}
            />
          );
        })}
      </div>
    </div>
  );
}
