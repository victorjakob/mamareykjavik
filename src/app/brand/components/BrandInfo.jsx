"use client";
import { motion } from "framer-motion";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { brands } from "./BrandSelector";

export default function BrandInfo({ selectedBrand }) {
  const brand = brands[selectedBrand];

  return (
    <motion.div
      key={selectedBrand}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-8 mb-12"
    >
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex-1">
          <h2 className="text-3xl font-light text-gray-800 mb-4 tracking-wide">
            {brand.name}
          </h2>
          <p className="text-lg text-gray-600 mb-6">{brand.description}</p>
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                style={{
                  backgroundColor: brand.primaryColor,
                }}
              ></div>
              <span className="text-sm text-gray-600">Primary</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                style={{
                  backgroundColor: brand.secondaryColor,
                }}
              ></div>
              <span className="text-sm text-gray-600">Secondary</span>
            </div>
          </div>
        </div>
        <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
          {selectedBrand === "mama" ? (
            <img
              src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1756674800/MamaFINAL_blrlme.png"
              alt="Mama Restaurant Logo"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <PhotoIcon className="h-16 w-16 text-gray-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
