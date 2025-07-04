"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/util/supabase/client";
import { PropagateLoader } from "react-spinners";
import Image from "next/image";
import Link from "next/link";

export default function DisplayProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category_id (
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);

        if (error) throw error;

        // Refresh products list after deletion
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12 transition-all duration-300 ease-in-out">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
          <Link
            href="/admin/manage-store/products/create"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">+</span>
            Add New Product
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Image
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Category
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Stock
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Price
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products?.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="h-14 w-14 relative mx-auto">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover rounded-lg shadow-sm"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <div className="font-medium text-gray-900 truncate max-w-[120px] md:max-w-xs">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-xs text-indigo-600 bg-indigo-100 rounded-full">
                        {product.category_id?.name}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <div className="text-gray-900 font-medium">
                        {product.stock}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <div className="font-bold text-gray-900">
                        {product.price} ISK
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                        <Link
                          href={`/admin/manage-store/products/edit/${product.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors duration-200 text-xs font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-full hover:bg-red-100 transition-colors duration-200 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
