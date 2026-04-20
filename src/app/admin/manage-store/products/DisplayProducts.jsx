"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/util/supabase/client";
import { ClipLoader } from "react-spinners";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

export default function DisplayProducts() {
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
        .order("category_id(name)", { ascending: true });

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
      <div className="flex items-center justify-center py-16">
        <ClipLoader color="#ff914d" size={24} />
      </div>
    );
  }

  return (
    <div className="transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-cormorant italic text-3xl font-light text-[#2c1810]">
          Products
        </h2>
        <Link
          href="/admin/manage-store/products/create"
          className="inline-flex items-center px-5 py-2.5 bg-[#ff914d] text-white text-sm font-semibold rounded-xl hover:bg-[#c76a2b] transition-all duration-200"
          style={{ boxShadow: "0 2px 10px rgba(255,145,77,0.28)" }}
        >
          <span className="mr-2">+</span>
          Add New Product
        </Link>
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1.5px solid #f0e6d8",
          boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead style={{ background: "#faf6f2" }}>
              <tr>
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#9a7a62] uppercase tracking-wider whitespace-nowrap">
                  Image
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#9a7a62] uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#9a7a62] uppercase tracking-wider whitespace-nowrap">
                  Category
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#9a7a62] uppercase tracking-wider whitespace-nowrap">
                  Stock
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#9a7a62] uppercase tracking-wider whitespace-nowrap">
                  Price
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#9a7a62] uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {products?.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors duration-150 hover:bg-[#faf6f2]"
                  style={{ borderTop: "1px solid #f0e6d8" }}
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
                    <div className="font-medium text-[#2c1810] truncate max-w-[120px] md:max-w-xs">
                      {product.name}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center">
                    <span
                      className="px-2 py-1 text-xs text-[#ff914d] rounded-full"
                      style={{ background: "#fff0e6" }}
                    >
                      {product.category_id?.name}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center">
                    <div className="text-[#2c1810] font-medium">
                      {product.stock}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center">
                    <div className="font-bold text-[#2c1810]">
                      {product.price} ISK
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-4 min-w-[80px]">
                      <Link
                        href={`/admin/manage-store/products/edit/${product.id}`}
                        className="text-[#ff914d] hover:text-[#c76a2b]"
                        tabIndex={deletingId === product.id ? -1 : 0}
                        aria-disabled={deletingId === product.id}
                      >
                        <FiEdit className="inline-block" size={20} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-[#c05a1a] hover:text-[#8a3f10] flex items-center justify-center min-w-[32px] min-h-[32px]"
                        disabled={deletingId === product.id}
                        aria-label="Delete product"
                      >
                        {deletingId === product.id ? (
                          <ClipLoader color="#c05a1a" size={18} />
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
  );
}
