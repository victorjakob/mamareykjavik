"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

const baseReviews = [
  {
    id: "cozy-vegan-lunch",
    title: "A cozy and delicious vegan lunch",
    quote:
      "We had lunch at Mama and it was absolutely delicious. In a city with very few vegan or vegetarian options, this place felt like a hidden gem. The atmosphere is cozy and calm, perfect for a relaxed lunch and to warm up while feeling at home. Meals were beautifully prepared and served quickly. We felt genuinely welcomed throughout our visit.",
    visit: "Feb 2026 • Couples",
  },
  {
    id: "amazing-people",
    title: "Amazing people, incredible food, 10/10!",
    quote:
      "Absolutely incredible. The team is wonderful and very friendly, and they have created a relaxing environment without making guests feel rushed. The food was delicious, fresh, all vegan and exceptional. We tried garlic naan, hummus with sourdough and the West African stew. Pricing felt fair for the area and portions were generous. First place we will revisit next time in Reykjavik.",
    visit: "Feb 2026 • Friends",
  },
  {
    id: "perfect-setting",
    title: "Delicious food in the perfect setting",
    quote:
      "The curries and stews here are just delicious. The West Africa dish was stunning and the cheesecake was excellent. Service and setting were also perfect. We returned again during our trip.",
    visit: "Feb 2026 • Couples",
  },
  {
    id: "great-vibes",
    title: "Delicious food and great vibes",
    quote:
      "This little gem is heavenly, from the calm vibe and friendly staff to the stews and naans full of flavor. The African stew was the winner for us. Recommended for anyone wanting a unique food experience.",
    visit: "Feb 2026 • Couples",
  },
  {
    id: "simply-amazing",
    title: "Simply Amazing Vegan Food",
    quote:
      "Mama Vegan Restaurant in Reykjavik deserves special recognition for excellent food and an outstanding vegan dining experience.",
    visit: "Feb 2026 • Friends",
  },
  {
    id: "gastronomic-universe",
    title: "Gastronomic Universe",
    quote:
      "This wasn't just a meal, it felt like a full gastronomic experience. Every detail was balanced and thoughtful. You can feel the respect for ingredients, the love for cooking, and the intention to create an experience. Service was warm, smiling and genuinely attentive. I left feeling grateful and amazed.",
    visit: "Feb 2026 • Friends",
  },
  {
    id: "went-back-three-times",
    title: "Went back three times!",
    quote:
      "Such a great spot. The entrance is not obvious at first, but once upstairs we were very impressed. Staff were lovely, atmosphere was cozy, and the food was fresh and delicious with generous portions. One of the best vegan restaurants I have found on my travels.",
    visit: "Jan 2026 • Couples",
  },
  {
    id: "best-vegan",
    title: "Best Vegan! From a meat eater.",
    quote:
      "Food was fantastic. We did not know it was vegan before arriving, but everything we tried was spectacular. Great service, fantastic atmosphere, and delicious food. Excellent quality and quantity for Iceland.",
    visit: "Oct 2025 • Couples",
  },
  {
    id: "gem-in-city",
    title: "A gem in the city",
    quote:
      "A lovely cozy restaurant tucked away from the main street. Strong plant-based menu, generous portions and friendly staff. A little gem and very reasonably priced for the city.",
    visit: "Jan 2026 • Family",
  },
  {
    id: "chili-must",
    title: "Chili here is a must, vegan or not!",
    quote:
      "The chili sin carne and dhal a la mama are divine. Very friendly atmosphere with delicious food to match.",
    visit: "Dec 2025 • Couples",
  },
];

const reviews = {
  en: baseReviews,
  is: baseReviews,
};

const translations = {
  en: {
    eyebrow: "TripAdvisor Reviews",
    title: "What Guests Love Most",
    subtitle:
      "A few of the kind words visitors share after dining with us.",
    cta: "See more reviews",
    previous: "Previous review",
    next: "Next review",
    readMore: "Read more",
    showLess: "Show less",
    sourceLabel: "TripAdvisor review",
  },
  is: {
    eyebrow: "TripAdvisor Umsagnir",
    title: "Það sem gestir elska mest",
    subtitle:
      "Nokkur hlý orð frá gestum sem hafa borðað hjá okkur.",
    cta: "Sjá fleiri umsagnir",
    previous: "Fyrri umsögn",
    next: "Næsta umsögn",
    readMore: "Lesa meira",
    showLess: "Sýna minna",
    sourceLabel: "TripAdvisor umsögn",
  },
};

const PREVIEW_CHARS = 260;

function Stars() {
  return (
    <div className="tracking-[0.2em] text-amber-500 text-sm sm:text-base" aria-label="5 stars">
      ★★★★★
    </div>
  );
}

