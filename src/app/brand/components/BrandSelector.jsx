"use client";
import { motion } from "framer-motion";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

const brands = {
  mama: {
    name: "Mama Restaurant",
    description: "True Wealth is in your Health",
    primaryColor: "#EA580C", // Orange
    secondaryColor: "#16A34A", // Green
    logo: "/images/mama-logo.png", // You'll need to add this
    tagline: "In honour to mother earth",
  },
  whitelotus: {
    name: "White Lotus Venue",
    description: "Bridge between cultures",
    primaryColor: "#7C3AED", // Purple
    secondaryColor: "#F59E0B", // Amber
    logo: "/images/white-lotus-logo.png", // You'll need to add this
    tagline: "Community sharings",
  },
};

export default function BrandSelector({ selectedBrand, onBrandSelect }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-12">
      {Object.entries(brands).map(([key, brand]) => (
        <motion.button
          key={key}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onBrandSelect(key)}
          className={`flex-1 p-6 rounded-2xl border-2 transition-all duration-200 ${
            selectedBrand === key
              ? "border-orange-500 bg-orange-50 shadow-lg"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center overflow-hidden">
              {key === "mama" ? (
                <img
                  src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1756674800/MamaFINAL_blrlme.png"
                  alt={`${brand.name} Logo`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Image
                  src="/whitelotus/whitelotuslogo.png"
                  width={100}
                  height={100}
                  alt={`${brand.name} Logo`}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            <h3 className="text-lg font-light text-gray-800 mb-2 tracking-wide">
              {brand.name}
            </h3>
            <p className="text-sm text-gray-600">{brand.tagline}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

export { brands };
