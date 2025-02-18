"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { PropagateLoader } from "react-spinners";
import { motion } from "framer-motion";

export default function ListProducts() {
  const router = useRouter();
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", category)
          .single();

        if (categoryError) throw categoryError;

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("category_id", categoryData.id)
          .order("name");

        if (error) throw error;
        setProducts(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <PropagateLoader color="#64748b" size={12} speedMultiplier={0.8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 rounded-xl bg-slate-50 p-6 text-center">
        <div className="text-slate-600 font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-light text-slate-800 mb-16 capitalize text-center tracking-wider"
        >
          {category.replace(/-/g, " ")}
        </motion.h1>

        {products.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-slate-500">
              No products available in this category yet
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
