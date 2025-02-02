"use client";

import { PropagateLoader } from "react-spinners";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";

const fetcher = (url) =>
  fetch(url)
    .then((res) => res.json())
    .catch((err) => {
      console.error("Fetch error:", err);
      throw err;
    });

export default function Categories() {
  const { data, error, isLoading } = useSWR("/api/categories", fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }
  if (error) return <div>Error: {error.message}</div>;

  const categories = data || [];

  return (
    <div className="w-full py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Categories</h1>
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
        {categories.map((category) => (
          <Link key={category.position} href={`/shop/${category.slug}`}>
            <div
              className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl bg-white h-40"
              onClick={() => {}}
            >
              <Image
                src={category.image.url}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
                priority={category.position === 1}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300 ease-in-out">
                <h2 className="text-lg text-white font-semibold">
                  {category.name}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
