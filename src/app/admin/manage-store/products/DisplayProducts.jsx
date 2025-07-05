"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/util/supabase/client";
import { ClipLoader } from "react-spinners";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

export default function DisplayProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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
      setDeletingId(id);
      try {
        const response = await fetch("/api/store/delete-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to delete product");
        }
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ClipLoader color="#4F46E5" size={12} />
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
                      <div className="flex items-center justify-center gap-4 min-w-[80px]">
                        <Link
                          href={`/admin/manage-store/products/edit/${product.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          tabIndex={deletingId === product.id ? -1 : 0}
                          aria-disabled={deletingId === product.id}
                        >
                          <FiEdit className="inline-block" size={20} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 flex items-center justify-center min-w-[32px] min-h-[32px]"
                          disabled={deletingId === product.id}
                          aria-label="Delete product"
                        >
                          {deletingId === product.id ? (
                            <ClipLoader color="#e11d48" size={18} />
                          ) : (
                            <FiTrash2 className="inline-block" size={20} />
                          )}
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
