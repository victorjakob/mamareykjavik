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
      <div className="min-h-screen flex items-center justify-center">
        <ClipLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-12 transition-all duration-300 ease-in-out">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Categories</h1>
          <Link
            href="/admin/manage-store/categories/new"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="mr-2">+</span>
            Add New Category
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    Image
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    Order
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
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
                      <div className="font-medium text-slate-900 truncate max-w-[120px] md:max-w-xs">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-slate-600 text-sm max-w-xs mx-auto">
                        {category.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-slate-900 font-medium">
                        {category.order}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-4 min-w-[80px]">
                        <Link
                          href={`/admin/manage-store/categories/edit/${category.id}`}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                          tabIndex={deletingId === category.id ? -1 : 0}
                          aria-disabled={deletingId === category.id}
                        >
                          <FiEdit className="inline-block" size={20} />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900 flex items-center justify-center min-w-[32px] min-h-[32px] transition-colors duration-200"
                          disabled={deletingId === category.id}
                          aria-label="Delete category"
                        >
                          {deletingId === category.id ? (
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
