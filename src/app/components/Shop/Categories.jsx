"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("order", { ascending: true });

        if (error) {
          throw error;
        }

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
      <div className="container mx-auto px-4 flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary opacity-70"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h2 className="text-4xl font-extralight text-center mb-16 tracking-wider text-gray-800">
        Explore Our Collections
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-700 ease-in-out hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            <div className="relative w-full h-[600px]">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover w-full h-full transform transition-transform duration-1000 scale-110 group-hover:scale-125"
                style={{ objectPosition: "center" }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/70 group-hover:via-black/20 group-hover:to-black/80 transition-all duration-700 ease-in-out">
              <div className="absolute bottom-0 left-0 right-0 p-10">
                <h3 className="text-white text-2xl font-extralight tracking-widest mb-3 transform translate-y-2 transition-transform duration-700 ease-in-out group-hover:translate-y-0">
                  {category.name}
                </h3>
                <p className="text-white/90 font-light tracking-wider opacity-0 transform translate-y-4 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:translate-y-0">
                  {category.description}
                  <span className="ml-2 inline-block transition-transform duration-700 group-hover:translate-x-2">
                    →
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
