"use client";
import { motion } from "framer-motion";

const formats = [
  {
    id: "png",
    name: "PNG",
    description: "Transparent background, high quality",
  },
];

export default function FormatSelector({ selectedFormat, onFormatSelect }) {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-light text-gray-800 mb-6 tracking-wide">
        Download Format
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {formats.map((format) => (
          <motion.button
            key={format.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFormatSelect(format.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedFormat === format.id
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <div className="text-2xl font-light text-gray-800 mb-2 tracking-wide">
                {format.name}
              </div>
              <p className="text-xs text-gray-600">{format.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export { formats };
