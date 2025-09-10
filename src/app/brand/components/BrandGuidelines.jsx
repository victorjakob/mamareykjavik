"use client";
import { motion } from "framer-motion";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

const brandGuidelines = [
  {
    title: "Logo Usage",
    content:
      "Always maintain clear space around the logo equal to the height of the 'M' in Mama or the lotus flower in White Lotus. Never stretch, distort, or modify the logo colors.",
  },
  {
    title: "Color Usage",
    content:
      "Use primary colors for main elements and secondary colors for accents. Maintain sufficient contrast for accessibility. Never use colors that clash with the brand palette.",
  },
  {
    title: "Typography",
    content:
      "Use the specified brand fonts consistently. Playfair Display for headlines and Source Sans Pro for body text. Maintain proper hierarchy and spacing.",
  },
  {
    title: "Imagery",
    content:
      "Use high-quality, authentic photos that reflect the brand values. Avoid stock photos that feel generic. Maintain consistent visual style across all materials.",
  },
];

export default function BrandGuidelines() {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-light text-gray-800 mb-6 flex items-center gap-2 tracking-wide">
        <DocumentTextIcon className="h-6 w-6 text-orange-500" />
        Brand Guidelines
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brandGuidelines.map((guideline, index) => (
          <motion.div
            key={guideline.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h4 className="text-lg font-light text-gray-800 mb-3 tracking-wide">
              {guideline.title}
            </h4>
            <p className="text-gray-600 leading-relaxed">{guideline.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export { brandGuidelines };
