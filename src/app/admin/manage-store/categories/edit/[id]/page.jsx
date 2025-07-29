"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/util/supabase/client";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import Image from "next/image";

export default function Page({ params }) {
  const { id } = use(params);
  return <EditCategoryPage id={id} />;
}

export function EditCategoryPage({ id }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            name: data.name,
            description: data.description,
            image: data.image,
            order: data.order,
          });
          setImagePreview(data.image);
        }
      } catch (err) {
        setError("Failed to fetch category. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleImageChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    setImageProcessing(true);
    const file = e.target.files[0];
    try {
      // Convert image to base64 for API
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setImagePreview(base64);
      setFormData((prev) => ({ ...prev, image: base64 }));
    } catch (error) {
      setError("Error processing image. Please try again.");
    } finally {
      setImageProcessing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "order" ? (value === "" ? 1 : parseInt(value) || 1) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageProcessing) {
      setError("Please wait for image to finish processing");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/store/edit-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image,
          order: formData.order,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update category");
      }
      router.push("/admin/manage-store/categories");
      router.refresh();
    } catch (err) {
      setError("Failed to update category. Please try again.");
    } finally {
      setIsSubmitting(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Edit Category
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto px-4">
            Update your category information and settings
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
                  maxLength={100}
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
                  Update the representative image for your category
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {imagePreview && (
                <div className="mb-4">
                  <div className="relative w-32 h-32 sm:w-48 sm:h-48 mx-auto">
                    <Image
                      src={imagePreview}
                      alt="Category preview"
                      fill
                      className="rounded-2xl object-cover shadow-lg"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Upload New Image
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {imageProcessing && (
                  <div className="flex items-center mt-2">
                    <ClipLoader color="#4F46E5" size={16} />
                    <span className="ml-2 text-sm text-slate-600">
                      Processing image...
                    </span>
                  </div>
                )}
              </div>
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

            <div className="space-y-6">
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
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-all duration-200 border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || imageProcessing}
              className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <ClipLoader color="#fff" size={20} className="mr-3" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <span className="mr-2">💾</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
