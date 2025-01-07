"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const sections = [
  {
    title: "Story of Cacao",
    details: `The story of cacao begins in the ancient rainforests of Mesoamerica, where the cacao tree (Theobroma cacao, meaning “food of the gods”) was revered as a sacred gift from nature. 
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
          "Cacao contains theobromine, a mild stimulant that boosts energy without the jitters of caffeine, and phenylethylamine (PEA), known as the “love molecule,” which promotes endorphin release, improving mood and reducing stress.",
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
];

export default function CacaoAbout() {
  const [selectedSection, setSelectedSection] = useState(sections[0]); // Default to first section

  return (
    <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Section Buttons */}
      <div className="flex justify-center gap-6 flex-wrap">
        {sections.map((section, index) => (
          <motion.button
            key={index}
            onClick={() => setSelectedSection(section)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`font-semibold py-3 px-6 
        rounded-md shadow-2xl inline-block text-center
        transition duration-300 ease-in-out ${
          selectedSection.title === section.title
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
          key={selectedSection.title}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.8, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg text-gray-800 leading-relaxed"
        >
          <h2 className="text-3xl font-bold mb-4 text-center text-[#E68345]">
            {selectedSection.title}
          </h2>

          {/* Check for specific details formatting */}
          {selectedSection.title === "How to Prepare" ? (
            <div className="space-y-4">
              <p className="text-lg">
                <span className="font-semibold text-gray-700">Our recipe:</span>
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Chop down the cacao fine - we use 20-40 grams.</li>
                <li>
                  Add to a pot on medium/low heat, slowly adding water or
                  plant-based milk to the thickness you like.
                </li>
                <li>
                  Add pinches of spices like cinnamon, cayenne pepper, sea salt,
                  turmeric, vanilla, cardamom, rose.
                </li>
                <li>
                  Add coconut oil and sweeteners like maple syrup or coconut
                  sugar.
                </li>
                <li>
                  Do not let the cacao boil. Blend it in a mixer for a smoother
                  texture.
                </li>
              </ul>
              <p className="italic text-gray-600">
                Make the cup with full presence and use this time to meditate.
                Set your intention and enjoy the magic.
              </p>
            </div>
          ) : Array.isArray(selectedSection.details) ? (
            <ul className="space-y-4">
              {selectedSection.details.map((item, index) => (
                <li key={index}>
                  <h3 className="text-lg font-bold text-[#E68345]">
                    {item.heading}
                  </h3>
                  <p className="text-gray-700">{item.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            selectedSection.details.split("\n").map((paragraph, index) => (
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
