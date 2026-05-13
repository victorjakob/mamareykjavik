// Single-source bilingual copy for The Private Space.
// Exported keys: en, is. Component picks one based on locale.
//
// Pricing snapshot — these numbers are duplicated in API price calculator.
// When adjusting, also update lib/private-space/pricing.js.

export const PHONE_DISPLAY = "616 7722";
export const PHONE_TEL = "+3546167722";

export const PRICING = {
  hourly: { isk: 5500, label: { en: "ISK / hour", is: "ISK / klst" } },
  hourlyDiscount4Plus: { isk: 4500, label: { en: "ISK / hour (4+ hrs)", is: "ISK / klst (4+ klst)" } },
  halfDay: { isk: 18000, label: { en: "Half-day · 4 hours", is: "Hálfur dagur · 4 klst" } },
  fullDay: { isk: 32000, label: { en: "Full day · 8+ hours", is: "Heill dagur · 8+ klst" } },
  recurring2hr: { isk: 34000, label: { en: "Weekly slot · 2 hrs / week", is: "Vikulegur tími · 2 klst / viku" } },
  recurring3hr: { isk: 48000, label: { en: "Weekly slot · 3 hrs / week", is: "Vikulegur tími · 3 klst / viku" } },
};

export const COPY = {
  en: {
    locale: "en",
    htmlLang: "en",
    eyebrow: "The Private Space",
    heroTitle: "A private room.",
    heroTitleSecond: "In the heart of town.",
    heroSubtitle:
      "A quiet room in downtown Reykjavík for sessions, small groups, bodywork, talks, photoshoots and anything that needs a bit of privacy.",
    heroCtaPrimary: "Reserve the room",
    heroCtaSecondary: "See availability",
    introEyebrow: "Bankastræti",
    introTitle: "A calm room\nbehind its own door.",
    introBody:
      "The Private Space is on the lower floor, underneath the White Lotus area, with its own entrance and access. It is fully private, simple, warm and ready for you to use in your own way.",
    forYouEyebrow: "Who it's for",
    forYouTitle: "For sessions, small groups\nand focused work.",
    forYouItems: [
      { title: "1-on-1 sessions", body: "Therapy, coaching, readings or private consultations." },
      { title: "Bodywork", body: "Massage, breathwork, energy work or anything that needs a calm setup." },
      { title: "Coaching & consulting", body: "A quiet room for proper conversations." },
      { title: "Small groups", body: "Up to 10 people for circles, workshops or private gatherings." },
      { title: "Private lessons", body: "Voice, movement, instruments or focused practice." },
      { title: "Photoshoots & podcasts", body: "Natural light, warm textures and enough quiet to work." },
    ],
    videoCaption: "A quick look inside",
    videoBody:
      "Warm wood, soft lamps, a sofa you can sink into, and enough quiet that you can hear your own thoughts. Designed to disappear so the work in the room can come forward.",
    galleryEyebrow: "The space",
    galleryTitle: "Have a look around.",
    galleryHint: "Tap a photo to enlarge.",
    includedEyebrow: "What's included",
    includedTitle: "What is already there.",
    includedGroups: [
      {
        heading: "Arrival",
        items: [
          "Private entrance — no lobby, no reception",
          "Easy to arrive without interrupting anyone",
          "The room is warm and ready when you arrive",
        ],
      },
      {
        heading: "The room",
        items: [
          "Sofa and soft chairs",
          "Plants throughout",
          "Multi-zone lighting and lamps",
          "Candles — set the mood you need",
        ],
      },
      {
        heading: "Practical",
        items: [
          "Private bathroom and sink",
          "Small kitchenette — fridge, dishwasher, cups",
          "Filtered water and tea",
        ],
      },
    ],
    howEyebrow: "How it works",
    howTitle: "How booking works.",
    howSteps: [
      { num: "1", title: "Send a request", body: "Choose your date and time, and tell us briefly what you are booking for." },
      { num: "2", title: "We reply within 24 hours", body: "If the time works, we send a payment link. If not, we suggest another option." },
      { num: "3", title: "Pay and it is confirmed", body: "Pay by card with the link we send you. Once it is paid, the room is yours for that time." },
    ],
    pricingEyebrow: "Pricing",
    pricingTitle: "Simple, fair pricing.",
    pricingSub:
      "Book by the hour for one-off sessions, take a half or full day, or keep the same weekly time if you use the room regularly.",
    pricingCards: [
      { tag: "Most flexible", title: "Hourly", price: "5,500 ISK", per: "/ hour", note: "2-hour minimum.", bullets: ["Drops to 4,500 / hr at 4+ hrs", "Pay per booking", "Best for one-off sessions"] },
      { tag: "Best for workshops", title: "Half-day", price: "18,000 ISK", per: "/ 4-hour block", note: "Morning · afternoon · evening.", bullets: ["9–13 · 13–17 · 17–21", "The room is yours for the block", "Saves vs hourly"] },
      { tag: "Best for longer bookings", title: "Full day", price: "32,000 ISK", per: "/ 8+ hours", note: "The room is yours.", bullets: ["Time to set up and pack down", "Workshops, shoots, private events", "Save 30% vs hourly"] },
      { tag: "For regular use", title: "Weekly slot", price: "from 34,000 ISK", per: "/ month", note: "2 or 3 hrs / week.", bullets: ["Same time every week", "Billed monthly", "Cancel with 30 days notice"], featured: true },
    ],
    pricingFootnote: "All prices in ISK and include VAT. First-time renters: use code WELCOME15 for 15% off your first booking.",
    calendarEyebrow: "Availability",
    calendarTitle: "Find your time.",
    calendarSub: "Open dates are shown in cream. Booked dates are grey. Click any open day to start a request.",
    calendarCta: "Open the booking calendar →",
    cancellationEyebrow: "House rules",
    cancellationTitle: "A few simple rules.",
    cancellationItems: [
      { title: "7+ days before", body: "Full refund." },
      { title: "48 hours before", body: "50% refund, because the time has been held for you." },
      { title: "Under 48 hours", body: "Non-refundable, but we will try to help you find another time if we can." },
      { title: "Group size", body: "Up to 10 people. Anything larger, ask us about the venue next door." },
      { title: "Respect", body: "Leave the room as you found it. Candles out, lights off, door closed." },
    ],
    faqEyebrow: "Questions",
    faqTitle: "Things people ask.",
    faqs: [
      {
        q: "What's the maximum group size?",
        a: "Up to 10 people. The room works best for 1-on-1 sessions, small groups and quieter work. For larger groups, ask us about White Lotus next door.",
      },
      {
        q: "Can I host a recurring weekly class?",
        a: "Yes. You keep the same time every week, for example Tuesdays 6–8pm. The card on file is charged monthly and you can cancel with 30 days notice.",
      },
      {
        q: "How quickly will I hear back after submitting a request?",
        a: "Within 24 hours, often faster. We review each request before confirming, so we can make sure the time and setup work.",
      },
      {
        q: "What if I need to cancel?",
        a: "Cancel 7+ days out: full refund. 48+ hours: 50%. Under 48 hours is non-refundable but we'll work with you to find a fair re-book if life happens.",
      },
      {
        q: "Is there parking?",
        a: "Street parking on Bankastræti and Lækjargata, and the Kolaportið car park is a 3-minute walk. The space is also a short walk from the BSÍ bus station.",
      },
      {
        q: "Can I bring my own props — mats, candles, instruments?",
        a: "Yes. Bring what you need, take it with you when you leave, and never leave open flames unattended.",
      },
    ],
    finalCtaTitle: "Need a private room?",
    finalCtaBody: "Book a single session, an evening, a full day or the same time every week.",
    finalCtaPrimary: "Reserve the room",
    finalCtaSecondary: `Or call ${PHONE_DISPLAY}`,
  },

  is: {
    locale: "is",
    htmlLang: "is",
    eyebrow: "Einkarýmið",
    heroTitle: "Einkarými.",
    heroTitleSecond: "Í miðbænum.",
    heroSubtitle:
      "Rólegt rými í miðbæ Reykjavíkur fyrir tíma, litla hópa, líkamsvinnu, samtöl, myndatökur og annað sem þarf næði.",
    heroCtaPrimary: "Bóka rýmið",
    heroCtaSecondary: "Skoða lausa tíma",
    introEyebrow: "Bankastræti",
    introTitle: "Rólegt rými\nmeð eigin inngangi.",
    introBody:
      "Einkarýmið er á neðri hæðinni, undir White Lotus svæðinu, með eigin inngangi og aðgengi. Það er alveg prívat, einfalt, hlýlegt og tilbúið fyrir þig að nota á þinn hátt.",
    forYouEyebrow: "Fyrir hverja",
    forYouTitle: "Fyrir tíma, litla hópa\nog vinnu sem þarf næði.",
    forYouItems: [
      { title: "Einstaklingstímar", body: "Meðferð, markþjálfun, lestur eða einkaráðgjöf." },
      { title: "Líkamsvinna", body: "Nudd, öndunarvinna, orkuvinna eða annað sem þarf rólega aðstöðu." },
      { title: "Þjálfun og ráðgjöf", body: "Rólegt rými fyrir almennileg samtöl." },
      { title: "Litlir hópar", body: "Allt að 10 manns fyrir hringi, vinnustofur eða lokaðar samkomur." },
      { title: "Einkatímar", body: "Söngur, hreyfing, hljóðfæri eða önnur einbeitt vinna." },
      { title: "Myndatökur og hlaðvörp", body: "Náttúrulegt ljós, hlý áferð og nægur friður til að vinna." },
    ],
    videoCaption: "Stutt kík inn",
    videoBody:
      "Hlýtt timbur, mjúkir lampar, sófi sem tekur við þér og næði til að heyra eigin hugsanir. Hannað til að hverfa svo vinnan sem á sér stað í rýminu fái að rísa.",
    galleryEyebrow: "Rýmið",
    galleryTitle: "Skoðaðu rýmið.",
    galleryHint: "Smelltu á mynd til að stækka.",
    includedEyebrow: "Það sem fylgir",
    includedTitle: "Það sem er til staðar.",
    includedGroups: [
      {
        heading: "Koman",
        items: [
          "Sérinngangur — engin móttaka",
          "Auðvelt að koma án þess að trufla neinn",
          "Rýmið er hlýtt og tilbúið þegar þú kemur",
        ],
      },
      {
        heading: "Herbergið",
        items: [
          "Sófi og mjúkir stólar",
          "Plöntur um allt",
          "Stillanleg lýsing og lampar",
          "Kerti ef þú vilt setja stemningu",
        ],
      },
      {
        heading: "Hagnýtt",
        items: [
          "Eigið baðherbergi og vaskur",
          "Lítið eldhús — ísskápur, uppþvottavél, bollar",
          "Síað vatn og te",
        ],
      },
    ],
    howEyebrow: "Hvernig þetta gengur",
    howTitle: "Hvernig bókun virkar.",
    howSteps: [
      { num: "1", title: "Sendu beiðni", body: "Veldu dag og tíma og segðu okkur stuttlega hvað þú vilt nota rýmið fyrir." },
      { num: "2", title: "Við svörum innan 24 klst", body: "Ef tíminn gengur sendum við greiðslulink. Ef ekki, stingum við upp á öðrum tíma." },
      { num: "3", title: "Greiddu og bókunin er staðfest", body: "Greiddu með korti með linknum sem við sendum. Þegar greiðsla er komin er rýmið frátekið fyrir þig." },
    ],
    pricingEyebrow: "Verð",
    pricingTitle: "Einfalt og sanngjarnt verð.",
    pricingSub:
      "Bókaðu eftir klukkustund fyrir staka tíma, hálfan eða heilan dag, eða sama tíma í hverri viku ef þú notar rýmið reglulega.",
    pricingCards: [
      { tag: "Sveigjanlegast", title: "Tímagjald", price: "5.500 ISK", per: "/ klst", note: "Lágmark 2 klst.", bullets: ["Lækkar í 4.500 / klst frá 4+ klst", "Borgað fyrir hverja bókun", "Best fyrir staka tíma"] },
      { tag: "Best fyrir vinnustofur", title: "Hálfur dagur", price: "18.000 ISK", per: "/ 4 klst", note: "Morgun · síðdegi · kvöld.", bullets: ["9–13 · 13–17 · 17–21", "Rýmið er þitt allan tímann", "Sparar miðað við tímagjald"] },
      { tag: "Best fyrir lengri viðburði", title: "Heill dagur", price: "32.000 ISK", per: "/ 8+ klst", note: "Rýmið er þitt.", bullets: ["Tími til að setja upp og ganga frá", "Vinnustofur, athafnir, myndatökur", "Sparar 30% miðað við tímagjald"] },
      { tag: "Fyrir reglulega notkun", title: "Vikulegur tími", price: "frá 34.000 ISK", per: "/ mánuði", note: "2 eða 3 klst / viku.", bullets: ["Sami tími hverja viku", "Rukkað mánaðarlega", "Hægt að segja upp með 30 daga fyrirvara"], featured: true },
    ],
    pricingFootnote: "Öll verð í ISK og með VSK. Fyrir nýja leigjendur: notaðu kóðann WELCOME15 fyrir 15% afslátt af fyrstu bókun.",
    calendarEyebrow: "Lausir tímar",
    calendarTitle: "Finndu þinn tíma.",
    calendarSub: "Lausir dagar eru kremlitaðir. Fráteknir dagar eru gráir. Smelltu á lausan dag til að senda beiðni.",
    calendarCta: "Opna bókunardagatal →",
    cancellationEyebrow: "Húsreglur",
    cancellationTitle: "Nokkrar einfaldar reglur.",
    cancellationItems: [
      { title: "7+ dögum fyrir", body: "Full endurgreiðsla." },
      { title: "48 klst fyrir", body: "50% endurgreiðsla, þar sem tíminn hefur verið frátekinn fyrir þig." },
      { title: "Innan 48 klst", body: "Ekki endurgreiðanlegt, en við reynum að hjálpa þér að finna annan tíma ef við getum." },
      { title: "Hópastærð", body: "Allt að 10 manns. Stærri hópar — spurðu okkur um White Lotus við hliðina." },
      { title: "Virðing", body: "Skildu við rýmið eins og þú komst að því. Slökktu á kertum og ljósum og lokaðu hurðinni." },
    ],
    faqEyebrow: "Spurningar",
    faqTitle: "Það sem fólk spyr um.",
    faqs: [
      {
        q: "Hver er hámarks hópastærð?",
        a: "Allt að 10 manns. Rýmið hentar best fyrir einstaklingstíma, litla hópa og rólega vinnu. Fyrir stærri hópa, spurðu okkur um White Lotus við hliðina.",
      },
      {
        q: "Get ég verið með fastan vikulegan tíma?",
        a: "Já. Þá heldur þú sama tíma í hverri viku, til dæmis þriðjudaga 18–20. Kortið á skrá er rukkað mánaðarlega og þú getur sagt upp með 30 daga fyrirvara.",
      },
      {
        q: "Hversu fljótt fæ ég svar eftir að ég sendi beiðni?",
        a: "Innan 24 klst, oftast hraðar. Við skoðum hverja beiðni áður en við staðfestum, svo við vitum að tíminn og uppsetningin gangi.",
      },
      {
        q: "Hvað ef ég þarf að afbóka?",
        a: "Afbóka 7+ daga fyrir: full endurgreiðsla. 48+ klst: 50%. Innan 48 klst er ekki endurgreiðanlegt en við vinnum með þér ef eitthvað kemur upp á.",
      },
      {
        q: "Er bílastæði?",
        a: "Það eru götustæði á Bankastræti og Lækjargötu, og Kolaportsbílastæðið er í um 3 mínútna göngufjarlægð. Rýmið er líka stutt frá BSÍ.",
      },
      {
        q: "Get ég komið með eigin búnað — mottur, kerti, hljóðfæri?",
        a: "Já, að sjálfsögðu. Taktu bara allt með þér aftur þegar þú ferð og skildu aldrei eftir loga án eftirlits.",
      },
    ],
    finalCtaTitle: "Vantar þig einkarými?",
    finalCtaBody: "Bókaðu stakan tíma, kvöld, heilan dag eða sama tíma í hverri viku.",
    finalCtaPrimary: "Bóka rýmið",
    finalCtaSecondary: `Eða hringdu í ${PHONE_DISPLAY}`,
  },
};
