// Membership tier copy — single source of truth.
// ────────────────────────────────────────────────
// The tier data (names, taglines, prices, feature lists, EN + IS) used to be
// duplicated between the homepage community section and the /membership
// landing page. It now lives here, once, per locale.
//
// Simplified July 2026: every listed perk is something we actually deliver
// today (or is clearly framed as occasional / first-access). No "coming
// soon" bullets inside open tiers — the only gated thing is the third tier
// itself.
//
// Consumed by:
//   - src/app/membership/components/MembershipLandingClient.jsx (tier cards)
//   - src/app/components/community/CommunityMembershipSection.jsx (homepage)
//
// Per tier:
//   id         "free" | "tribe" | "patron"
//   name       display name (landing-page voice)
//   tagline    one-liner under the name
//   price      display price string ("2,000 ISK", "Coming soon", …)
//   period     display cadence with its slash ("/ month", "/ always", "")
//   features   full perk list (the landing page shows all of these)
//   comingSoon tier isn't purchasable yet — UI gates the CTA
//   homepage   optional overrides for the homepage's shorter editorial
//              presentation ({ name?, tagline?, features? }). Fields not
//              overridden fall back to the canonical ones above.
//
// Page-specific copy (section headings, CTA labels, manage-panel strings)
// stays local to each component — only the tier data is shared.

// Tribe perk lists — the homepage shows the discount line without the
// "Mama Tribe Card:" prefix but shares the remaining perks verbatim.
const TRIBE_FEATURES_EN = [
  "Mama Tribe Card: 20% discount on food & drinks at Mama",
  "Early access to selected events and special evenings",
  "Monthly Letter from Mama — reflections, vision and inspiration",
  "Occasional member gifts, surprises and soft invitations",
  "First invitation when retreats, recordings and deeper community offerings open",
];

const TRIBE_FEATURES_IS = [
  "Mama Tribe kortið: 20% afsláttur af mat og drykk á Mama",
  "Forgangur að völdum viðburðum og sérstökum kvöldum",
  "Mánaðarlegt Bréf frá Mama — íhugun, framtíðarsýn og innblástur",
  "Öðru hvoru gjafir, óvæntar gleðistundir og hlýleg boð",
  "Fyrsta boð þegar retreat, upptökur og dýpri samfélagstilboð opna",
];

export const MEMBERSHIP_TIERS = {
  en: {
    free: {
      id: "free",
      name: "Free",
      tagline: "Stay close to the Mama world.",
      price: "0 ISK",
      period: "/ always",
      features: [
        "Event calendar updates so you don't miss what's happening",
        "Weekly Mama newsletter with events, stories, reflections and inspiration",
        "Occasional free meditations, recipes or guided experiences",
        "First access to community updates as the Mama circle grows",
      ],
      comingSoon: false,
      homepage: {
        tagline: "Stay connected",
      },
    },
    tribe: {
      id: "tribe",
      name: "Mama Tribe",
      tagline: "For those who want to support Mama and be part of the everyday circle.",
      price: "2,000 ISK",
      period: "/ month",
      features: TRIBE_FEATURES_EN,
      comingSoon: false,
      homepage: {
        tagline: "Most loved",
        features: [
          "20% discount on food & drinks at Mama",
          ...TRIBE_FEATURES_EN.slice(1),
        ],
      },
    },
    patron: {
      id: "patron",
      name: "Retreats & Private Journeys",
      tagline: "Deeper experiences are slowly growing behind the scenes.",
      price: "Coming soon",
      period: "",
      features: [
        "Iceland-based retreats and immersive nature journeys",
        "Private ceremonies with cacao, sound, breathwork and meditation",
        "Special Iceland Eclipse Festival 2026 experiences",
        "Corporate wellness and team transformation days",
      ],
      comingSoon: true,
      homepage: {
        tagline: "Coming later",
      },
    },
  },
  is: {
    free: {
      id: "free",
      name: "Frítt",
      tagline: "Vertu í tengslum við Mama heiminn.",
      price: "0 ISK",
      period: "/ alltaf",
      features: [
        "Fréttir úr viðburðadagatalinu svo þú missir ekki af neinu",
        "Vikulegt Mama fréttabréf með viðburðum, sögum, íhugun og innblæstri",
        "Öðru hvoru fríar hugleiðslur, uppskriftir eða leiddar upplifanir",
        "Fyrst til að frétta þegar Mama hringurinn stækkar",
      ],
      comingSoon: false,
      homepage: {
        tagline: "Vertu með",
      },
    },
    tribe: {
      id: "tribe",
      name: "Mama Tribe",
      tagline: "Fyrir þau sem vilja styðja Mama og tilheyra hversdagshringnum.",
      price: "2.000 ISK",
      period: "/ mánuður",
      features: TRIBE_FEATURES_IS,
      comingSoon: false,
      homepage: {
        tagline: "Mest elskað",
        features: [
          "20% afsláttur af mat og drykk á Mama",
          ...TRIBE_FEATURES_IS.slice(1),
        ],
      },
    },
    patron: {
      id: "patron",
      name: "Retreat & einkaferðalög",
      tagline: "Dýpri upplifanir eru hægt og rólega að mótast á bak við tjöldin.",
      price: "Kemur bráðum",
      period: "",
      features: [
        "Retreat á Íslandi og djúpar náttúruupplifanir",
        "Einkaathafnir með kakói, hljóði, öndun og hugleiðslu",
        "Sérstakar upplifanir á Iceland Eclipse Festival 2026",
        "Vellíðunar- og umbreytingardagar fyrir vinnustaði",
      ],
      comingSoon: true,
      homepage: {
        tagline: "Kemur síðar",
      },
    },
  },
};
