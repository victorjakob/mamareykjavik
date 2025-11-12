"use client";

import { useLanguage } from "@/hooks/useLanguage";

export const metadata = {
  title: "Mama Store – Terms & Conditions / Skilmálar og skilyrði",
  description:
    "Bilingual (EN/IS) overview of Mama Store’s mission, ordering, payments, shipping, returns, privacy, and contact details. Updated November 12, 2025.",
  alternates: {
    canonical: "https://mama.is/policies/store",
  },
};

const sections = [
  {
    heading: {
      en: "1. Our Mission",
      is: "1. Markmið okkar",
    },
    content: [
      {
        type: "paragraph",
        en: "Mama Store offers soulful, nature-inspired products such as ceremonial cacao, sacred tools, handmade goods, and wellness items.",
        is: "Mama Store býður upp á vörur sem tengjast náttúru, helgi og vellíðan — svo sem helgikakó, handunnar vörur, helgigripi og aðra lífstílsvöru.",
      },
      {
        type: "paragraph",
        en: "We operate with care, transparency, and deep respect for nature, our community, and every customer we serve.",
        is: "Við vinnum með alúð, gagnsæi og djúpri virðingu fyrir náttúrunni, samfélaginu og hverjum viðskiptavini.",
      },
    ],
  },
  {
    heading: {
      en: "2. General Terms",
      is: "2. Almennir skilmálar",
    },
    content: [
      {
        type: "paragraph",
        en: "By placing an order on our website, you agree to these Terms and Conditions.",
        is: "Með því að leggja inn pöntun á vef okkar samþykkir þú þessa skilmála.",
      },
      {
        type: "paragraph",
        en: "Mama Store reserves the right to cancel any order suspected of being intended for resale or misuse. Such orders will be fully refunded.",
        is: "Mama Store áskilur sér rétt til að hafna pöntunum sem grunaðar eru um endursölu eða misnotkun. Slíkar pantanir verða endurgreiddar að fullu.",
      },
      {
        type: "paragraph",
        en: "All prices are listed in Icelandic krónur (ISK) and include VAT unless stated otherwise.",
        is: "Öll verð eru í íslenskum krónum (ISK) og innihalda virðisaukaskatt nema annað sé tekið fram.",
      },
    ],
  },
  {
    heading: {
      en: "3. Order Processing",
      is: "3. Afgreiðsla pöntunar",
    },
    content: [
      {
        type: "paragraph",
        en: "We strive to process and ship your order as quickly as possible.",
        is: "Við kappkostum að afgreiða pantanir eins fljótt og auðið er.",
      },
      {
        type: "paragraph",
        en: "Orders are generally dispatched within 2–3 business days after full payment has been received.",
        is: "Pantanir eru yfirleitt sendar út innan 2–3 virkra daga eftir að greiðsla hefur borist að fullu.",
      },
      {
        type: "paragraph",
        en: "If a product is out of stock, we will contact you promptly to offer alternatives or a full refund.",
        is: "Ef vara er ekki til á lager munum við hafa samband við þig eins fljótt og auðið er og bjóða upp á valkosti eða fulla endurgreiðslu.",
      },
      {
        type: "paragraph",
        en: "No order is shipped until payment has been confirmed in full.",
        is: "Engin pöntun er send út fyrr en hún hefur verið greidd að fullu.",
      },
    ],
  },
  {
    heading: {
      en: "4. Payment Options",
      is: "4. Greiðslumöguleikar",
    },
    content: [
      {
        type: "paragraph",
        en: "You may complete your purchase using the payment methods shown at checkout, such as:",
        is: "Greiða má fyrir pöntun með þeim greiðslumátum sem birtast við greiðsluferlið, svo sem:",
      },
      {
        type: "list",
        items: [
          {
            en: "Credit/debit cards",
            is: "Kredit- eða debetkortum",
          },
          {
            en: "Online payment platforms (e.g., Apple Pay and more in the future)",
            is: "Rafrænum greiðslumiðlum (t.d. Apple Pay og fleiri í framtíðinni)",
          },
          {
            en: "Bank transfer (details provided at checkout if applicable)",
            is: "Millifærslu (upplýsingar veittar við greiðslu ef við á)",
          },
        ],
      },
      {
        type: "paragraph",
        en: "All transactions are processed securely, and Mama Store never stores your card details.",
        is: "Allar færslur eru öruggar og Mama Store geymir aldrei kortaupplýsingar.",
      },
    ],
  },
  {
    heading: {
      en: "5. Shipping & Delivery",
      is: "5. Sendingar og afhending",
    },
    content: [
      {
        type: "paragraph",
        en: "Mama Store ships orders across Iceland using trusted carriers such as Dropp and Pósturinn.",
        is: "Mama Store sendir vörur um allt land með traustum flutningsaðilum eins og Dropp og Pósturinn.",
      },
      {
        type: "paragraph",
        en: "Dropp: Home delivery or pickup points nationwide. Typical delivery time is 1–2 days.",
        is: "Dropp: Heimkeyrsla eða afhending í póstbox um land allt. Venjulegur afhendingartími er 1–2 dagar.",
      },
      {
        type: "paragraph",
        en: "Pósturinn: Used for areas outside Dropp’s coverage or as a customer preference.",
        is: "Pósturinn: Notaður fyrir svæði utan þjónustusvæðis Dropp eða ef viðskiptavinur kýs það sérstaklega.",
      },
      {
        type: "paragraph",
        en: "Shipping costs are displayed during checkout and paid together with your order.",
        is: "Sendingarkostnaður birtist við greiðslu og er greiddur samhliða pöntuninni.",
      },
      {
        type: "paragraph",
        en: "We are not responsible for lost or damaged packages once they have been handed to the carrier, but we will always assist in tracking and resolving any issues.",
        is: "Við berum ekki ábyrgð á sendingum eftir að þær hafa verið afhentar flutningsaðila, en við munum ávallt aðstoða við að rekja og leysa úr málum ef eitthvað fer úrskeiðis.",
      },
    ],
  },
  {
    heading: {
      en: "6. Returns & Refunds",
      is: "6. Skil og endurgreiðslur",
    },
    content: [
      {
        type: "paragraph",
        en: "We want you to be happy with your purchase. However, due to the nature of our products, some restrictions apply:",
        is: "Við viljum að þú sért ánægð/ur með kaupin þín. Þar sem sumar vörur eru viðkvæmar eða handunnar gilda þó eftirfarandi reglur:",
      },
      {
        type: "list",
        items: [
          {
            en: "Unsealed or used products cannot be returned for hygiene and safety reasons.",
            is: "Opnum eða notuðum vörum er ekki hægt að skila af hreinlætis- og öryggisástæðum.",
          },
          {
            en: "Unopened, unused items in their original packaging may be returned within 15 days of delivery with proof of purchase.",
            is: "Óopnaðar og ónotaðar vörur í upprunalegum umbúðum má skila innan 15 daga frá móttöku gegn framvísun kvittunar.",
          },
          {
            en: "You may choose a replacement or store credit.",
            is: "Viðskiptavinur getur valið að fá nýja vöru eða inneign.",
          },
          {
            en: "Refunds are processed within 5–10 business days after inspection.",
            is: "Endurgreiðslur eru lagðar inn á sama greiðslumáta innan 5–10 virkra daga eftir skoðun.",
          },
          {
            en: "Return shipping costs are paid by the customer unless the product is defective or incorrect.",
            is: "Kostnaður við skil er greiddur af viðskiptavini nema um gallaða eða ranga vöru sé að ræða.",
          },
        ],
      },
      {
        type: "paragraph",
        en: "If you believe your item is defective or damaged, please contact us immediately at team@mama.is with photos and order details — we’ll make it right.",
        is: "Ef þú telur að varan sé gölluð eða hafi skemmst í sendingu, vinsamlegast hafðu samband við okkur strax á team@mama.is með ljósmyndum og upplýsingum um pöntunina — við munum bæta úr.",
      },
    ],
  },
  {
    heading: {
      en: "7. Privacy & Data Protection",
      is: "7. Persónuvernd",
    },
    content: [
      {
        type: "paragraph",
        en: "Your trust is important to us.",
        is: "Trúnaður og öryggi þitt er okkur mikilvægt.",
      },
      {
        type: "paragraph",
        en: "All personal information is handled in accordance with Icelandic and EU privacy laws (GDPR).",
        is: "Allar persónuupplýsingar eru meðhöndlaðar í samræmi við íslensk og evrópsk persónuverndarlög (GDPR).",
      },
      {
        type: "paragraph",
        en: "We never share your data with third parties except as necessary to process orders and payments.",
        is: "Við deilum aldrei upplýsingum þínum með þriðja aðila nema það sé nauðsynlegt til að ljúka greiðslu eða sendingu.",
      },
    ],
  },
  {
    heading: {
      en: "8. Product Information & Responsibility",
      is: "8. Vöruupplýsingar og ábyrgð",
    },
    content: [
      {
        type: "paragraph",
        en: "We take great care to ensure product descriptions and images are accurate.",
        is: "Við leggjum mikla áherslu á að allar vörulýsingar og myndir séu réttar.",
      },
      {
        type: "paragraph",
        en: "Mama Store is not responsible for natural variations in handmade items.",
        is: "Mama Store ber ekki ábyrgð á lit- eða stærðarbreytingum sem geta orðið vegna handverks eða náttúrulegs eðlis vara.",
      },
      {
        type: "paragraph",
        en: "Please handle all products mindfully and follow any care instructions provided.",
        is: "Vinsamlegast meðhöndlaðu vörur af alúð og fylgdu leiðbeiningum um umhirðu ef þær fylgja með.",
      },
    ],
  },
  {
    heading: {
      en: "9. Intellectual Property",
      is: "9. Höfundarréttur",
    },
    content: [
      {
        type: "paragraph",
        en: "All content on mama.is — including text, images, product descriptions, and designs — is the property of Mama Reykjavík ehf. and may not be copied or used without written permission.",
        is: "Allt efni á vefsíðu mama.is — þar með talið texti, myndir, vörulýsingar og hönnun — er eign Mama Reykjavík ehf. og má ekki afrita eða nota án skriflegs leyfis.",
      },
    ],
  },
  {
    heading: {
      en: "10. Governing Law",
      is: "10. Lögsaga",
    },
    content: [
      {
        type: "paragraph",
        en: "These Terms are governed by the laws of Iceland.",
        is: "Þessir skilmálar lúta lögsögu Íslands.",
      },
      {
        type: "paragraph",
        en: "Any legal disputes will be handled by the District Court of Reykjavík (Héraðsdómur Reykjavíkur).",
        is: "Komist til málaferla skal reka þau fyrir Héraðsdómi Reykjavíkur.",
      },
    ],
  },
  {
    heading: {
      en: "11. Contact",
      is: "11. Hafa samband",
    },
    content: [
      {
        type: "paragraph",
        en: "Mama Store / Mama Reykjavík ehf.",
        is: "Mama Store / Mama Reykjavík ehf.",
      },
      {
        type: "paragraph",
        en: "📍 Bankastræti 2, 101 Reykjavík, Iceland",
        is: "📍 Bankastræti 2, 101 Reykjavík, Ísland",
      },
      {
        type: "paragraph",
        en: "📞 +354 766 6262",
        is: "📞 +354 766 6262",
      },
      {
        type: "paragraph",
        en: "✉️ team@mama.is",
        is: "✉️ team@mama.is",
      },
      {
        type: "paragraph",
        en: "🌐 www.mama.is/store",
        is: "🌐 www.mama.is/store",
      },
    ],
  },
];

