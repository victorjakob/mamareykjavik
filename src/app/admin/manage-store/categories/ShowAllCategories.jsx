"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/util/supabase/client";
import { ClipLoader } from "react-spinners";
import Link from "next/link";
import Image from "next/image";
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function ShowAllCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setDeletingId(id);
      try {
        const response = await fetch("/api/store/delete-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to delete category");
        }
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (isLoading) {
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
          Categories
        </h2>
        <Link
          href="/admin/manage-store/categories/new"
          className="inline-flex items-center px-5 py-2.5 bg-[#ff914d] text-white text-sm font-semibold rounded-xl hover:bg-[#c76a2b] transition-all duration-200"
          style={{ boxShadow: "0 2px 10px rgba(255,145,77,0.28)" }}
        >
          <span className="mr-2">+</span>
          Add New Category
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
                <th className="px-6 py-4 text-center text-xs font-semibold text-[#9a7a62] uppercase tracking-wider whitespace-nowrap">
                  Image
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-[#9a7a62] uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-[#9a7a62] uppercase tracking-wider whitespace-nowrap">
                  Description
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-[#9a7a62] uppercase tracking-wider whitespace-nowrap">
                  Order
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-[#9a7a62] uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="transition-colors duration-150 hover:bg-[#faf6f2]"
                  style={{ borderTop: "1px solid #f0e6d8" }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-14 w-14 relative mx-auto">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="font-medium text-[#2c1810] truncate max-w-[120px] md:max-w-xs">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-[#9a7a62] text-sm max-w-xs mx-auto">
                      {category.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-[#2c1810] font-medium">
                      {category.order}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-4 min-w-[80px]">
                      <Link
                        href={`/admin/manage-store/categories/edit/${category.id}`}
                        className="text-[#ff914d] hover:text-[#c76a2b] transition-colors duration-200"
                        tabIndex={deletingId === category.id ? -1 : 0}
                        aria-disabled={deletingId === category.id}
                      >
                        <FiEdit className="inline-block" size={20} />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-[#c05a1a] hover:text-[#8a3f10] flex items-center justify-center min-w-[32px] min-h-[32px] transition-colors duration-200"
                        disabled={deletingId === category.id}
                        aria-label="Delete category"
                      >
                        {deletingId === category.id ? (
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
