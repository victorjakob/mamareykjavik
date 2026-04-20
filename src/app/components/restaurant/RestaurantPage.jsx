"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  Phone,
  MapPin,
  Navigation,
  Clock,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Calendar,
  Car,
  Footprints,
} from "lucide-react";
import TripadvisorReviews from "@/app/restaurant/TripadvisorReviews";
import DarkBackground from "@/app/components/ui/DarkBackground";
import { useLanguage } from "@/hooks/useLanguage";
import { localizeHref } from "@/lib/i18n-routing";

// ── Images ─────────────────────────────────────────────────────────────────────
const IMG_DAHL =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1762326608/dahl_aumxpm.jpg";
const IMG_RED_STEW =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/f_auto,q_auto/v1776004115/red-stew-bowl-nachos_s6n99l.png";
const VIDEO_SRC =
  "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FMama%20Restaurant%202.mp4?alt=media&token=11269e99-5406-46d2-a5cb-3ff59107d0c7";

const GALLERY = [
  { src: "/mamaimg/mamavibe1.jpg", alt: "Inside Mama Reykjavik" },
  { src: "/mamaimg/mamacoffee.jpg", alt: "Cacao & coffee at Mama" },
  { src: "/mamaimg/mamavibe2.jpeg", alt: "Mama Restaurant atmosphere" },
  { src: "/mamaimg/mamadahl.jpg", alt: "Dhal a la Mama" },
];

// ── Booking & delivery links (reused across sections) ─────────────────────────
const BOOK_URL = "https://www.dineout.is/mamareykjavik?isolation=true";
const WOLT_URL = "https://wolt.com/is/isl/reykjavik/restaurant/mama-reykjavik";
const TEL_NUM = "+3547666262";
const TEL_DISPLAY = "+354 766 6262";
const MAPS_URL = "https://maps.google.com/?q=Bankastr%C3%A6ti+2,+101+Reykjavik";
const MAPS_EMBED =
  "https://www.google.com/maps?q=Bankastr%C3%A6ti%202,%20101%20Reykjav%C3%ADk&output=embed";

// ── Open-now logic (client-side, Reykjavik TZ) ────────────────────────────────
const OPEN_MIN = 11 * 60 + 30; // 11:30
const CLOSE_MIN = 21 * 60; // 21:00

function getReykjavikMinutes() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Atlantic/Reykjavik",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(now)
    .reduce((a, p) => ((a[p.type] = p.value), a), {});
  const h = parseInt(parts.hour, 10);
  const m = parseInt(parts.minute, 10);
  return h * 60 + m;
}

