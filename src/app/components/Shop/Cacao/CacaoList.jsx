"use client";

import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { PropagateLoader } from "react-spinners";

const fetcher = (url) =>
  fetch(url)
    .then((res) => res.json())
    .catch((err) => {
      console.error("Fetch error:", err);
      throw err;
    });

export default function CacaoList() {
  const { data, error, isLoading } = useSWR("/api/cacao", fetcher);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }
  if (error)
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error.message}
      </div>
    );

  const cacaos = data || [];

  return (
    <div className="w-full py-8 space-y-12">
      <h1 className="text-4xl text-slate-50 font-bold text-center mb-8">
        Our Ceremonial Cacao Products
      </h1>

      {cacaos.map((cacao, index) => {
        const isEven = index % 2 === 0;

        return (
          <motion.div
            key={cacao.id}
            className={`relative flex flex-col lg:flex-row items-center 
                lg:items-start bg-slate-50  shadow-lg rounded-2xl 
                overflow-hidden ${
                  isEven
                    ? "rounded-l-none lg:ml-0 lg:mr-auto lg:w-[80%]" // Left side full-bleed on large screens
                    : "rounded-r-none lg:mr-0 lg:ml-auto lg:w-[80%]" // Right side full-bleed on large screens
                }`}
            initial={{ opacity: 0, x: isEven ? -150 : 150 }} // Slide in animation
            whileInView={{ opacity: 0.9, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Image Section */}
            <div className="w-full lg:w-1/3 md:w-[40%] aspect-square">
              <img
                src={
                  cacao.images && cacao.images.length > 0
                    ? cacao.images[0].url
                    : "/mamaimg/mamalogo.png"
                }
                alt={cacao.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-2/3 p-6 flex flex-col justify-start text-center lg:text-left">
              {/* Name */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {cacao.name}
              </h2>

              {/* Price and Button */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-4 mb-4">
                <p className="text-lg font-semibold text-gray-800">
                  {cacao.price} Isk
                </p>
                <Link href={`/shop/${cacao.slug}`}>
                  <button className="bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                    Buy Now
                  </button>
                </Link>
                <button
                  onClick={() => console.log("Added to cart:", cacao.name)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                  Add to Cart
                </button>
              </div>

              {/* Description */}
              <p className="text-gray-600 whitespace-pre-line">
                {cacao.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
