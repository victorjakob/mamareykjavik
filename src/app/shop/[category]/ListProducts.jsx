"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ListProducts({ products, category }) {
  const router = useRouter();

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
              onClick={() => router.push(`/shop/${category}/${product.slug}`)}
              className="group rounded-lg overflow-hidden  transition-all duration-300 cursor-pointer border border-slate-100"
            >
              <div className="relative h-80 w-full overflow-hidden ">
                <Image
                  src={product.image || "https://placehold.co/600x400"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className="p-6">
                <h2 className="text-md font-semibold text-slate-800 mb-2 tracking-wide ">
                  {product.name}
                </h2>
                <div className="flex justify-between items-center">
                  <span className="text-md font-light text-slate-600">
                    {product.price} kr
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