function useOpenStatus(lang) {
  const [status, setStatus] = useState(null); // null until hydrated
  useEffect(() => {
    const tick = () => {
      const mins = getReykjavikMinutes();
      const isOpen = mins >= OPEN_MIN && mins < CLOSE_MIN;
      const minsToClose = CLOSE_MIN - mins;

      let label;
      if (isOpen && minsToClose <= 60 && minsToClose > 0) {
        label =
          lang === "is" ? "Opið · Lokar kl. 21:00" : "Open · Closes at 21:00";
      } else if (isOpen) {
        label =
          lang === "is" ? "Opið núna · til 21:00" : "Open now · until 21:00";
      } else {
        label =
          lang === "is" ? "Lokað · Opnar kl. 11:30" : "Closed · Opens at 11:30";
      }
      setStatus({ open: isOpen, label });
    };
    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, [lang]);
  return status;
}

// ── Content ────────────────────────────────────────────────────────────────────
const CONTENT = {
  en: {
    seoTitle:
      "Mama Reykjavik Restaurant — 100% Plant-Based World-Inspired Cuisine in Iceland",
    hero: {
      eyebrow: "Bankastræti 2 · Reykjavík",
      title: "Food for the soul",
      sublineTop: "100% Plant-based",
      sublineBottom: "Open daily 11:30 – 21:00",
      primaryCta: "Book a table",
      secondaryCta: "See menu",
    },
    trust: {
      items: [
        { icon: "star", top: "4.9 / 5", bottom: "400+ Google reviews" },
        {
          icon: "tripadvisor",
          top: "Top 4 of 504",
          bottom: "TripAdvisor · Reykjavík",
        },
        {
          icon: "plant",
          top: "100% Plant-Based",
          bottom: "GF & nut-free options",
        },
        {
          icon: "heart",
          top: "Since 2020",
          bottom: "Family-run · Community-first",
        },
      ],
    },
    kitchen: {
      eyebrow: "Our kitchen",
      titleTop: "Food from everywhere.",
      titleBottom: "Made for everyone.",
      body: "We cook from the roots — India, West Africa, Mexico, South Asia. Every bowl is slow-made, whole-food, and 100% plant-based. Not because it's trendy. Because we believe food is medicine.",
      origins: ["India", "West Africa", "Mexico", "South Asia", "Middle East"],
    },
    featuredDishes: [
      {
        name: "Dhal a la Mama",
        origin: "India",
        img: IMG_DAHL,
        description:
          "Our founding dish. Red lentils slow-simmered with our special dahl spice mix — recommended with warm garlic naan straight from the kitchen.",
      },
      {
        name: "West Africa Stew",
        origin: "West Africa",
        img: IMG_RED_STEW,
        description:
          "A family recipe from Guinea. Rich sweet potato and peanut stew — hearty, soulful, and full of history.",
      },
    ],
    featuredMenuCta: "Full menu",
    alsoOnTable: {
      eyebrow: "On the menu",
      title: "A taste of the table",
      subtitle: "Six favourites from our kitchen. Full menu has 30+ dishes.",
      dishes: [
        {
          name: "Mama Curry",
          origin: "South Asia",
          note: "Golden coconut. Aromatics. Sunshine in a bowl.",
          tags: ["GF", "NF"],
        },
        {
          name: "Chilli Sin Carne",
          origin: "Mexico",
          note: "Smoky fire and dark chocolate depth.",
          tags: ["GF", "SPICY"],
        },
        {
          name: "Garlic Naan",
          origin: "Homemade",
          note: "Fire-baked. Chewy. Simple perfection.",
          tags: ["NF"],
        },
        {
          name: "Ceremonial Cacao",
          origin: "Sacred",
          note: "Ancient, heart-opening, central to everything.",
          tags: ["GF", "RAW"],
        },
        {
          name: "Soup of the Day",
          origin: "World",
          note: "Seasonal, slow-cooked, always a surprise.",
          tags: ["GF"],
        },
        {
          name: "Hummus & Bread",
          origin: "Middle East",
          note: "Silky smooth. Served with fresh sourdough.",
          tags: ["NF"],
        },
      ],
      cta: "See full menu",
      legend: {
        GF: "Gluten-free",
        NF: "Nut-free",
        SPICY: "Spicy",
        RAW: "Raw",
      },
    },
    ways: {
      eyebrow: "Find your way in",
      title: "More Ways to Enjoy Mama",
      dineIn: {
        eyebrow: "In the restaurant",
        title: "Dine In",
        body: "Come as you are. Sit, slow down, let us feed you. Open every day, 11:30 – 21:00.",
        cta: "Book a table",
      },
      delivery: {
        eyebrow: "Can't make it in?",
        title: "Deliver to your home",
        body: "Hot, fresh, and full of love — delivered straight to your door. The same kitchen, wherever you are in Reykjavík.",
        cta: "Order now on Wolt",
      },
      catering: {
        eyebrow: "Catering & B2B",
        title: "Bring Mama\nto Your Event",
        body: "Corporate lunches, private gatherings, wellness retreats. We bring the meal to you.",
        priceHint:
          "Corporate lunches from 3,000 kr / head · min. 10 portions · 1 week notice",
        cta: "Explore catering",
      },
    },
    visit: {
      eyebrow: "Visit us",
      titleTop: "Bankastræti 2,",
      titleBottom: "101 Reykjavík",
      hoursLabel: "Open daily",
      hours: "11:30 – 21:00",
      callLabel: "Call us",
      directionsLabel: "Get directions",
      mapAria: "Map showing Mama Reykjavik at Bankastræti 2",
      walk: {
        title: "A short walk from",
        items: [
          { from: "Laugavegur", mins: "1 min" },
          { from: "Hallgrímskirkja", mins: "10 min" },
          { from: "Harpa", mins: "10 min" },
          { from: "Hlemmur", mins: "12 min" },
        ],
      },
      logistics: [
        {
          icon: "car",
          label: "Paid street parking on Bankastræti · garage 2 min away",
        },
      ],
      primaryCta: "Book a table",
      secondaryCta: "See full menu",
    },
    faq: {
      eyebrow: "Good to know",
      title: "Questions people ask",
      subtitle: "Everything you might want to know before you come in.",
      items: [
        {
          q: "Is Mama Reykjavik fully vegan?",
          a: "Yes — 100% plant-based. No meat, no fish, no dairy, no eggs. Ever. Everything on our menu is made from whole, plant-based ingredients prepared fresh in our kitchen.",
        },
        {
          q: "Do you have gluten-free and nut-free options?",
          a: "Yes. Most of our curries, stews, soups and hummus are naturally gluten-free, and we mark all allergens clearly on the menu. Many dishes are nut-free — just let the team know and we'll guide you.",
        },
        {
          q: "Do I need to book a table?",
          a: "Walk-ins are always welcome. That said, during peak tourist season (June–August) and weekends we strongly recommend booking — especially for groups of 4 or more. Reserve online via Dineout in about 30 seconds.",
        },
        {
          q: "Where exactly are you?",
          a: "Bankastræti 2, 101 Reykjavík, walk in the port right at the start of Laugavegur and find the entrance — in the heart of downtown. It's a 1-minute walk from the main shopping street and 10 minutes from Harpa or Hallgrímskirkja.",
        },
        {
          q: "What are your opening hours?",
          a: "Open every day, 11:30 to 21:00. Last orders around 20:30. Lunch, dinner, tea, cacao — come whenever feels right.",
        },
        {
          q: "Do you deliver?",
          a: "Yes — order via Wolt for delivery anywhere in Reykjavík. Same kitchen, same recipes, warm and ready in ~30 minutes.",
        },
        {
          q: "Can you cater my event or office lunch?",
          a: "Absolutely. We cater corporate lunches, private gatherings, wellness retreats and birthdays. Minimum 10 portions, 1 week notice. Corporate lunches start from 3,000 kr per head. Get in touch via our catering page.",
        },
        {
          q: "Is it suitable for kids and families?",
          a: "Completely. Our space is warm and relaxed, portions are generous, and kids tend to love the naan, hummus, soup and mild curries. High chairs available on request.",
        },
      ],
    },
    sticky: {
      book: "Book",
      call: "Call",
      map: "Map",
      wolt: "Wolt",
    },
  },
  is: {
    seoTitle: "Mama Reykjavík — Sálarríkur matur og 100% plöntubasað eldhús",
    hero: {
      eyebrow: "Bankastræti 2 · Reykjavík",
      title: "Matur fyrir sálina",
      sublineTop: "100% plöntubasað",
      sublineBottom: "Opið alla daga 11:30 – 21:00",
      primaryCta: "Bóka borð",
      secondaryCta: "Skoða matseðil",
    },
    trust: {
      items: [
        { icon: "star", top: "4.9 / 5", bottom: "400+ Google umsagnir" },
        {
          icon: "tripadvisor",
          top: "Topp 4 af 504",
          bottom: "TripAdvisor · Reykjavík",
        },
        {
          icon: "plant",
          top: "100% plöntubasað",
          bottom: "Glútein- & hnetufríir valmöguleikar",
        },
        {
          icon: "heart",
          top: "Síðan 2020",
          bottom: "Fjölskyldurekið · Samfélagshugsun",
        },
      ],
    },
    kitchen: {
      eyebrow: "Eldhúsið okkar",
      titleTop: "Matur alls staðar að úr heiminum.",
      titleBottom: "Gerður fyrir alla.",
      body: "Við eldum frá rótunum — Indlandi, Vestur-Afríku, Mexíkó og Suður-Asíu. Hver skál er hægelduð, úr heilu hráefni og 100% plöntubasað. Ekki af því að það sé trend. Heldur af því að við trúum að matur hafi heilunar-eiginleika.",
      origins: [
        "Indland",
        "Vestur-Afríka",
        "Mexíkó",
        "Suður-Asía",
        "Mið-Austurlönd",
      ],
    },
    featuredDishes: [
      {
        name: "Dhal a la Mama",
        origin: "Indland",
        img: IMG_DAHL,
        description:
          "Rétturinn sem byrjaði allt. Rauðar linsubaunir hægeldaðar með okkar eigin dhal kryddblöndu — mælum með heitu hvítlauks-naan beint úr eldhúsinu.",
      },
      {
        name: "West Africa Stew",
        origin: "Vestur-Afríka",
        img: IMG_RED_STEW,
        description:
          "Fjölskylduuppskrift frá Gíneu. Sæt kartafla og hnetusósa — djúp, nærandi og full af sögu.",
      },
    ],
    featuredMenuCta: "Allur matseðill",
    alsoOnTable: {
      eyebrow: "Á matseðlinum",
      title: "Smakk af borðinu",
      subtitle:
        "Sex uppáhaldsréttir frá eldhúsinu. Á matseðlinum eru 30+ réttir.",
      dishes: [
        {
          name: "Mama Curry",
          origin: "Suður-Asía",
          note: "Kókos, krydd og hlýja í einni skál.",
          tags: ["GF", "NF"],
        },
        {
          name: "Chilli Sin Carne",
          origin: "Mexíkó",
          note: "Reykt bragð, smá hiti og djúp fylling.",
          tags: ["GF", "SPICY"],
        },
        {
          name: "Hvítlauks-naan",
          origin: "Heimabakað",
          note: "Bakað í hita. Mjúkt og einfalt — fullkomið.",
          tags: ["NF"],
        },
        {
          name: "Ceremonial kakó",
          origin: "Helgt",
          note: "Forn, hjartaopnandi drykkur — miðpunktur samverunnar.",
          tags: ["GF", "RAW"],
        },
        {
          name: "Súpa dagsins",
          origin: "Alþjóðlegt",
          note: "Árstíðabundin, hægelduð, alltaf eitthvað nýtt.",
          tags: ["GF"],
        },
        {
          name: "Hummus & brauð",
          origin: "Mið-Austurlönd",
          note: "Silkimjúkt hummus borið fram með fersku súrdeigsbrauði.",
          tags: ["NF"],
        },
      ],
      cta: "Allur matseðill",
      legend: {
        GF: "Glútenfrítt",
        NF: "Hnetulaust",
        SPICY: "Sterkt",
        RAW: "Hrátt",
      },
    },
    ways: {
      eyebrow: "Finndu þína leið inn",
      title: "Fleiri leiðir til að njóta Mama",
      dineIn: {
        eyebrow: "Borða á staðnum",
        title: "Borða á staðnum",
        body: "Komdu eins og þú ert. Sestu niður, hægðu á og leyfðu okkur að sjá um þig. Opið alla daga 11:30 – 21:00",
        cta: "Bóka borð",
      },
      delivery: {
        eyebrow: "Kemst þú ekki?",
        title: "Heimsending",
        body: "Heitt, ferskt og gert af ást — beint heim til þín. Sama eldhús, hvar sem þú ert í Reykjavík.",
        cta: "Panta á Wolt",
      },
      catering: {
        eyebrow: "Catering & B2B",
        title: "Fáðu Mama\ntil þín",
        body: "Fyrirtækjahádegismatur, einkasamkomur, retreat. Við komum með matinn til þín.",
        priceHint:
          "Fyrirtækjahádegismatur frá 3.000 kr / mann · lágm. 10 skammtar · 1 vika fyrirvara",
        cta: "Skoða catering",
      },
    },
    visit: {
      eyebrow: "Heimsækja okkur",
      titleTop: "Bankastræti 2",
      titleBottom: "101 Reykjavík",
      hoursLabel: "Opið alla daga",
      hours: "11:30 – 21:00",
      callLabel: "Hringdu",
      directionsLabel: "Sjá leiðarlýsingu",
      mapAria: "Kort sem sýnir Mama Reykjavík á Bankastræti 2",
      walk: {
        title: "Stutt ganga frá",
        items: [
          { from: "Laugavegi", mins: "1 mín" },
          { from: "Hallgrímskirkju", mins: "10 mín" },
          { from: "Hörpu", mins: "10 mín" },
          { from: "Hlemmi", mins: "12 mín" },
        ],
      },
      logistics: [
        {
          icon: "car",
          label: "Gjaldskyld bílastæði á Bankastræti · bílastæðahús 2 mín burt",
        },
      ],
      primaryCta: "Bóka borð",
      secondaryCta: "Skoða allan matseðil",
    },
    faq: {
      eyebrow: "Gott að vita",
      title: "Algengar spurningar",
      subtitle: "Allt sem gott er að vita áður en þú kemur.",
      items: [
        {
          q: "Er Mama Reykjavík 100% vegan?",
          a: "Já — 100% plöntubasað. Ekkert kjöt, fiskur, mjólkurvörur eða egg. Aldrei. Allt á matseðlinum er úr heilu hráefni og eldað ferskt í eldhúsinu okkar.",
        },
        {
          q: "Eru til glútenfríar og hnetulausar útgáfur?",
          a: "Já. Flest karrýin okkar, súpur og hummus eru glútenfrí frá náttúrunnar hendi og við merkjum alla ofnæmisvalda skýrt á matseðlinum. Margir réttir eru hnetulausir — segðu teyminu frá og þau aðstoða þig.",
        },
        {
          q: "Þarf ég að bóka borð?",
          a: "Innlit eru alltaf velkomin. En á háönn (júní–ágúst) og um helgar mælum við eindregið með borðapöntun — sérstaklega fyrir 4 eða fleiri. Bóka má á Dineout á 30 sekúndum.",
        },
        {
          q: "Hvar erum við?",
          a: "Bankastræti 2, 101 Reykjavík — gakktu inn úr höfninni rétt við upphaf Laugavegar og finndu innganginn — í hjarta miðbæjarins. Ein mínúta frá aðal-göngugötunni og 10 mínútur frá Hörpu eða Hallgrímskirkju.",
        },
        {
          q: "Hvenær er opið?",
          a: "Opið alla daga 11:30 til 21:00. Síðasta pöntun um 20:30. Hádegismatur, kvöldmatur, te, kakó — komdu hvenær sem þér hentar.",
        },
        {
          q: "Er heimsending í boði?",
          a: "Já — pantaðu á Wolt og við sendum um allt höfuðborgarsvæðið. Sama eldhús, sömu uppskriftir, komið til þín heitt á um 30 mínútum.",
        },
        {
          q: "Er hægt að fá catering fyrir viðburð eða skrifstofuhádegi?",
          a: "Svo sannarlega. Við sjáum um fyrirtækjahádegismat, einkasamkomur, retreat og afmæli. Lágmark 10 skammtar, 1 viku fyrirvari. Fyrirtækjahádegismatur frá 3.000 kr á mann. Hafðu samband á catering-síðunni okkar.",
        },
        {
          q: "Er staðurinn góður fyrir börn og fjölskyldur?",
          a: "Algjörlega. Rýmið er hlýlegt og afslappað, skammtar ríflegir, og krakkar elska yfirleitt naan, hummus, súpu og mild karrý. Barnastólar eru í boði.",
        },
      ],
    },
    sticky: {
      book: "Bóka",
      call: "Hringja",
      map: "Kort",
      wolt: "Wolt",
    },
  },
};

// ── Animation variants ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ── Scroll-triggered section wrapper ──────────────────────────────────────────
function FadeSection({ children, className = "", navbarTheme, id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      data-navbar-theme={navbarTheme}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ── Eyebrow with flanking lines ────────────────────────────────────────────────
function Eyebrow({ children, light = false, className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div
        className={`w-10 h-px bg-gradient-to-r from-transparent ${light ? "to-[#ff914d]/40" : "to-[#ff914d]/50"}`}
      />
      <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
        {children}
      </span>
      <div
        className={`w-10 h-px bg-gradient-to-l from-transparent ${light ? "to-[#ff914d]/40" : "to-[#ff914d]/50"}`}
      />
    </div>
  );
}

// ── Dietary pills ──────────────────────────────────────────────────────────────
function DietaryPills({ tags = [], legend }) {
  if (!tags?.length) return null;
  return (
    <div className="flex gap-1.5 flex-wrap">
      {tags.map((tag) => (
        <span
          key={tag}
          title={legend?.[tag] || tag}
          className="px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.2em] rounded-full border border-[#ff914d]/25 text-[#ff914d]/85 bg-[#ff914d]/[0.04]"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

// ── Trust icon glyph ───────────────────────────────────────────────────────────
function TrustIcon({ name }) {
  const cls = "w-4 h-4 text-[#ff914d]";
  if (name === "star")
    return <Star className={cls} fill="currentColor" strokeWidth={0} />;
  if (name === "tripadvisor")
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <circle cx="8.5" cy="12.3" r="2.3" fill="#1a1510" />
        <circle cx="15.5" cy="12.3" r="2.3" fill="#1a1510" />
        <circle cx="8.5" cy="12.3" r="0.8" fill="#ff914d" />
        <circle cx="15.5" cy="12.3" r="0.8" fill="#ff914d" />
      </svg>
    );
  if (name === "plant")
    return (
      <svg
        viewBox="0 0 24 24"
        className={cls}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 22V10" />
        <path d="M12 14c-2-4-6-4-6-4 0 2 2 6 6 6" />
        <path d="M12 12c2-4 6-4 6-4 0 2-2 6-6 6" />
      </svg>
    );
  if (name === "heart")
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
        <path d="M12 21s-7-4.5-9.3-9.2C1 8 3 4.5 6.5 4.5c2 0 3.6 1 5.5 3 1.9-2 3.5-3 5.5-3 3.5 0 5.5 3.5 3.8 7.3C19 16.5 12 21 12 21z" />
      </svg>
    );
  return null;
}

// ── FAQ Item (accordion) ───────────────────────────────────────────────────────
function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-[#1a1410]/10">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-6 py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className="font-cormorant text-xl md:text-2xl text-[#1a1410] leading-snug pr-4 group-hover:text-[#ff914d] transition-colors">
          {q}
        </span>
        <span className="mt-1 shrink-0 w-7 h-7 rounded-full border border-[#1a1410]/20 flex items-center justify-center text-[#1a1410]/70 group-hover:border-[#ff914d] group-hover:text-[#ff914d] transition-colors">
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-12 text-[#5a4a3a] text-[15px] md:text-base leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Mobile sticky CTA bar ──────────────────────────────────────────────────────
function MobileStickyBar({ t }) {
  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-3 mb-3 rounded-2xl bg-[#1a1510]/95 backdrop-blur-md border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)] grid grid-cols-4 overflow-hidden">
        <a
          href={BOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-2.5 bg-[#ff914d] text-black active:brightness-95"
        >
          <Calendar size={18} strokeWidth={2.2} />
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase">
            {t.sticky.book}
          </span>
        </a>
        <a
          href={`tel:${TEL_NUM}`}
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[#f0ebe3] active:bg-white/5"
        >
          <Phone size={18} strokeWidth={2} />
          <span className="text-[10px] tracking-[0.15em] uppercase">
            {t.sticky.call}
          </span>
        </a>
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[#f0ebe3] active:bg-white/5"
        >
          <MapPin size={18} strokeWidth={2} />
          <span className="text-[10px] tracking-[0.15em] uppercase">
            {t.sticky.map}
          </span>
        </a>
        <a
          href={WOLT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[#f0ebe3] active:bg-white/5"
        >
          <ShoppingBag size={18} strokeWidth={2} />
          <span className="text-[10px] tracking-[0.15em] uppercase">
            {t.sticky.wolt}
          </span>
        </a>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
export default function RestaurantPage() {
  const videoRef = useRef(null);
  const { language } = useLanguage();
  const pathname = usePathname();
  const lang = language === "is" ? "is" : "en";
  const t = CONTENT[lang];
  const menuHref = localizeHref(pathname, "/restaurant/menu");
  const cateringHref = localizeHref(pathname, "/catering");
  const openStatus = useOpenStatus(lang);

  const [openFaq, setOpenFaq] = useState(0);
  const toggleFaq = useCallback(
    (idx) => setOpenFaq((cur) => (cur === idx ? -1 : idx)),
    [],
  );

  useEffect(() => {
    if (videoRef.current) videoRef.current.play();
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      <h1 className="sr-only">{t.seoTitle}</h1>

      {/* ── 1. VIDEO HERO — cinematic dark ─────────────────────────────────── */}
      <section
        data-navbar-theme="light"
        className="relative w-full h-screen overflow-hidden bg-[#1a1510]"
      >
        <Image
          src="https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1600,q_auto,f_auto/v1776181244/Mamawalkthroushscreen_bmljjp.png"
          alt="Mama Reykjavik restaurant"
          fill
          className="object-cover"
          priority
        />
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/80" />

        <div className="absolute inset-0 flex flex-col items-center px-6 text-center min-h-0">
          {/* Headline cluster — higher on the viewport */}
          <div className="w-full max-w-4xl mx-auto pt-24 pb-4 md:pt-28 md:pb-6 shrink-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex items-center justify-center gap-3 mb-5 md:mb-6"
            >
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#ff914d]/60" />
              <span className="text-xs uppercase tracking-[0.4em] text-[#ff914d]">
                {t.hero.eyebrow}
              </span>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#ff914d]/60" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.5 }}
              className="font-cormorant font-light italic text-white leading-[0.95] mb-5 md:mb-6 text-balance px-1"
              style={{ fontSize: "clamp(2.85rem, 11vw, 8rem)" }}
            >
              {t.hero.title}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="flex flex-col items-center gap-2.5"
            >
              <div className="text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.25em] uppercase bg-black/40 backdrop-blur-sm px-4 sm:px-5 py-2.5 rounded-full text-white/70">
                {t.hero.sublineBottom}
              </div>
              <Link
                href={menuHref}
                className="md:hidden mt-3 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.28em] uppercase text-white/75 hover:text-white transition-colors"
              >
                <span className="border-b border-white/50 pb-0.5">{t.hero.secondaryCta}</span>
                <span className="text-[#ff914d]/90 font-normal" aria-hidden>
                  →
                </span>
              </Link>
            </motion.div>
          </div>

          <div className="hidden md:block flex-1 min-h-8" aria-hidden />

          {/* Desktop: CTAs + scroll — kept clear of mobile floating controls */}
          <div className="hidden md:flex w-full flex-col items-center gap-8 pb-8 md:pb-10 shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-row flex-wrap gap-3 justify-center items-center"
            >
              <Link
                href={BOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide hover:scale-105 hover:brightness-110 transition-all duration-200"
              >
                {t.hero.primaryCta}
              </Link>
              <Link
                href={menuHref}
                className="inline-flex items-center justify-center px-8 py-3 border border-white/35 text-white rounded-full text-sm tracking-wide hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
              >
                {t.hero.secondaryCta}
              </Link>
            </motion.div>
            <motion.div
              className="flex flex-col items-center gap-1"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-px h-10 bg-gradient-to-b from-white/0 to-white/35" />
              <div className="w-1 h-1 rounded-full bg-white/35" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST BAND — thin warm strip with social proof ──────────────── */}
      <FadeSection
        navbarTheme="light"
        className="relative bg-[#1a1510] border-y border-white/[0.06] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff914d]/[0.04] via-transparent to-[#ff914d]/[0.04] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-5 md:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-6">
            {t.trust.items.map((item, i) => (
              <motion.div
                key={item.top}
                variants={fadeUp}
                custom={i}
                className={`flex items-center gap-3 ${
                  i > 0 ? "md:border-l md:border-white/[0.08] md:pl-6" : ""
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-[#ff914d]/10 flex items-center justify-center shrink-0">
                  <TrustIcon name={item.icon} />
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[#f0ebe3] leading-tight truncate">
                    {item.top}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#a09488] mt-0.5 truncate">
                    {item.bottom}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* ── 3. "OUR KITCHEN" — warm cream, first breath of light ───────────── */}
      <FadeSection
        navbarTheme="light"
        className="bg-[#f9f4ec] py-28 px-6 text-center"
      >
        <motion.div variants={fadeUp}>
          <Eyebrow light className="mb-10">
            {t.kitchen.eyebrow}
          </Eyebrow>
        </motion.div>
        <motion.blockquote
          variants={fadeUp}
          className="font-cormorant font-light italic text-[#1a1410] max-w-4xl mx-auto leading-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)" }}
        >
          {t.kitchen.titleTop}
          <br className="hidden md:block" /> {t.kitchen.titleBottom}
        </motion.blockquote>
        <motion.p
          variants={fadeUp}
          className="mt-10 max-w-2xl mx-auto text-[#7a6a5a] text-base md:text-lg leading-relaxed"
        >
          {t.kitchen.body}
        </motion.p>
        <motion.div
          variants={fadeUp}
          className="mt-10 flex justify-center flex-wrap gap-4 text-xs uppercase tracking-[0.25em] text-[#b09a88]"
        >
          {t.kitchen.origins.map((origin, i, arr) => (
            <span key={origin} className="flex items-center gap-4">
              {origin}
              {i < arr.length - 1 && (
                <span className="text-[#ff914d]/60">·</span>
              )}
            </span>
          ))}
        </motion.div>
      </FadeSection>

      {/* ── 4. FEATURED DISHES — warm editorial splits ────────────────────── */}
      {t.featuredDishes.map((dish, i) => (
        <section
          data-navbar-theme="light"
          key={dish.name}
          className={`relative flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} bg-[#1a1510] overflow-hidden`}
        >
          {/* Ambient glow */}
          <div
            className={`absolute ${i % 2 === 0 ? "right-1/4" : "left-1/4"} top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#ff914d]/[0.04] blur-[120px] pointer-events-none`}
          />
          <div
            className={`absolute ${i % 2 === 0 ? "-left-20" : "-right-20"} bottom-0 w-[300px] h-[300px] rounded-full bg-[#ff914d]/[0.03] blur-[80px] pointer-events-none`}
          />

          {/* Image half */}
          <div className="relative w-full md:w-1/2 h-[70vw] md:h-[620px] shrink-0 overflow-hidden">
            <Image
              src={dish.img}
              alt={dish.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/50 to-transparent" />
            <div
              className={`absolute bottom-0 ${i % 2 === 0 ? "right-0" : "left-0"} w-24 h-24 bg-gradient-to-tl from-[#ff914d]/10 to-transparent pointer-events-none`}
            />
          </div>

          {/* Text half */}
          <motion.div
            initial={{ opacity: 0, x: i % 2 === 0 ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className={`relative flex-1 flex flex-col justify-center overflow-hidden px-10 py-16 md:px-14 lg:px-20 ${
              i % 2 === 0
                ? "md:border-l md:border-white/[0.08]"
                : "md:border-r md:border-white/[0.08]"
            }`}
          >
            <div
              className="pointer-events-none absolute inset-0 z-0"
              aria-hidden
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#242019] via-[#1a1510] to-[#100d0a]" />
              <div
                className={`absolute top-1/4 h-40 w-[min(100%,20rem)] -translate-y-1/2 rounded-full bg-[#ff914d]/[0.09] blur-[72px] ${
                  i % 2 === 0 ? "left-0" : "right-0"
                }`}
              />
              <div className="absolute -bottom-8 right-1/4 h-36 w-36 rounded-full bg-[#ff914d]/[0.05] blur-[64px]" />
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                  backgroundSize: "180px 180px",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 120% 80% at 50% 100%, rgba(0,0,0,0.22) 0%, transparent 55%)",
                }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
                <span className="text-xs uppercase tracking-[0.3em] text-[#ff914d]">
                  {dish.origin}
                </span>
              </div>
              <h3
                className="font-cormorant font-light italic text-[#f0ebe3] mb-4 leading-none"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}
              >
                {dish.name}
              </h3>
              <div className="w-12 h-px bg-gradient-to-r from-[#ff914d]/40 to-transparent mb-6" />
              <p className="text-[#b5a89a] leading-relaxed mb-10 max-w-sm text-base">
                {dish.description}
              </p>
              <Link
                href={menuHref}
                className="inline-flex items-center gap-2 text-[#ff914d] text-xs tracking-[0.25em] uppercase hover:gap-4 transition-all duration-300 w-fit group"
              >
                {t.featuredMenuCta}
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </Link>
            </div>
          </motion.div>
        </section>
      ))}

      {/* ── 5. MENU PREVIEW — enhanced "Also on the Table" ──────────────────── */}
      <FadeSection
        navbarTheme="light"
        className="relative bg-[#1a1510] py-24 px-6 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[#ff914d]/[0.03] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-[350px] h-[350px] rounded-full bg-[#ff914d]/[0.025] blur-[100px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-4">
            <Eyebrow className="mb-6">{t.alsoOnTable.eyebrow}</Eyebrow>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-cormorant font-light italic text-[#f0ebe3] text-center leading-tight"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)" }}
          >
            {t.alsoOnTable.title}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-center text-[#a09488] text-sm mt-3 mb-14"
          >
            {t.alsoOnTable.subtitle}
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-0">
            {t.alsoOnTable.dishes.map((item, i) => (
              <motion.div
                key={item.name}
                variants={fadeUp}
                custom={i}
                className="flex items-start gap-4 py-5 border-b border-[#f0ebe3]/[0.06] group"
              >
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#ff914d] w-20 shrink-0 leading-tight font-medium pt-1">
                  {item.origin}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h4 className="font-cormorant text-2xl font-light italic text-[#f0ebe3] leading-tight">
                      {item.name}
                    </h4>
                  </div>
                  <p className="text-xs text-[#a09488] leading-relaxed mt-1.5">
                    {item.note}
                  </p>
                  {item.tags?.length > 0 && (
                    <div className="mt-2.5">
                      <DietaryPills
                        tags={item.tags}
                        legend={t.alsoOnTable.legend}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center gap-4 mt-12"
          >
            <Link
              href={menuHref}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#ff914d] text-black font-semibold text-xs tracking-[0.2em] uppercase hover:brightness-110 hover:scale-105 transition-all duration-200"
            >
              {t.alsoOnTable.cta} <span>→</span>
            </Link>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[10px] uppercase tracking-[0.2em] text-[#a09488]">
              {Object.entries(t.alsoOnTable.legend).map(([k, v]) => (
                <span key={k}>
                  <span className="text-[#ff914d]/80 font-medium">{k}</span>
                  <span className="mx-1.5">·</span>
                  {v}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </FadeSection>

      {/* ── 6. PHOTO GALLERY — full-bleed imagery, no bg ────────────────────── */}
      <section
        data-navbar-theme="light"
        className="grid grid-cols-2 md:grid-cols-4"
      >
        {GALLERY.map((img, i) => (
          <motion.div
            key={img.src}
            className="relative overflow-hidden"
            style={{ aspectRatio: "1 / 1" }}
            initial={{ opacity: 0, scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, delay: i * 0.07 }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors duration-500" />
          </motion.div>
        ))}
      </section>

      {/* ── 7. REVIEWS — moved earlier for mid-page social proof ────────────── */}
      <div className="relative overflow-hidden" data-navbar-theme="dark">
        <DarkBackground mode="inset" />
        <div className="relative z-10">
          <TripadvisorReviews />
        </div>
      </div>

      {/* ── 8. WAYS TO ENJOY — dark dramatic panels ─────────────────────────── */}
      <section
        data-navbar-theme="dark"
        className="relative bg-[#1a1510] overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-[#ff914d]/[0.04] blur-[120px] pointer-events-none" />
        <div className="px-6 pt-24 pb-16 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Eyebrow className="mb-6">{t.ways.eyebrow}</Eyebrow>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-cormorant font-light italic text-[#f0ebe3]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            {t.ways.title}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 border-t border-white/[0.06]">
          {/* 01 — Dine In */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="md:col-span-5 relative min-h-[420px] md:min-h-[560px] overflow-hidden group border-b md:border-b-0 md:border-r border-white/[0.06]"
          >
            <Image
              src="/mamaimg/mamavibe1.jpg"
              alt="Dine in at Mama Reykjavik"
              fill
              sizes="(max-width: 768px) 100vw, 42vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/95 via-[#1a1510]/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-12">
              <span className="text-[8rem] md:text-[10rem] font-black leading-none text-white/5 select-none absolute top-4 left-8">
                01
              </span>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
                <span className="text-xs uppercase tracking-[0.3em] text-[#ff914d]">
                  {t.ways.dineIn.eyebrow}
                </span>
              </div>
              <h3
                className="font-cormorant font-light italic text-[#f0ebe3] mb-4 leading-none"
                style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
              >
                {t.ways.dineIn.title}
              </h3>
              <p className="text-[#a09488] text-sm leading-relaxed mb-8 max-w-xs">
                {t.ways.dineIn.body}
              </p>
              <Link
                href={BOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit px-7 py-3 bg-[#ff914d] text-black font-semibold rounded-full text-xs tracking-wide hover:scale-105 hover:brightness-110 transition-all duration-200"
              >
                {t.ways.dineIn.cta}
              </Link>
            </div>
          </motion.div>

          {/* Right column */}
          <div className="md:col-span-7 flex flex-col">
            {/* 02 — Wolt */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="flex-1 relative overflow-hidden border-b border-white/[0.06] bg-[#1e1812] group p-10 md:p-12 flex flex-col justify-between min-h-[260px]"
            >
              <span className="text-[8rem] md:text-[10rem] font-black leading-none text-white/[0.03] select-none absolute top-0 right-6 pointer-events-none">
                02
              </span>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
                  <span className="text-xs uppercase tracking-[0.3em] text-[#ff914d]">
                    {t.ways.delivery.eyebrow}
                  </span>
                </div>
                <h3
                  className="font-cormorant font-light italic text-[#f0ebe3] mb-3 leading-tight"
                  style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
                >
                  {t.ways.delivery.title}
                </h3>
                <p className="text-[#a09488] text-sm leading-relaxed max-w-sm">
                  {t.ways.delivery.body}
                </p>
              </div>
              <a
                href={WOLT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative mt-8 w-fit flex items-center gap-3 px-7 py-3 border border-white/15 text-[#f0ebe3] rounded-full text-xs tracking-wide hover:bg-white/[0.07] hover:border-white/30 transition-all duration-300 group/btn"
              >
                {t.ways.delivery.cta}
                <span className="opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all duration-300">
                  →
                </span>
              </a>
            </motion.div>

            {/* 03 — Catering */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 relative overflow-hidden bg-[#221810] group px-10 pt-10 pb-14 md:px-12 md:pt-12 md:pb-16 flex flex-col justify-between min-h-[260px]"
            >
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#ff914d]/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#ff914d]/8 blur-2xl pointer-events-none" />
              <span className="text-[8rem] md:text-[10rem] font-black leading-none text-[#ff914d]/5 select-none absolute top-0 right-6 pointer-events-none">
                03
              </span>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
                  <span className="text-xs uppercase tracking-[0.3em] text-[#ff914d]">
                    {t.ways.catering.eyebrow}
                  </span>
                </div>
                <h3
                  className="font-cormorant font-light italic text-[#f0ebe3] mb-3 leading-tight whitespace-pre-line"
                  style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
                >
                  {t.ways.catering.title}
                </h3>
                <p className="text-[#a09488] text-sm leading-relaxed max-w-sm">
                  {t.ways.catering.body}
                </p>
                <p className="mt-3 text-[11px] tracking-[0.15em] uppercase text-[#ff914d]/85 font-medium leading-relaxed max-w-sm">
                  {t.ways.catering.priceHint}
                </p>
              </div>
              <Link
                href={cateringHref}
                className="relative mt-8 w-fit flex items-center gap-3 px-7 py-3 bg-[#ff914d]/15 border border-[#ff914d]/30 text-[#ff914d] rounded-full text-xs tracking-wide hover:bg-[#ff914d]/25 hover:border-[#ff914d]/60 transition-all duration-300 group/btn"
              >
                <span className="text-base">✦</span>
                {t.ways.catering.cta}
                <span className="group-hover/btn:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 9. FAQ — warm cream accordion ─────────────────────────────────── */}
      <FadeSection
        navbarTheme="light"
        className="bg-[#faf6f2] py-24 px-6"
        id="faq"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center">
            <Eyebrow light className="mb-6">
              {t.faq.eyebrow}
            </Eyebrow>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-cormorant font-light italic text-[#1a1410] text-center leading-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
          >
            {t.faq.title}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-center text-[#7a6a5a] text-sm md:text-base mt-3 mb-12 max-w-xl mx-auto"
          >
            {t.faq.subtitle}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="border-t border-[#1a1410]/10"
          >
            {t.faq.items.map((item, i) => (
              <FaqItem
                key={item.q}
                q={item.q}
                a={item.a}
                isOpen={openFaq === i}
                onToggle={() => toggleFaq(i)}
              />
            ))}
          </motion.div>
        </div>
      </FadeSection>

      {/* ── 10. FIND US — enhanced Visit section with map + logistics ───────── */}
      <FadeSection
        navbarTheme="light"
        className="bg-[#f9f4ec] pt-24 pb-28 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp}>
            <Eyebrow
              light
              className="mb-8 [&_span]:text-[11px] [&_span]:font-semibold [&_span]:tracking-[0.32em]"
            >
              {t.visit.eyebrow}
            </Eyebrow>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-cormorant font-light italic text-[#1a1410] mb-10 leading-tight text-center"
            style={{ fontSize: "clamp(2.25rem, 5.5vw, 4rem)" }}
          >
            {t.visit.titleTop}
            <br />
            {t.visit.titleBottom}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Left: Info */}
            <motion.div variants={fadeUp} className="space-y-7">
              {/* Hours */}
              <div className="flex items-start gap-4">
                <span className="mt-0.5 w-10 h-10 rounded-full bg-[#1a1410]/5 flex items-center justify-center shrink-0">
                  <Clock
                    size={16}
                    className="text-[#1a1410]/70"
                    strokeWidth={1.8}
                  />
                </span>
                <div>
                  <div className="text-[11px] tracking-[0.25em] uppercase text-[#8a7a6a] font-medium">
                    {t.visit.hoursLabel}
                  </div>
                  <div className="mt-1 text-xl font-light text-[#1a1410] tabular-nums">
                    {t.visit.hours}
                  </div>
                  {openStatus && (
                    <div
                      className={`inline-flex items-center gap-2 mt-2 text-[11px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full ${
                        openStatus.open
                          ? "bg-[#d7efd9] text-[#2a7a3f]"
                          : "bg-[#1a1410]/5 text-[#1a1410]/60"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          openStatus.open
                            ? "bg-[#2a7a3f] animate-pulse"
                            : "bg-[#1a1410]/40"
                        }`}
                      />
                      {openStatus.label}
                    </div>
                  )}
                </div>
              </div>

              {/* Phone */}
              <a
                href={`tel:${TEL_NUM}`}
                className="flex items-start gap-4 group"
              >
                <span className="mt-0.5 w-10 h-10 rounded-full bg-[#1a1410]/5 flex items-center justify-center shrink-0 group-hover:bg-[#ff914d]/15 transition-colors">
                  <Phone
                    size={16}
                    className="text-[#1a1410]/70 group-hover:text-[#ff914d]"
                    strokeWidth={1.8}
                  />
                </span>
                <div>
                  <div className="text-[11px] tracking-[0.25em] uppercase text-[#8a7a6a] font-medium">
                    {t.visit.callLabel}
                  </div>
                  <div className="mt-1 text-xl font-light text-[#1a1410] tabular-nums group-hover:text-[#ff914d] transition-colors">
                    {TEL_DISPLAY}
                  </div>
                  <div className="text-xs text-[#8a7a6a] mt-0.5">
                    team@mama.is
                  </div>
                </div>
              </a>

              {/* Address / directions */}
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 group"
              >
                <span className="mt-0.5 w-10 h-10 rounded-full bg-[#1a1410]/5 flex items-center justify-center shrink-0 group-hover:bg-[#ff914d]/15 transition-colors">
                  <Navigation
                    size={16}
                    className="text-[#1a1410]/70 group-hover:text-[#ff914d]"
                    strokeWidth={1.8}
                  />
                </span>
                <div>
                  <div className="text-[11px] tracking-[0.25em] uppercase text-[#8a7a6a] font-medium">
                    {t.visit.directionsLabel}
                  </div>
                  <div className="mt-1 text-xl font-light text-[#1a1410] group-hover:text-[#ff914d] transition-colors">
                    Bankastræti 2, 101 Reykjavík
                  </div>
                </div>
              </a>

              {/* Walking distances */}
              <div className="flex items-start gap-4">
                <span className="mt-0.5 w-10 h-10 rounded-full bg-[#1a1410]/5 flex items-center justify-center shrink-0">
                  <Footprints
                    size={16}
                    className="text-[#1a1410]/70"
                    strokeWidth={1.8}
                  />
                </span>
                <div className="flex-1">
                  <div className="text-[11px] tracking-[0.25em] uppercase text-[#8a7a6a] font-medium">
                    {t.visit.walk.title}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                    {t.visit.walk.items.map((w) => (
                      <span key={w.from} className="text-sm text-[#1a1410]/80">
                        <span className="font-medium">{w.from}</span>
                        <span className="mx-1.5 text-[#c4b4a4]">·</span>
                        <span className="tabular-nums text-[#7a6a5a]">
                          {w.mins}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logistics */}
              <div className="space-y-3 pt-2">
                {t.visit.logistics.map((l) => (
                  <div key={l.label} className="flex items-start gap-4">
                    <span className="mt-0.5 w-10 h-10 rounded-full bg-[#1a1410]/[0.03] flex items-center justify-center shrink-0">
                      <Car
                        size={15}
                        className="text-[#1a1410]/55"
                        strokeWidth={1.8}
                      />
                    </span>
                    <p className="text-sm text-[#7a6a5a] leading-relaxed flex-1 pt-2">
                      {l.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link
                  href={BOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-3.5 bg-[#ff914d] text-black font-semibold rounded-full text-sm tracking-wide text-center hover:scale-105 transition-all duration-200"
                >
                  {t.visit.primaryCta}
                </Link>
                <Link
                  href={menuHref}
                  className="px-7 py-3.5 border border-[#1a1410]/20 text-[#1a1410] rounded-full text-sm tracking-wide text-center hover:bg-[#1a1410]/5 transition-all duration-200"
                >
                  {t.visit.secondaryCta}
                </Link>
              </div>
            </motion.div>

            {/* Right: Map */}
            <motion.div
              variants={fadeUp}
              className="relative w-full aspect-[4/5] md:aspect-auto md:h-[560px] rounded-3xl overflow-hidden shadow-[0_24px_60px_-20px_rgba(26,20,16,0.35)] ring-1 ring-[#1a1410]/10 bg-[#1a1410]"
            >
              <iframe
                title={t.visit.mapAria}
                src={MAPS_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
              />
              {/* Floating pin card */}
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 right-4 sm:left-5 sm:right-5 bg-white/95 backdrop-blur rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 hover:bg-white transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-[#ff914d]/15 flex items-center justify-center shrink-0">
                  <MapPin
                    size={16}
                    className="text-[#ff914d]"
                    strokeWidth={2.2}
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#1a1410] truncate">
                    Mama Reykjavík
                  </div>
                  <div className="text-xs text-[#7a6a5a] truncate">
                    Bankastræti 2, 101 Reykjavík
                  </div>
                </div>
                <span className="text-xs text-[#ff914d] font-semibold tracking-wide uppercase shrink-0">
                  {t.visit.directionsLabel} →
                </span>
              </a>
            </motion.div>
          </div>
        </div>
      </FadeSection>

      {/* ── 11. MOBILE STICKY CTA BAR ──────────────────────────────────────── */}
      <MobileStickyBar t={t} />

      {/* Spacer so sticky bar doesn't cover footer-adjacent content */}
      <div className="md:hidden h-20" aria-hidden />
    </div>
  );
}
