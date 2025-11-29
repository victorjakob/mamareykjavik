"use client";

import { useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";

const LAST_UPDATED = "November 12, 2025";

const translations = {
  header: {
    label: {
      en: "Mama Reykjavik & White Lotus",
      is: "Mama Reykjavik & White Lotus",
    },
    title: {
      en: "Terms of Service",
      is: "Skilmálar þjónustu",
    },
    lastUpdatedPrefix: {
      en: "Last updated",
      is: "Síðast uppfært",
    },
  },
  sections: [
    {
      id: "acceptance",
      heading: {
        en: "1. Acceptance of Terms",
        is: "1. Samþykki skilmála",
      },
      body: {
        en: [
          "By accessing and using the Mama Restaurant & White Lotus website, you accept and agree to be bound by the terms and provisions of this agreement.",
        ],
        is: [
          "Með því að nota vefsíðu Mama Restaurant & White Lotus samþykkir þú að fylgja þeim skilmálum og ákvæðum sem fram koma í þessum samningi.",
        ],
      },
    },
    {
      id: "license",
      heading: {
        en: "2. Use License",
        is: "2. Notkunarleyfi",
      },
      body: {
        en: [
          "Permission is granted to temporarily download one copy of the materials (information or software) on Mama Restaurant & White Lotus’s website for personal, non-commercial transitory viewing only.",
          "This is the grant of a license, not a transfer of title, and under this license you may not:",
        ],
        is: [
          "Leyfi er veitt til að hlaða tímabundið niður einu eintaki af efni (upplýsingum eða hugbúnaði) af vefsíðu Mama Restaurant & White Lotus til einkanota og tímabundinnar skoðunar.",
          "Þetta er veitt sem notkunarleyfi, ekki eignarflutningur, og samkvæmt leyfinu er ekki heimilt að:",
        ],
      },
      list: {
        en: [
          "Modify or copy the materials",
          "Use the materials for any commercial purpose or for any public display",
          "Attempt to reverse engineer any software contained on the website",
          "Remove any copyright or other proprietary notations from the materials",
        ],
        is: [
          "Breyta eða afrita efnið",
          "Nota efnið í viðskiptalegum tilgangi eða til opinberrar birtingar",
          "Reyna að bakfæra eða greina hugbúnað sem vefurinn inniheldur",
          "Fjarlægja höfundarrétt eða aðrar eignarmerkingar af efninu",
        ],
      },
      cardClassName: "bg-emerald-50/60",
    },
    {
      id: "services",
      heading: {
        en: "3. Services",
        is: "3. Þjónusta",
      },
      subsections: [
        {
          title: {
            en: "Restaurant Services",
            is: "Veitingaþjónusta",
          },
          body: {
            en: [
              "We provide restaurant dining services, including table reservations and food ordering. All reservations are subject to availability and our cancellation policy.",
            ],
            is: [
              "Við bjóðum upp á veitingaþjónustu á staðnum, þar með talið borðapantanir og matarpantanir. Allar pantanir eru háðar framboði og afbókunarreglum okkar.",
            ],
          },
        },
        {
          title: {
            en: "Event Services",
            is: "Viðburðaþjónusta",
          },
          body: {
            en: [
              "We offer event hosting and ticket sales for various events. All ticket sales are final unless otherwise specified in the event description.",
            ],
            is: [
              "Við bjóðum upp á leigu á sal og miðasölu fyrir viðburði. All miðasala er endanleg nema annað sé tekið fram í lýsingu viðburðarins.",
            ],
          },
        },
        {
          title: {
            en: "Online Store",
            is: "Vefverslun",
          },
          body: {
            en: [
              "Our online store sells various products. All purchases are subject to our return and refund policies.",
            ],
            is: [
              "Vefverslun okkar selur ýmsar vörur. All kaup eru háð skilareglum og endurgreiðslustefnu okkar.",
            ],
          },
        },
      ],
    },
    {
      id: "accounts",
      heading: {
        en: "4. User Accounts",
        is: "4. Notandareikningar",
      },
      body: {
        en: [
          "When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding your account credentials and for all activities that occur under your account.",
        ],
        is: [
          "Þegar þú stofnar notandareikning hjá okkur þarftu að gefa upp réttar og fullnægjandi upplýsingar. Þú berð ábyrgð á að geyma innskráningarupplýsingar þínar á öruggan hátt og berð ábyrgð á allri notkun sem á sér stað undir þínum reikningi.",
        ],
      },
    },
    {
      id: "payment",
      heading: {
        en: "5. Payment & Billing",
        is: "5. Greiðslur og reikningagerð",
      },
      body: {
        en: [
          "All payments must be made in full at the time of booking or purchase. We accept various payment methods as indicated during checkout. Prices are subject to change without notice.",
        ],
        is: [
          "Allar greiðslur verða að fara fram að fullu við bókun eða kaup. Við tökum við ýmsum greiðslumátum eins og fram kemur við greiðsluferlið. Verð geta breyst án fyrirvara.",
        ],
      },
    },
    {
      id: "cancellation",
      heading: {
        en: "6. Cancellation & Refunds",
        is: "6. Afbókanir og endurgreiðslur",
      },
      body: {
        en: [
          "Cancellation policies vary by service type. Please refer to specific service descriptions for cancellation terms. Refunds are processed according to our refund policy and may take 5–10 business days.",
        ],
        is: [
          "Afbókunarreglur eru mismunandi eftir þjónustuflokki. Vinsamlegast skoðaðu lýsingu viðkomandi þjónustu til að sjá nánari skilmála. Endurgreiðslur fara fram samkvæmt endurgreiðslustefnu okkar og geta tekið 5–10 virka daga.",
        ],
      },
    },
    {
      id: "privacy",
      heading: {
        en: "7. Privacy & Data Protection",
        is: "7. Persónuvernd og gagnavarsla",
      },
      body: {
        en: [
          "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, to understand our practices regarding the collection and use of your information.",
        ],
        is: [
          "Persónuvernd þín er okkur mikilvæg. Vinsamlegast lestu persónuverndarstefnu okkar sem gildir einnig um notkun á vefsíðunni til að skilja hvernig við söfnum og notum upplýsingar.",
        ],
      },
    },
    {
      id: "ip",
      heading: {
        en: "8. Intellectual Property",
        is: "8. Hugverkaréttur",
      },
      body: {
        en: [
          "The website and its original content, features, and functionality are owned by Mama Restaurant & White Lotus and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.",
        ],
        is: [
          "Vefsíðan og allt upprunalegt efni hennar, virkni og eiginleikar eru í eigu Mama Restaurant & White Lotus og njóta verndar samkvæmt alþjóðlegum höfundarréttar-, vörumerkja- og hugverkalögum.",
        ],
      },
    },
    {
      id: "liability",
      heading: {
        en: "9. Limitation of Liability",
        is: "9. Takmörkun ábyrgðar",
      },
      body: {
        en: [
          "In no event shall Mama Restaurant & White Lotus, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.",
        ],
        is: [
          "Mama Restaurant & White Lotus eða stjórnendur, starfsmenn, samstarfsaðilar, birgjar eða tengdir aðilar bera enga ábyrgð á óbeinum, tilfallandi, sértækum eða afleiddum tjónum af neinu tagi.",
        ],
      },
    },
    {
      id: "law",
      heading: {
        en: "10. Governing Law",
        is: "10. Lögsaga",
      },
      body: {
        en: [
          "These Terms shall be interpreted and governed by the laws of Iceland, without regard to its conflict of law provisions.",
        ],
        is: [
          "Þessir skilmálar skulu túlkaðir og lúta lögsögu Íslands, án tillits til árekstra í lögum eða lagaákvæðum annarra ríkja.",
        ],
      },
    },
    {
      id: "changes",
      heading: {
        en: "11. Changes to Terms",
        is: "11. Breytingar á skilmálum",
      },
      body: {
        en: [
          "We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days’ notice prior to any new terms taking effect.",
        ],
        is: [
          "Við áskiljum okkur rétt til að breyta eða endurskoða þessa skilmála hvenær sem er. Ef breytingar eru verulegar munum við tilkynna þær með minnst 30 daga fyrirvara áður en þær taka gildi.",
        ],
      },
    },
    {
      id: "contact",
      heading: {
        en: "12. Contact Information",
        is: "12. Hafa samband",
      },
      body: {
        en: [
          "If you have any questions about these Terms of Service, please contact us:",
        ],
        is: [
          "Ef þú hefur einhverjar spurningar varðandi þessa skilmála, vinsamlegast hafðu samband:",
        ],
      },
      contactInfo: [
        {
          label: {
            en: "Email",
            is: "Netfang",
          },
          value: "team@mama.is",
        },
        {
          label: {
            en: "Phone",
            is: "Sími",
          },
          value: "+354 766 6262",
        },
        {
          label: {
            en: "Address",
            is: "Heimilisfang",
          },
          value: "Mama Restaurant, Reykjavik, Iceland",
        },
      ],
      cardClassName: "bg-emerald-50/60",
    },
  ],
};

export default function TermsContent() {
  const { language, isLoaded } = useLanguage();
  const currentLanguage = language === "is" ? "is" : "en";

  const header = translations.header;
  const sections = translations.sections;

  const skeleton = useMemo(
    () => (
      <div className="space-y-8 animate-pulse text-emerald-900/40">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-4 w-48 rounded-full bg-emerald-100/70" />
          <div className="mx-auto h-10 w-64 rounded-full bg-emerald-100/70" />
          <div className="mx-auto h-4 w-56 rounded-full bg-emerald-100/70" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-emerald-100/60 p-6">
              <div className="h-6 w-48 rounded-full bg-emerald-100/70" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-emerald-100/70" />
                <div className="h-4 w-5/6 rounded-full bg-emerald-100/70" />
                <div className="h-4 w-4/5 rounded-full bg-emerald-100/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    []
  );

  if (!isLoaded) {
    return skeleton;
  }

  return (
    <div className="space-y-12 text-base leading-relaxed text-emerald-900/80">
      <header className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
          {header.label[currentLanguage]}
        </p>
        <h1 className="font-serif text-4xl font-semibold text-emerald-900 sm:text-5xl">
          {header.title[currentLanguage]}
        </h1>
        <p className="text-sm text-emerald-900/70">
          {header.lastUpdatedPrefix[currentLanguage]}: {LAST_UPDATED}
        </p>
      </header>

      <section className="space-y-10">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`space-y-3 ${
              section.cardClassName
                ? `rounded-2xl border border-emerald-100/70 p-6 ${section.cardClassName}`
                : ""
            }`}
          >
            <h2 className="font-serif text-2xl text-emerald-800">
              {section.heading[currentLanguage]}
            </h2>

            {"subsections" in section ? (
              <div className="grid gap-4">
                {section.subsections?.map((subsection) => (
                  <div
                    key={subsection.title.en}
                    className="rounded-2xl border border-emerald-100/60 bg-white/70 p-5"
                  >
                    <h3 className="font-semibold text-emerald-900">
                      {subsection.title[currentLanguage]}
                    </h3>
                    <div className="space-y-2">
                      {subsection.body[currentLanguage].map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {section.body[currentLanguage].map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}

            {section.list && (
              <ul className="list-disc space-y-2 pl-6">
                {section.list[currentLanguage].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}

            {section.contactInfo && (
              <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/70 p-5">
                <div className="space-y-1">
                  {section.contactInfo.map((info) => (
                    <p key={info.value}>
                      <strong>{info.label[currentLanguage]}:</strong> {info.value}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}



