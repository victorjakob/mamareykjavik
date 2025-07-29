"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import { supabase } from "@/util/supabase/client";

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
};

export default function CreateCategory() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingCategories, setExistingCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "order" ? (value === "" ? 1 : parseInt(value) || 1) : value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    setImagePreview(URL.createObjectURL(file));
    setImageFile(file);
  };

  // Fetch existing categories to show current order
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, order")
          .order("order", { ascending: true });

        if (error) throw error;
        setExistingCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Set default order to be after the last category
  useEffect(() => {
    if (existingCategories.length > 0) {
      const maxOrder = Math.max(...existingCategories.map((cat) => cat.order));
      setFormData((prev) => ({
        ...prev,
        order: maxOrder + 1,
      }));
    }
  }, [existingCategories]);

  // Remove uploadImage, let API handle upload

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      let imageBase64 = formData.image;
      if (imageFile) {
        // Convert image file to base64
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }
      const slug = generateSlug(formData.name);
      const response = await fetch("/api/store/create-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          image: imageBase64,
          order: formData.order,
          slug,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create category");
      }
      router.push("/admin/manage-store/categories");
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // Cleanup preview URL when component unmounts
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Create New Category
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto px-4">
            Add a new category to organize your products and improve the
            shopping experience
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <section className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-4 sm:gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">📝</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  Basic Information
                </h2>
                <p className="text-slate-600 text-sm">
                  Essential details for your category
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter category name..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={100}
                  placeholder="Describe your category..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-500">
                    {formData.description.length}/100 characters
                  </span>
                  {formData.description.length > 90 && (
                    <span className="text-xs text-orange-500 font-medium">
                      ⚠️ {100 - formData.description.length} characters
                      remaining
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Image Section */}
          <section className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-4 sm:gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">🖼️</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  Category Image
                </h2>
                <p className="text-slate-600 text-sm">
                  Upload a representative image for your category
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Upload Image *
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <div className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="rounded-2xl object-cover shadow-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Display Order Section */}
          <section className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 gap-4 sm:gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">📋</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  Display Order
                </h2>
                <p className="text-slate-600 text-sm">
                  Choose where this category appears in the list
                </p>
              </div>
            </div>

            {loadingCategories ? (
              <div className="flex items-center justify-center py-8">
                <ClipLoader color="#4F46E5" size={24} />
                <span className="ml-3 text-slate-600">
                  Loading existing categories...
                </span>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Current Category Order:
                  </label>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-2 max-h-48 overflow-y-auto border border-slate-200">
                    {existingCategories.length === 0 ? (
                      <p className="text-sm text-slate-500 italic text-center py-4">
                        No categories yet - this will be the first one!
                      </p>
                    ) : (
                      existingCategories.map((category, index) => (
                        <div
                          key={category.id}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                            formData.order === category.order
                              ? "bg-indigo-100 border border-indigo-200 shadow-sm"
                              : "hover:bg-slate-100"
                          }`}
                        >
                          <span className="font-medium text-slate-700">
                            {category.order}. {category.name}
                          </span>
                          <span className="text-slate-500 text-sm">
                            Order: {category.order}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="order"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Position Number *
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = Math.max(1, formData.order - 1);
                          setFormData((prev) => ({ ...prev, order: newValue }));
                        }}
                        disabled={isSubmitting || formData.order <= 1}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg sm:text-xl font-bold text-slate-700">
                          −
                        </span>
                      </button>
                      <input
                        type="number"
                        id="order"
                        name="order"
                        value={formData.order}
                        onChange={handleChange}
                        required
                        min="1"
                        onWheel={(e) => e.target.blur()}
                        placeholder="Enter position..."
                        className="flex-1 px-3 sm:px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-center"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newValue = formData.order + 1;
                          setFormData((prev) => ({ ...prev, order: newValue }));
                        }}
                        disabled={isSubmitting}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center transition-all duration-200"
                      >
                        <span className="text-lg sm:text-xl font-bold text-slate-700">
                          +
                        </span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Position Description
                    </label>
                    <div className="px-3 sm:px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-sm text-slate-600">
                        {formData.order === 1
                          ? "🎯 First position"
                          : formData.order > existingCategories.length
                          ? "📌 Last position"
                          : `📍 Between ${
                              existingCategories[formData.order - 2]?.name ||
                              "start"
                            } and ${
                              existingCategories[formData.order - 1]?.name ||
                              "end"
                            }`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <ClipLoader color="#fff" size={20} className="mr-3" />
                  Creating Category...
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span>
                  Create Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
