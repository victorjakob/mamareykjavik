"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import DualLanguageText from "@/app/components/DualLanguageText";

const ListCategories = ({ categories }) => {
  const router = useRouter();
  const [clickedCategory, setClickedCategory] = useState(null);
  const { language } = useLanguage();

  const translations = {
    en: {
      title: "Our Collections",
    },
    is: {
      title: "Söfnin okkar",
    },
  };

  const t = translations[language];

  const handleCategoryClick = (categoryId, categorySlug) => {
    setClickedCategory(categoryId);

    // Let React render the spinner, then navigate
    requestAnimationFrame(() => {
      router.push(`/shop/${categorySlug}`);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <DualLanguageText
        en={t.title}
        is={t.title}
        element="h1"
        className="text-4xl font-light text-gray-900 mb-16 text-center tracking-wide"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category.id, category.slug)}
            className={`group relative h-[500px] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:scale-105 ${
              clickedCategory === category.id
                ? "scale-95 opacity-80 shadow-2xl"
                : ""
            }`}
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              priority
            />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 transition-opacity duration-500 group-hover:opacity-90" />

            {/* Loading overlay */}
            {clickedCategory === category.id && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              </div>
            )}

            <div className="absolute bottom-0 p-8 w-full">
              <h2 className="text-2xl font-light text-white mb-2 tracking-wide">
                {category.name}
              </h2>
              <p className="text-white/80 font-light tracking-wide text-sm opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                {category.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListCategories;