function ReviewCard({ item, expanded, onToggle, labels }) {
  const longText = item.quote.length > PREVIEW_CHARS;
  const visibleQuote =
    longText && !expanded
      ? `${item.quote.slice(0, PREVIEW_CHARS).trimEnd()}...`
      : item.quote;

  return (
    <article className="group relative h-full rounded-2xl border border-white/[0.07] bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:bg-white/[0.07] hover:border-white/[0.12]">
      <Stars />
      <h3 className="mt-4 text-lg font-extrabold leading-snug text-[#f0ebe3] sm:text-[1.15rem]">
        {item.title}
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[#a09488]">&ldquo;{visibleQuote}&rdquo;</p>
      {longText ? (
        <button
          type="button"
          onClick={onToggle}
          className="mt-2 text-sm font-medium text-[#ff914d] underline-offset-2 hover:underline"
        >
          {expanded ? labels.showLess : labels.readMore}
        </button>
      ) : null}
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4 text-xs text-[#8a7e72]">
        <span className="font-medium text-[#c4b8aa]">{labels.sourceLabel}</span>
        <span>{item.visit}</span>
      </div>
    </article>
  );
}

export default function TripadvisorReviews() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  const list = reviews[language] || reviews.en;
  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [expandedMap, setExpandedMap] = useState({});

  const looped = useMemo(() => [...list, ...list, ...list], [list]);

  const getCardWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    return el.clientWidth / visibleCount;
  }, [visibleCount]);

  const jumpToMiddleBand = useCallback(() => {
    const el = scrollRef.current;
    const cardWidth = getCardWidth();
    if (!el || !cardWidth) return;
    el.scrollTo({ left: list.length * cardWidth, behavior: "auto" });
  }, [getCardWidth, list.length]);

  const scrollByStep = useCallback(
    (direction) => {
      const el = scrollRef.current;
      const cardWidth = getCardWidth();
      if (!el || !cardWidth) return;
      setExpandedMap({});
      el.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
    },
    [getCardWidth]
  );

  const next = useCallback(() => scrollByStep(1), [scrollByStep]);
  const prev = useCallback(() => scrollByStep(-1), [scrollByStep]);

  const goTo = useCallback(
    (targetIdx) => {
      const el = scrollRef.current;
      const cardWidth = getCardWidth();
      if (!el || !cardWidth) return;
      const currentAbsolute = Math.round(el.scrollLeft / cardWidth);
      const currentLogical = ((currentAbsolute % list.length) + list.length) % list.length;
      let delta = targetIdx - currentLogical;
      if (delta > list.length / 2) delta -= list.length;
      if (delta < -list.length / 2) delta += list.length;
      el.scrollBy({ left: delta * cardWidth, behavior: "smooth" });
    },
    [getCardWidth, list.length]
  );

  const toggleExpanded = useCallback((id) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  useEffect(() => {
    setExpandedMap({});
  }, [language]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const apply = () => setVisibleCount(media.matches ? 3 : 1);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    jumpToMiddleBand();
  }, [jumpToMiddleBand, language, visibleCount]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current;
      const cardWidth = getCardWidth();
      if (!el || !cardWidth) return;
      const totalBandWidth = list.length * cardWidth;
      const left = el.scrollLeft;
      if (left < totalBandWidth * 0.5) {
        el.scrollLeft = left + totalBandWidth;
      } else if (left > totalBandWidth * 2.5) {
        el.scrollLeft = left - totalBandWidth;
      }
      const absolute = Math.round(el.scrollLeft / cardWidth);
      const logical = ((absolute % list.length) + list.length) % list.length;
      setActiveIndex(logical);
    });
  }, [getCardWidth, list.length]);

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 md:py-32">

      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto mb-14 sm:mb-20 max-w-2xl text-center px-2 sm:px-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#ff914d]">
            {t.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-[#f0ebe3] sm:text-4xl md:text-[2.5rem] md:leading-tight">
            {t.title}
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-[#8a7e72] sm:text-base">
            {t.subtitle}
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={prev}
            aria-label={t.previous}
            className="absolute left-1 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/60 backdrop-blur-sm transition hover:bg-white/[0.12] hover:text-white active:scale-95 sm:left-2 md:-left-5"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t.next}
            className="absolute right-1 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/60 backdrop-blur-sm transition hover:bg-white/[0.12] hover:text-white active:scale-95 sm:right-2 md:-right-5"
          >
            →
          </button>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="mx-0 flex snap-x snap-mandatory gap-5 overflow-x-auto px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {looped.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="min-w-0 shrink-0 basis-full snap-start md:basis-[calc((100%-2.5rem)/3)]"
              >
                <ReviewCard
                  item={item}
                  expanded={!!expandedMap[item.id]}
                  onToggle={() => toggleExpanded(item.id)}
                  labels={t}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {list.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                type="button"
                onClick={() => goTo(idx)}
                aria-label={`Go to review ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  activeIndex === idx ? "w-6 bg-[#ff914d]" : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-[#8a7e72] md:hidden">
            Swipe left or right to browse reviews
          </p>
        </div>

        <div className="mt-12 sm:mt-14 text-center">
          <a
            href={language === "is" ? "/is/reviews" : "/reviews"}
            className="inline-flex items-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-[#f0ebe3] transition hover:bg-white/[0.06]"
          >
            {t.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
