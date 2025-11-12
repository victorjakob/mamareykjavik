"use client";

import { useLanguage } from "@/hooks/useLanguage";

function BilingualSection({ titleEn, titleIs, en, is }) {
  const { language } = useLanguage();
  const content = language === "en" ? en : is;
  const title = language === "en" ? titleEn : titleIs;

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-2xl text-emerald-800">{title}</h2>
      <div className="space-y-3">{content}</div>
    </section>
  );
}

export default function PrivacyContent({ lastUpdated }) {
  const { language } = useLanguage();
  const isEnglish = language === "en";

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30" />
      <article className="space-y-12 rounded-3xl border border-emerald-100/70 bg-white/90 p-8 shadow-xl shadow-emerald-100/40 backdrop-blur">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
            Mama Reykjavik & White Lotus
          </p>
          <h1 className="font-serif text-4xl font-semibold text-emerald-900 sm:text-5xl">
            {isEnglish ? "Privacy Policy" : "Persónuverndarstefna"}
          </h1>
          <p className="text-sm text-emerald-900/70">
            {isEnglish ? "Last updated" : "Síðast uppfært"}: {lastUpdated}
          </p>
        </header>

        <section className="space-y-6 text-base leading-relaxed text-emerald-900/80">
          <BilingualSection
            titleEn="Introduction"
            titleIs="Inngangur"
            en={
              <>
                <p>
                  Mama Restaurant & White Lotus (“we”, “our”, or “us”) is committed to
                  protecting your privacy. This Privacy Policy explains how we collect,
                  use, and safeguard your information when you visit our website.
                </p>
              </>
            }
            is={
              <>
                <p>
                  Mama Restaurant & White Lotus („við“, „okkar“ eða „oss“) leggur mikla áherslu
                  á að vernda friðhelgi þína. Þessi persónuverndarstefna útskýrir hvernig við
                  söfnum, notum og verndum upplýsingar þegar þú heimsækir vefsíðu okkar.
                </p>
              </>
            }
          />

          <div className="rounded-2xl border border-emerald-100/70 bg-emerald-50/50 p-6">
            <BilingualSection
              titleEn="Information We Collect"
              titleIs="Upplýsingar sem við söfnum"
              en={
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-emerald-900">Personal Information</h3>
                    <p>
                      We may collect personal information such as your name, email address,
                      phone number, and payment information when you make reservations,
                      purchase tickets, or contact us.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">Usage Information</h3>
                    <p>
                      We collect information about how you interact with our website,
                      including pages visited, time spent on pages, and referring websites.
                    </p>
                  </div>
                </div>
              }
              is={
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-emerald-900">Persónuupplýsingar</h3>
                    <p>
                      Við gætum safnað persónuupplýsingum eins og nafni, netfangi, símanúmeri
                      og greiðsluupplýsingum þegar þú pantar borð, kaupir miða eða hefur samband
                      við okkur.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900">Notkunarupplýsingar</h3>
                    <p>
                      Við söfnum upplýsingum um hvernig þú notar vefsíðuna, þar með talið hvaða
                      síður þú heimsækir, hve lengi þú dvelur á þeim og hvaðan þú kemur inn á
                      síðuna.
                    </p>
                  </div>
                </div>
              }
            />
          </div>

          <BilingualSection
            titleEn="How We Use Your Information"
            titleIs="Hvernig við notum upplýsingarnar þínar"
            en={
              <ul className="list-disc space-y-2 pl-6">
                <li>To provide and maintain our services</li>
                <li>To process reservations and ticket purchases</li>
                <li>To communicate with you about events and services</li>
                <li>To improve our website and user experience</li>
                <li>To comply with legal obligations</li>
              </ul>
            }
            is={
              <ul className="list-disc space-y-2 pl-6">
                <li>Til að veita og viðhalda þjónustu okkar</li>
                <li>Til að vinna úr borðapöntunum og miðakaupum</li>
                <li>Til að hafa samband við þig varðandi viðburði og þjónustu</li>
                <li>Til að bæta vefsíðu okkar og notendaupplifun</li>
                <li>Til að uppfylla lagalegar skyldur</li>
              </ul>
            }
          />

          <BilingualSection
            titleEn="Cookies & Tracking Technologies"
            titleIs="Vafrakökur og rekningartækni"
            en={
              <>
                <p>
                  We use cookies and similar technologies to enhance your experience on our
                  website. You can control your cookie preferences through our cookie
                  consent banner.
                </p>
                <div className="rounded-2xl border border-emerald-100/70 bg-white/80 p-5">
                  <h3 className="font-semibold text-emerald-900">
                    Types of Cookies We Use
                  </h3>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>
                      <strong>Essential Cookies:</strong> Required for basic website
                      functionality.
                    </li>
                    <li>
                      <strong>Analytics Cookies:</strong> Help us understand website usage
                      (Google Analytics, Vercel Analytics).
                    </li>
                    <li>
                      <strong>Functional Cookies:</strong> Remember your preferences and
                      cart items.
                    </li>
                  </ul>
                </div>
              </>
            }
            is={
              <>
                <p>
                  Við notum vafrakökur (cookies) og sambærilega tækni til að bæta upplifun
                  þína á vefsíðunni. Þú getur stýrt stillingum fyrir vafrakökur í gegnum
                  samtykkisglugga sem birtist á síðunni.
                </p>
                <div className="rounded-2xl border border-emerald-100/70 bg-white/80 p-5">
                  <h3 className="font-semibold text-emerald-900">
                    Tegundir vafrakaka sem við notum
                  </h3>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>
                      <strong>Nauðsynlegar kökur:</strong> Nauðsynlegar fyrir grunnvirkni
                      vefsins.
                    </li>
                    <li>
                      <strong>Greiningarkökur:</strong> Hjálpa okkur að skilja notkun
                      vefsins (Google Analytics, Vercel Analytics).
                    </li>
                    <li>
                      <strong>Virkni kökur:</strong> Muna stillingar þínar og innihald í
                      körfu.
                    </li>
                  </ul>
                </div>
              </>
            }
          />

          <BilingualSection
            titleEn="Data Sharing & Disclosure"
            titleIs="Miðlun og afhending gagna"
            en={
              <>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to
                  third parties, except as described in this policy or with your consent.
                </p>
                <p>
                  We may share information with trusted third-party service providers who
                  assist us in operating our website, conducting business, or serving you.
                </p>
              </>
            }
            is={
              <>
                <p>
                  Við seljum ekki, skiptum eða afhendum persónuupplýsingar þínar til þriðja
                  aðila nema samkvæmt þessari stefnu eða með þínu samþykki.
                </p>
                <p>
                  Við gætum þó deilt upplýsingum með traustum þjónustuaðilum sem aðstoða okkur
                  við rekstur vefsins, rekstrarstarfsemi eða þjónustu við þig.
                </p>
              </>
            }
          />

          <BilingualSection
            titleEn="Data Security"
            titleIs="Öryggi gagna"
            en={
              <p>
                We implement appropriate security measures to protect your personal
                information against unauthorized access, alteration, disclosure, or
                destruction.
              </p>
            }
            is={
              <p>
                Við notum viðeigandi öryggisráðstafanir til að vernda persónuupplýsingar
                þínar gegn ólögmætri aðgangi, breytingum, birtingu eða eyðingu.
              </p>
            }
          />

          <BilingualSection
            titleEn="Your Rights"
            titleIs="Réttindi þín"
            en={
              <>
                <p>You have the right to:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Withdraw consent for data processing</li>
                  <li>Manage your cookie preferences</li>
                </ul>
              </>
            }
            is={
              <>
                <p>Þú átt rétt á að:</p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Fá aðgang að þínum eigin persónuupplýsingum</li>
                  <li>Leiðrétta rangar eða ófullnægjandi upplýsingar</li>
                  <li>Krefjast þess að upplýsingum sé eytt</li>
                  <li>Draga til baka samþykki fyrir vinnslu gagna</li>
                  <li>Stjórna stillingum fyrir vafrakökur</li>
                </ul>
              </>
            }
          />

          <BilingualSection
            titleEn="Contact Us"
            titleIs="Hafa samband"
            en={
              <>
                <p>
                  If you have questions about this Privacy Policy or our data practices,
                  please contact us:
                </p>
                <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/70 p-5">
                  <p className="space-y-1">
                    <span className="block">
                      <strong>Email:</strong> team@mama.is
                    </span>
                    <span className="block">
                      <strong>Phone:</strong> +354 766 6262
                    </span>
                    <span className="block">
                      <strong>Address:</strong> Mama Restaurant, Reykjavik, Iceland
                    </span>
                  </p>
                </div>
              </>
            }
            is={
              <>
                <p>
                  Ef þú hefur spurningar um þessa persónuverndarstefnu eða vinnslu
                  persónuupplýsinga, vinsamlegast hafðu samband við okkur:
                </p>
                <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/70 p-5">
                  <p className="space-y-1">
                    <span className="block">
                      <strong>Netfang:</strong> team@mama.is
                    </span>
                    <span className="block">
                      <strong>Sími:</strong> +354 766 6262
                    </span>
                    <span className="block">
                      <strong>Heimilisfang:</strong> Mama Restaurant, Reykjavík, Ísland
                    </span>
                  </p>
                </div>
              </>
            }
          />

          <BilingualSection
            titleEn="Changes to This Policy"
            titleIs="Breytingar á þessari stefnu"
            en={
              <p>
                We may update this Privacy Policy from time to time. We will notify you of
                any changes by posting the new Privacy Policy on this page and updating the
                “Last updated” date.
              </p>
            }
            is={
              <p>
                Við gætum uppfært þessa persónuverndarstefnu af og til. Við munum tilkynna
                um slíkar breytingar með því að birta uppfærða útgáfu hér á síðunni og
                breyta dagsetningu „Síðast uppfært“.
              </p>
            }
          />
        </section>
      </article>
    </div>
  );
}

