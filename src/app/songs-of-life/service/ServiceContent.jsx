"use client";

import { useLanguage } from "@/hooks/useLanguage";

const LAST_UPDATED = "November 2025";

const sections = [
  {
    heading: {
      en: "1. Acceptance of Terms",
      is: "1. Samþykki skilmála",
    },
    content: [
      {
        type: "paragraph",
        en: "By downloading, accessing, or using the App, you accept and agree to these Terms as well as our Privacy Policy.",
        is: "Með því að hlaða niður, nálgast eða nota forritið, samþykkir þú og samþykkir þessa skilmála sem og persónuverndarstefnu okkar.",
      },
      {
        type: "paragraph",
        en: "If you do not agree, please discontinue use of the App.",
        is: "Ef þú samþykkir ekki, vinsamlegast hættu að nota forritið.",
      },
    ],
  },
  {
    heading: {
      en: "2. Description of Service",
      is: "2. Lýsing á þjónustu",
    },
    content: [
      {
        type: "paragraph",
        en: "Songs of Life provides educational, musical, and spiritual content, including:",
        is: "Songs of Life býður upp á menntunar-, tónlistar- og andleg efni, þar á meðal:",
      },
      {
        type: "list",
        items: [
          {
            en: "Audio lessons and guided practices",
            is: "Hljóðkennslustundir og leiðbeind æfingar",
          },
          {
            en: "Sacred songs and recordings",
            is: "Helgir söngvar og upptökur",
          },
          {
            en: "Voice training exercises",
            is: "Röddþjálfunaræfingar",
          },
          {
            en: "Personal progress features",
            is: "Eiginleikar fyrir persónulegan framvindu",
          },
          {
            en: "Optional community content",
            is: "Valfrjálst samfélagsinnihald",
          },
        ],
      },
      {
        type: "paragraph",
        en: "All services are subject to change or enhancement at any time.",
        is: "Allar þjónustur geta breyst eða verið bættar hvenær sem er.",
      },
    ],
  },
  {
    heading: {
      en: "3. Eligibility",
      is: "3. Hæfni",
    },
    content: [
      {
        type: "paragraph",
        en: "You must be at least 16 years old to use the App.",
        is: "Þú verður að vera að minnsta kosti 16 ára til að nota forritið.",
      },
      {
        type: "paragraph",
        en: "If you are under 18, you must have permission from a parent or guardian.",
        is: "Ef þú ert yngri en 18 ára, verður þú að hafa leyfi frá foreldri eða forráðamanni.",
      },
    ],
  },
  {
    heading: {
      en: "4. User Accounts",
      is: "4. Notendareikningar",
    },
    content: [
      {
        type: "paragraph",
        en: "To access certain features, you may need to create an account using email or third-party authentication (e.g., Apple Sign-In).",
        is: "Til að nálgast ákveðna eiginleika gætir þú þurft að búa til reikning með netfangi eða þriðja aðila auðkenningu (t.d. Apple Sign-In).",
      },
      {
        type: "paragraph",
        en: "You agree to:",
        is: "Þú samþykkir:",
      },
      {
        type: "list",
        items: [
          {
            en: "Provide accurate and complete information",
            is: "Að veita nákvæmar og fullkomnar upplýsingar",
          },
          {
            en: "Keep your login credentials confidential",
            is: "Að halda innskráningarupplýsingum þínum trúnaðarmálum",
          },
          {
            en: "Accept responsibility for all activity under your account",
            is: "Að taka ábyrgð á allri starfsemi undir reikningnum þínum",
          },
        ],
      },
      {
        type: "paragraph",
        en: "We may suspend or terminate accounts used in violation of these Terms.",
        is: "Við getum frestað eða lokað reikningum sem eru notaðir í stríði við þessa skilmála.",
      },
    ],
  },
  {
    heading: {
      en: "5. License & Acceptable Use",
      is: "5. Leyfi og viðunandi notkun",
    },
    content: [
      {
        type: "paragraph",
        en: "Songs of Life grants you a personal, limited, non-transferable, non-exclusive license to use the App for private, non-commercial purposes.",
        is: "Songs of Life veitir þér persónulega, takmarkaða, ófæranlega, óeinkarétta leyfi til að nota forritið í einkaaðstæðum, ekki í atvinnuskyni.",
      },
      {
        type: "paragraph",
        en: "You may not:",
        is: "Þú mátt ekki:",
      },
      {
        type: "list",
        items: [
          {
            en: "Modify, distribute, or reproduce App content",
            is: "Breyta, dreifa eða endurprenta innihaldi forritsins",
          },
          {
            en: "Decompile, reverse engineer, or exploit the App",
            is: "Afkóða, gera andhverfan verkfræði eða nýta forritið",
          },
          {
            en: "Upload harmful code or misuse the platform",
            is: "Hlaða upp skaðlegum kóða eða misnota vettvanginn",
          },
          {
            en: "Use the App for commercial performance without permission",
            is: "Nota forritið í atvinnuskyni án leyfis",
          },
          {
            en: "Violate copyright of Songs of Life or contributing artists",
            is: "Bróta höfundarrétt Songs of Life eða tónlistarmanna sem leggja sitt af mörkum",
          },
        ],
      },
      {
        type: "paragraph",
        en: "All content (audio, text, images, teachings) is protected by international copyright law.",
        is: "Allt innihald (hljóð, texti, myndir, kenningar) er varið af alþjóðlegum höfundarrétti.",
      },
    ],
  },
  {
    heading: {
      en: "6. Purchases & Subscriptions (If Applicable)",
      is: "6. Kaup og áskriftir (ef við á)",
    },
    content: [
      {
        type: "paragraph",
        en: "Any paid offerings—such as courses, lessons, or subscriptions—will be shown clearly within the App.",
        is: "Allar greiddar tilboð—eins og námskeið, kennslustundir eða áskriftir—verða sýndar skýrt í forritinu.",
      },
      {
        type: "paragraph",
        en: "Purchases are:",
        is: "Kaup eru:",
      },
      {
        type: "list",
        items: [
          {
            en: "Processed via App Store or Google Play",
            is: "Unnin í gegnum App Store eða Google Play",
          },
          {
            en: "Non-refundable unless required by local law",
            is: "Ekki endurgreidd nema krafist sé í staðbundnum lögum",
          },
          {
            en: "Subject to platform billing terms",
            is: "Undirgefnu skilmálum reikningsskilaaðila",
          },
        ],
      },
      {
        type: "paragraph",
        en: "If subscriptions are introduced, they will auto-renew unless canceled through your device settings.",
        is: "Ef áskriftir eru kynntar, verða þær sjálfkrafa endurnýjaðar nema þeim sé sagt upp í gegnum stillingar tækisins þíns.",
      },
    ],
  },
  {
    heading: {
      en: "7. Spiritual, Vocal, and Wellness Disclaimer",
      is: "7. Andleg, rödd- og vellíðanafyrirvari",
    },
    content: [
      {
        type: "paragraph",
        en: "Songs of Life provides educational and creative material.",
        is: "Songs of Life býður upp á menntunar- og skapandi efni.",
      },
      {
        type: "paragraph",
        en: "It does not replace professional advice in the areas of:",
        is: "Það kemur ekki í stað faglegrar ráðgjöf á sviðum:",
      },
      {
        type: "list",
        items: [
          {
            en: "Medicine",
            is: "Læknis",
          },
          {
            en: "Mental health",
            is: "Andleg heilsa",
          },
          {
            en: "Therapy",
            is: "Meðferð",
          },
          {
            en: "Emergency support",
            is: "Neyðaraðstoð",
          },
        ],
      },
      {
        type: "paragraph",
        en: "Practices involving breath, voice, or emotional release should be approached with personal awareness and care.",
        is: "Æfingar sem fela í sér andardrátt, rödd eða tilfinningalega losun ættu að vera nálgaðar með persónulegri meðvitund og umhyggju.",
      },
      {
        type: "paragraph",
        en: "By using the App, you agree that you are responsible for your own wellbeing during practices.",
        is: "Með því að nota forritið samþykkir þú að þú berir ábyrgð á eigin vellíðan á meðan á æfingum stendur.",
      },
    ],
  },
  {
    heading: {
      en: "8. Data & Privacy",
      is: "8. Gögn og persónuvernd",
    },
    content: [
      {
        type: "paragraph",
        en: "We value your privacy.",
        is: "Við metum persónuvernd þína.",
      },
      {
        type: "paragraph",
        en: "Your information is handled according to our Privacy Policy, which explains:",
        is: "Upplýsingarnar þínar eru meðhöndlaðar samkvæmt persónuverndarstefnu okkar, sem útskýrir:",
      },
      {
        type: "list",
        items: [
          {
            en: "what data we collect",
            is: "hvaða gögn við söfnum",
          },
          {
            en: "how it is used",
            is: "hvernig þau eru notuð",
          },
          {
            en: "how it is stored",
            is: "hvernig þau eru geymd",
          },
          {
            en: "your rights as a user",
            is: "réttindi þín sem notandi",
          },
        ],
      },
      {
        type: "paragraph",
        en: "We use Supabase for secure account authentication and data storage.",
        is: "Við notum Supabase fyrir örugga auðkenningu reikninga og gagnageymslu.",
      },
    ],
  },
  {
    heading: {
      en: "9. Intellectual Property",
      is: "9. Hugverk",
    },
    content: [
      {
        type: "paragraph",
        en: "All recordings, lessons, text, branding, and digital assets are the sole property of Songs of Life or its contributors.",
        is: "Allar upptökur, kennslustundir, texti, vörumerki og stafræn eignir eru eingöngu eign Songs of Life eða þeirra sem leggja sitt af mörkum.",
      },
      {
        type: "paragraph",
        en: "You may not copy, resell, or redistribute any part of the App or its content without written permission.",
        is: "Þú mátt ekki afrita, selja aftur eða endurdreifa neinum hluta forritsins eða innihaldi þess án skriflegs leyfis.",
      },
    ],
  },
  {
    heading: {
      en: "10. Availability & Updates",
      is: "10. Aðgengi og uppfærslur",
    },
    content: [
      {
        type: "paragraph",
        en: "We strive to keep the App available, but we do not guarantee uninterrupted access.",
        is: "Við reynum að halda forritinu aðgengilegu, en við tryggjum ekki óslitna aðgang.",
      },
      {
        type: "paragraph",
        en: "Features may be updated, changed, or discontinued at any time.",
        is: "Eiginleikar geta verið uppfærðir, breyttir eða hætt hvenær sem er.",
      },
    ],
  },
  {
    heading: {
      en: "11. Limitation of Liability",
      is: "11. Takmörkun ábyrgðar",
    },
    content: [
      {
        type: "paragraph",
        en: "To the fullest extent permitted by law:",
        is: "Að fullu marki sem leyft er í lögum:",
      },
      {
        type: "paragraph",
        en: "Songs of Life, its creators, partners, and contributors shall not be liable for:",
        is: "Songs of Life, skapendur þess, samstarfsaðilar og þeir sem leggja sitt af mörkum bera ekki ábyrgð á:",
      },
      {
        type: "list",
        items: [
          {
            en: "indirect or consequential damages",
            is: "óbeinum eða afleiðingum skaða",
          },
          {
            en: "injury arising from vocal, emotional, or physical practices",
            is: "meiðslum sem stafa af rödd-, tilfinninga- eða líkamlegum æfingum",
          },
          {
            en: "data loss or unauthorized access",
            is: "gagnatapi eða óheimilum aðgangi",
          },
          {
            en: "issues caused by third-party services",
            is: "vandamálum sem stafa af þjónustu þriðja aðila",
          },
        ],
      },
      {
        type: "paragraph",
        en: "Your use of the App is at your own discretion and risk.",
        is: "Notkun þín á forritinu er á eigin ábyrgð og áhættu.",
      },
    ],
  },
  {
    heading: {
      en: "12. Governing Law",
      is: "12. Lögsaga",
    },
    content: [
      {
        type: "paragraph",
        en: "These Terms shall be governed by the laws of Iceland, without regard to conflict-of-law rules.",
        is: "Þessir skilmálar lúta lögum Íslands, án tillits til reglna um árekstur laga.",
      },
    ],
  },
  {
    heading: {
      en: "13. Changes to Terms",
      is: "13. Breytingar á skilmálum",
    },
    content: [
      {
        type: "paragraph",
        en: "We may update these Terms periodically.",
        is: "Við getum uppfært þessa skilmála reglubundið.",
      },
      {
        type: "paragraph",
        en: "If changes are material, we will notify users within the App or through an update.",
        is: "Ef breytingar eru mikilvægar, munum við tilkynna notendum í forritinu eða með uppfærslu.",
      },
      {
        type: "paragraph",
        en: "Continued use of the App indicates acceptance of the revised Terms.",
        is: "Áframhaldandi notkun forritsins gefur til kynna samþykki á endurskoðuðum skilmálum.",
      },
    ],
  },
  {
    heading: {
      en: "14. Contact",
      is: "14. Hafa samband",
    },
    content: [
      {
        type: "paragraph",
        en: "For questions, support, or legal inquiries:",
        is: "Fyrir spurningar, aðstoð eða lagalegar fyrirspurnir:",
      },
      {
        type: "paragraph",
        en: "Songs of Life",
        is: "Songs of Life",
      },
      {
        type: "paragraph",
        en: "Email: victor@mama.is",
        is: "Netfang: victor@mama.is",
      },
    ],
  },
];

