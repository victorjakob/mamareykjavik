"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export default function CacaoAbout() {
  const { language } = useLanguage();
  const [selectedSection, setSelectedSection] = useState(0); // Default to first section

  const translations = {
    en: {
      sections: [
        {
          title: "Story of Cacao",
          details: `The story of cacao begins in the ancient rainforests of Mesoamerica, where the cacao tree (Theobroma cacao, meaning "food of the gods") was revered as a sacred gift from nature. 
          The Maya and Aztec civilizations cherished cacao not as mere food but as a divine medicine and ceremonial tool.
          Cacao beans were once so valued they served as currency, traded like gold, and were believed to carry the spirit of abundance and connection. 
          The Maya used cacao in sacred ceremonies to open the heart, honor the earth, and connect to the unseen world. To them, cacao was more than nourishment—it was a teacher, awakening clarity, joy, and balance within.

A tale often shared speaks of how cacao was gifted by the gods to bring humans closer to the rhythm of nature, grounding them in their bodies while uplifting their spirits. 
The Aztecs would prepare a bitter, spiced cacao drink called "xocoatl," reserved for warriors, priests, and royalty to provide strength, vitality, and emotional clarity.

Today, cacao continues to carry this ancient wisdom. It invites us to pause, open our hearts, and embrace life with gratitude. 
As you enjoy cacao, you partake in an unbroken tradition of connection—to the earth, to yourself, and to all those who came before you.`,
        },
        {
          title: "Health Benefits & Nutrition",
          details: [
            {
              heading: "Mood and Energy",
              description:
                "Cacao contains theobromine, a mild stimulant that boosts energy without the jitters of caffeine, and phenylethylamine (PEA), known as the 'love molecule,' which promotes endorphin release, improving mood and reducing stress.",
            },
            {
              heading: "Heart Health",
              description:
                "Packed with flavanols, cacao helps lower blood pressure, improve blood flow, and increase nitric oxide production, supporting cardiovascular health and reducing inflammation.",
            },
            {
              heading: "Cognitive Function",
              description:
                "The high levels of flavanols and magnesium improve brain oxygenation, cognitive clarity, and focus, while promoting relaxation and emotional balance.",
            },
            {
              heading: "Nutrient-Rich Support",
              description:
                "Cacao is one of the best plant-based sources of magnesium, essential for muscle function, nerve health, and energy production. It also provides iron, zinc, and calcium for overall vitality.",
            },
          ],
        },
        {
          title: "How to Prepare",
          details: `Our recipe:

1. Chop down the cacao fine - we use 20-40 gr

2. add to a pot on medium/low heat, slowing adding water or plant based milk to the thickness you would like it to be.

3. Add pinches of spices like, cinnamon, cyan pepper, sea salt, turmeric, vanilla, kardamom, rose....

4. Add coconut oil and sweetener like maple syrup, coconut sugar, etc.



Make the Cup with full presence and use this time to meditate with it

Do not let the cacao boil, and it is good for the texture of the cacao to be blended in a mixer.



Set your intention and enjoy the magic.`,
        },
      ],
      recipeLabel: "Our recipe:",
      recipeSteps: [
        "Chop down the cacao fine - we use 20-40 grams.",
        "Add to a pot on medium/low heat, slowly adding water or plant-based milk to the thickness you like.",
        "Add pinches of spices like cinnamon, cayenne pepper, sea salt, turmeric, vanilla, cardamom, rose.",
        "Add coconut oil and sweeteners like maple syrup or coconut sugar.",
        "Do not let the cacao boil. Blend it in a mixer for a smoother texture.",
      ],
      meditationText:
        "Make the cup with full presence and use this time to meditate. Set your intention and enjoy the magic.",
    },
    is: {
      sections: [
        {
          title: "Saga cacao",
          details: `Saga cacao byrjar í fornum regnskógum Mesoameríku, þar sem cacao tréð (Theobroma cacao, sem þýðir "matur guðanna") var virðað sem heilagt gjöf frá náttúrunni.
          Maya og Aztec menningin dýrkaði cacao ekki sem einfaldan mat heldur sem guðdómlega lyf og athafnartól.
          Cacao baunir voru einu sinni svo metnar að þær þjónuðu sem gjaldmiðill, verslað eins og gull, og trúðu að þær beri anda auðs og tengingar.
          Maya notaði cacao í heilögum athöfnum til að opna hjartað, heiðra jörðina og tengjast ósýnilega heiminum. Fyrir þá var cacao meira en næring - það var kennari sem vaki upp skýrleika, gleði og jafnvægi innan.

Saga sem oft er deilt segir frá því hvernig cacao var gefið af guðunum til að koma mönnum nær rytmi náttúrunnar, grunna þá í líkama sínum á meðan það lyfti anda þeirra.
Aztec-ar bjuggu til bítra, kryddaða cacao drykk sem kallast "xocoatl," varðveitt fyrir hernaðarmenn, presta og konunglega til að veita styrk, lífsorka og tilfinningalegan skýrleika.

Í dag heldur cacao áfram að bera þessa fornu visku. Það býður okkur að staldra, opna hjörtu okkar og faðma lífið með þakklæti.
Þegar þú njótir cacao, tekur þú þátt í óbrotnu hefð tengingar - við jörðina, við sjálfan þig og við alla þá sem komu áður en þú.`,
        },
        {
          title: "Heilsufarslegir ávinningar og næring",
          details: [
            {
              heading: "Hugbrigði og orka",
              description:
                "Cacao inniheldur theobromine, mildt örvandi efni sem eykur orku án þess að valda óróleika eins og koffein, og phenylethylamine (PEA), þekkt sem 'ástarmólekúlinn,' sem stuðlar að endorphin losun, bætir hugbrigði og dregur úr streitu.",
            },
            {
              heading: "Hjartahælsi",
              description:
                "Fullt af flavanólum, hjálpar cacao að lækka blóðþrýsting, bæta blóðflæði og auka nitríoxíð framleiðslu, styður hjarta- og æðakerfi og dregur úr bólgu.",
            },
            {
              heading: "Vitræn virkni",
              description:
                "Háir stig flavanóla og magnesíums bæta súrefnisupptöku heilans, vitrænan skýrleika og einbeitingu, á meðan það stuðlar að slökun og tilfinningalegu jafnvægi.",
            },
            {
              heading: "Næringarrík stuðningur",
              description:
                "Cacao er einn af bestu plöntutengdum magnesíumgjöfum, nauðsynleg fyrir vöðvavirka, taugakerfi og orkuframleiðslu. Það veitir einnig járn, sink og kalsíum fyrir heildarlífsorka.",
            },
          ],
        },
        {
          title: "Hvernig á að undirbúa",
          details: `Uppskriftin okkar:

1. Sníðið cacao fínt - við notum 20-40 gr

2. bætið við í pott á mið/lág hita, bætið hægt vatni eða plöntumjólk við þykktina sem þið viljið.

3. Bætið við kryddum eins og kanill, cayenne pipar, sjávarsalt, túrmerik, vanillu, kardimomum, rós....

4. Bætið við kókosolíu og sætuefni eins og hlynsíróp, kókosykur, o.s.frv.



Gerðu bollann með fullri nærveru og notið þennan tíma til að hugleiða

Látið cacao ekki sjóða, og það er gott fyrir áferð cacao að vera bland saman í blandara.



Settu þína ásetningu og njóttu töfranna.`,
        },
      ],
      recipeLabel: "Uppskriftin okkar:",
      recipeSteps: [
        "Sníðið cacao fínt - við notum 20-40 gr.",
        "Bætið við í pott á mið/lág hita, bætið hægt vatni eða plöntumjólk við þykktina sem þið viljið.",
        "Bætið við kryddum eins og kanill, cayenne pipar, sjávarsalt, túrmerik, vanillu, kardimomum, rós.",
        "Bætið við kókosolíu og sætuefni eins og hlynsíróp eða kókosykur.",
        "Látið cacao ekki sjóða. Blandið því saman í blandara fyrir sléttari áferð.",
      ],
      meditationText:
        "Gerðu bollann með fullri nærveru og notið þennan tíma til að hugleiða. Settu þína ásetningu og njóttu töfranna.",
    },
  };

  const t = translations[language];
  const sections = t.sections;

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Section Buttons */}
      <div className="flex justify-center gap-6 flex-wrap">
        {sections.map((section, index) => (
          <motion.button
            key={index}
            onClick={() => setSelectedSection(index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`font-semibold py-3 px-6 
        rounded-md shadow-2xl inline-block text-center
        transition duration-300 ease-in-out ${
          selectedSection === index
            ? "bg-gradient-to-r from-[#ff914d] via-[#ffa866] to-[#ff914d] text-[#3a1f0f]"
            : "bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-[#E68345] hover:via-[#E89A55] hover:to-[#E68345] hover:text-[#050301]"
        }`}
          >
            {section.title}
          </motion.button>
        ))}
      </div>

      {/* Animated Content Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSection}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.8, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg text-gray-800 leading-relaxed"
        >
          <h2 className="text-3xl font-bold mb-4 text-center text-[#E68345]">
            {sections[selectedSection].title}
          </h2>

          {/* Check for specific details formatting */}
          {sections[selectedSection].title === t.sections[2].title ? (
            <div className="space-y-4">
              <p className="text-lg">
                <span className="font-semibold text-gray-700">
                  {t.recipeLabel}
                </span>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {t.recipeSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
              <p className="italic text-gray-600">{t.meditationText}</p>
            </div>
          ) : Array.isArray(sections[selectedSection].details) ? (
            <ul className="space-y-4">
              {sections[selectedSection].details.map((item, index) => (
                <li key={index}>
                  <h3 className="text-lg font-bold text-[#E68345]">
                    {item.heading}
                  </h3>
                  <p className="text-gray-700">{item.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            sections[selectedSection].details
              .split("\n")
              .map((paragraph, index) => (
                <p key={index} className="text-lg leading-loose">
                  {paragraph}
                </p>
              ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
