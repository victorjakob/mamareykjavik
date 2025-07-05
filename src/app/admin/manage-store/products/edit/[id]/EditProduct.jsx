"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/util/supabase/client";

export default function EditProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [extraImages, setExtraImages] = useState([]); // array of base64 or URLs
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Fetch categories using Supabase client (public info)
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchProduct = useCallback(
    async (id) => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setProduct(data);
        setImagePreview(data.image);
        setExtraImages(Array.isArray(data.images) ? data.images : []);
        setValue("name", data.name);
        setValue("description", data.description);
        setValue("price", data.price);
        setValue("stock", data.stock);
        setValue("category_id", data.category_id);
        setValue("order", data.order);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    },
    [setValue]
  );

  useEffect(() => {
    fetchCategories();
    if (typeof window !== "undefined") {
      const productId = window.location.pathname.split("/").pop();
      if (productId) {
        fetchProduct(productId);
      }
    }
  }, [fetchProduct, fetchCategories]);

  // Memoize category options
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      )),
    [categories]
  );

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
    } catch (error) {
      alert("Error processing image");
    } finally {
      setImageProcessing(false);
    }
  };

  // Handler for extra images
  const handleExtraImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    const previews = await Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      })
    );
    setExtraImages((prev) => [...prev, ...previews]);
  };

  // Remove an extra image
  const handleRemoveExtraImage = (idx) => {
    setExtraImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
    if (submitting) return;
    if (!product) return;
    if (imageProcessing) {
      alert("Please wait for image to finish processing");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/store/edit-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          category_id: data.category_id,
          order: data.order,
          image: imagePreview,
          images: extraImages,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update product");
      }
      router.push("/admin/manage-store/products");
    } catch (error) {
      alert("Error updating product");
      console.error("Error updating product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
        <ClipLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Sticky header with product name and main image */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md rounded-2xl shadow flex items-center gap-6 px-6 py-4 mb-8 border border-gray-100">
          {imagePreview && (
            <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <Image
                src={imagePreview}
                alt="Product preview"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {product?.name || "Edit Product"}
            </h1>
            <p className="text-gray-500 text-sm truncate">ID: {product?.id}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Main Image & Extra Images */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Image
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none"
                disabled={imageProcessing}
              />
              {imageProcessing && (
                <p className="mt-2 text-sm text-indigo-600">
                  Processing image...
                </p>
              )}
              {imagePreview && (
                <div className="mt-4 relative h-40 w-40 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <Image
                    src={imagePreview}
                    alt="Product preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extra Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleExtraImagesChange}
                className="block w-full text-sm text-gray-500"
              />
              <div className="grid grid-cols-4 gap-3 mt-4">
                {extraImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm group"
                  >
                    <Image
                      src={img}
                      alt={`Extra ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExtraImage(idx)}
                      className="absolute top-1 right-1 bg-white/80 rounded-full shadow p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <XMarkIcon className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  {...register("name", {
                    required: "Product name is required",
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  {...register("category_id", {
                    required: "Category is required",
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a category</option>
                  {categoryOptions}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category_id.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price (ISK)
                </label>
                <input
                  type="number"
                  step="0.01"
                  onWheel={(e) => e.target.blur()}
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 0, message: "Price must be positive" },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={submitting}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700"
                >
                  Stock
                </label>
                <input
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  {...register("stock", {
                    required: "Stock is required",
                    min: { value: 0, message: "Stock must be positive" },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={submitting}
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.stock.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="order"
                  className="block text-sm font-medium text-gray-700"
                >
                  Display Order
                </label>
                <input
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  {...register("order", {
                    required: "Display order is required",
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={submitting}
                />
                {errors.order && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.order.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => router.push("/admin/manage-store/products")}
              className="px-6 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-8 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition flex items-center justify-center ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <ClipLoader color="#fff" size={18} className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
