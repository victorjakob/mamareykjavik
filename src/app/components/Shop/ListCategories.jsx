"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PropagateLoader } from "react-spinners";

const ListCategories = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("order", { ascending: true });

        if (error) throw error;
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <PropagateLoader color="#10B981" size={12} speedMultiplier={0.8} />
      </div>
    );
  }

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
            className="group relative h-[500px] rounded-xl overflow-hidden cursor-pointer"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
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