const headerDetails = [
  {
    en: "Last updated: November 12, 2025",
    is: "Síðast uppfært: November 12, 2025",
  },
  {
    en: "Operator: Mama Reykjavík ehf.",
    is: "Rekstraraðili: Mama Reykjavík ehf.",
  },
  {
    en: "Address: Bankastræti 2, 101 Reykjavík, Iceland",
    is: "Heimilisfang: Bankastræti 2, 101 Reykjavík, Ísland",
  },
  {
    en: "Email: team@mama.is",
    is: "Netfang: team@mama.is",
  },
  {
    en: "Website: www.mama.is/store",
    is: "Vefsíða: www.mama.is/store",
  },
];

const pageTitle = {
  en: "Terms & Conditions",
  is: "Skilmálar og skilyrði",
};

export default function StorePolicyPage() {
  const { language } = useLanguage();

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30" />
      <article className="space-y-12 rounded-3xl border border-emerald-100/70 bg-white/90 p-8 shadow-xl shadow-emerald-100/40 backdrop-blur">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
            Mama Store
          </p>
          <h1 className="font-serif text-4xl font-semibold text-emerald-900 sm:text-5xl">
            {pageTitle[language]}
          </h1>
          <div className="space-y-1 text-sm text-emerald-900/70">
            {headerDetails.map((detail) => (
              <p key={detail.en}>{detail[language]}</p>
            ))}
          </div>
        </header>

        <section className="space-y-6 text-base leading-relaxed text-emerald-900/80">
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
