"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ListCategories = ({ categories }) => {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
      <h1 className="text-4xl font-light text-gray-900 mb-16 text-center tracking-wide">
        Our Collections
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => router.push(`/shop/${category.slug}`)}
            className="group relative h-[500px] rounded-xl overflow-hidden cursor-pointer transition-transform duration-700 ease-out hover:scale-105"
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