const pageTitle = {
  en: "Songs of Life – Terms of Service",
  is: "Songs of Life – Þjónustuskilmálar",
};

const welcomeText = {
  en: "Welcome to Songs of Life — a sacred space for musical learning, voice awakening, and devotional practice.",
  is: "Velkomin í Songs of Life — helgirými fyrir tónlistarnám, vöknun röddar og andlegar æfingar.",
};

const introText = {
  en: "By using the Songs of Life mobile application (the \"App\"), you agree to be bound by the following Terms of Service (\"Terms\").",
  is: "Með því að nota hreyfanlega forritið Songs of Life (\"forritið\"), samþykkir þú að vera bundinn af eftirfarandi þjónustuskilmálum (\"skilmálar\").",
};

const readCarefullyText = {
  en: "Please read them carefully.",
  is: "Vinsamlegast lestu þá vandlega.",
};

export default function ServiceContent() {
  const { language } = useLanguage();
  const isEnglish = language === "en";

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30" />
      <article className="space-y-12 rounded-3xl border border-emerald-100/70 bg-white/90 p-8 shadow-xl shadow-emerald-100/40 backdrop-blur">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
            Songs of Life
          </p>
          <h1 className="font-serif text-4xl font-semibold text-emerald-900 sm:text-5xl">
            {pageTitle[language]}
          </h1>
          <p className="text-sm text-emerald-900/70">
            {isEnglish ? "Last updated" : "Síðast uppfært"}: {LAST_UPDATED}
          </p>
        </header>

        <section className="space-y-6 text-base leading-relaxed text-emerald-900/80">
          <div className="space-y-3">
            <p className="text-lg font-medium text-emerald-900">
              {welcomeText[language]}
            </p>
            <p>{introText[language]}</p>
            <p className="font-medium">{readCarefullyText[language]}</p>
          </div>

          {sections.map((section) => (
            <div key={section.heading.en} className="space-y-4">
              <h2 className="font-serif text-2xl text-emerald-800">
                {section.heading[language]}
              </h2>
              <div className="space-y-3">
                {section.content.map((item, index) => {
                  if (item.type === "paragraph") {
                    return (
                      <p key={`${section.heading.en}-paragraph-${index}`}>
                        {item[language]}
                      </p>
                    );
                  }

                  if (item.type === "list") {
                    return (
                      <ul
                        key={`${section.heading.en}-list-${index}`}
                        className="list-disc space-y-1 pl-5 text-emerald-900/80"
                      >
                        {item.items.map((listItem, itemIndex) => (
                          <li
                            key={`${section.heading.en}-list-${index}-item-${itemIndex}`}
                          >
                            {listItem[language]}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}
        </section>
      </article>
    </div>
  );
}

