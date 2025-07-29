"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/util/IskFormat";
import { useState } from "react";

export default function ListProducts({ products, category }) {
  const router = useRouter();
  const [clickedProduct, setClickedProduct] = useState(null);

  if (products.length === 0) {
    return (
      <div className="text-center">
        <p className="text-lg text-slate-500">
          No products available in this category yet
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-light text-slate-800 mb-16 capitalize text-center tracking-wider"
        >
          {category.replace(/-/g, " ")}
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                setClickedProduct(product.id);
                requestAnimationFrame(() => {
                  router.push(`/shop/${category}/${product.slug}`);
                });
              }}
              className={`group rounded-lg overflow-hidden cursor-pointer border border-slate-100 transition-all duration-300 ${
                clickedProduct === product.id
                  ? "scale-95 opacity-80 shadow-2xl"
                  : ""
              }`}
            >
              <div className="relative h-80 w-full overflow-hidden ">
                <Image
                  src={product.image || "https://placehold.co/600x400"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Loading overlay */}
                {clickedProduct === product.id && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 text-center">
                <h2 className="text-md font-semibold text-slate-800 mb-2 tracking-wide">
                  {product.name}
                </h2>
                <div className="flex justify-center items-center">
                  <span className="text-md font-light text-slate-600">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
