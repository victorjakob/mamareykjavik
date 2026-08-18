import { Fragment } from "react";

const COPY = {
  en: {
    tribeBefore: "Mama Tribe members enjoy",
    tribeHighlight: "20% off food & drinks",
    tribeAfter: "— from 2,000 ISK/month, cancel anytime.",
    tribeCta: "Join the Tribe →",
  },
  is: {
    tribeBefore: "Meðlimir í Mama Tribe fá",
    tribeHighlight: "20% afslátt af mat og drykk",
    tribeAfter: "— frá 2.000 kr á mánuði, hægt að segja upp hvenær sem er.",
    tribeCta: "Gakktu í Tribe →",
  },
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function formatPrice(price, isIS) {
  const n = Number(price);
  return isIS
    ? `${n.toLocaleString("is-IS")} kr`
    : `${n.toLocaleString("en-US")} ISK`;
}

function MenuItem({ item, isIS }) {
  return (
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
        {formatPrice(item.price, isIS)}
      </span>
    </div>
  );
}

function MenuCategory({ category, isIS }) {
  return (
    <section id={category.slug} className="mb-16 last:mb-0 scroll-mt-28">
      {/* Category header */}
      <div className="mb-8 text-center">
        <h2
          className="font-cormorant font-light italic text-[#1a1410] leading-none mb-4"
          style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)" }}
        >
          {category.name}
        </h2>

        {category.description && (
          <p className="text-[#6b5f54] text-sm font-light leading-relaxed max-w-md mx-auto mb-5">
            {category.description}
          </p>
        )}

        {/* Bottom ornament */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#1a1410]/14" />
          <div className="w-1 h-1 rounded-full bg-[#ff914d]/55" />
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#1a1410]/14" />
        </div>
      </div>

      {/* Items */}
      <div>
        {category.items.map((item) => (
          <MenuItem key={item.id} item={item} isIS={isIS} />
        ))}
      </div>
    </section>
  );
}

export default function FoodMenu({ menuData, locale = "en" }) {
  const { categories, menuItems } = menuData;
  const t = COPY[locale] ?? COPY.en;
  const isIS = locale === "is";

  /* Localise, then drop any category with nothing available in it. */
  const sections = categories
    .map((category) => {
      const items = menuItems
        .filter((item) => item.category_id === category.id)
        .map((item) => ({
          ...item,
          name: (isIS && item.name_is) || item.name,
          description: (isIS && item.description_is) || item.description,
        }));
      const name = (isIS && category.name_is) || category.name;
      return {
        id: category.id,
        name,
        slug: slugify(name || category.name),
        description: (isIS && category.description_is) || category.description,
        items,
      };
    })
    .filter((s) => s.items.length > 0);

  if (!sections.length) return null;

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
        {sections.map((section) => (
          <Fragment key={section.id}>
            <MenuCategory category={section} isIS={isIS} />
          </Fragment>
        ))}

        {/* Tribe cross-sell — the menu is where price sensitivity peaks,
            which is exactly when "20% off" earns its keep. */}
        <div className="mt-16 text-center border-t border-[#1a1410]/[0.1] pt-10">
          <p className="text-sm text-[#6b5f54] leading-relaxed">
            {t.tribeBefore}{" "}
            <span className="text-[#c45d18] font-medium">{t.tribeHighlight}</span>{" "}
            {t.tribeAfter}
          </p>
          <a
            href={isIS ? "/is/membership" : "/membership"}
            className="inline-block mt-2 text-sm text-[#b85a1c] underline underline-offset-4 hover:text-[#c45d18] transition-colors duration-200"
          >
            {t.tribeCta}
          </a>
        </div>
      </div>
    </div>
  );
}
