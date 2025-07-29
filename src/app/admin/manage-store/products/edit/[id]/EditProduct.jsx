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
  const [existingProducts, setExistingProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  // Fetch categories and products using Supabase client
  const fetchData = useCallback(async () => {
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData);

      // Fetch existing products for order reference
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, order, category_id")
        .order("order", { ascending: true });

      if (productsError) throw productsError;
      setExistingProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingProducts(false);
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
    fetchData();
    if (typeof window !== "undefined") {
      const productId = window.location.pathname.split("/").pop();
      if (productId) {
        fetchProduct(productId);
      }
    }
  }, [fetchProduct, fetchData]);

  // Filter products by selected category and update order
  useEffect(() => {
    const categoryId = watch("category_id");
    setSelectedCategoryId(categoryId);

    if (categoryId && existingProducts.length > 0) {
      const categoryProducts = existingProducts.filter(
        (product) => product.category_id === parseInt(categoryId)
      );

      if (categoryProducts.length > 0) {
        const maxOrder = Math.max(
          ...categoryProducts.map((product) => product.order)
        );
        setValue("order", maxOrder + 1);
      } else {
        setValue("order", 1);
      }
    }
  }, [watch("category_id"), existingProducts, setValue]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Enhanced Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6">
            {imagePreview && (
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg">
                <Image
                  src={imagePreview}
                  alt="Product preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                {product?.name || "Edit Product"}
              </h1>
              <p className="text-slate-600 text-sm">
                Product ID: {product?.id} • Update product information
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Images Section */}
          <section className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-slate-200/50">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-sm font-bold">📸</span>
                </div>
                Product Images
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Update the main product image and additional gallery images
              </p>
            </div>

            <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
              {/* Main Image */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Main Product Image
                  </label>
                  <div className="relative">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-slate-500 file:mr-2 sm:file:mr-4 file:py-2 sm:file:py-3 file:px-4 sm:file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 focus:outline-none transition-all duration-200"
                      disabled={imageProcessing}
                    />
                    {imageProcessing && (
                      <div className="mt-3 flex items-center gap-2 text-indigo-600">
                        <ClipLoader color="#4F46E5" size={16} />
                        <span className="text-sm font-medium">
                          Processing image...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {imagePreview && (
                  <div className="relative h-32 sm:h-48 w-full rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg">
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Extra Images */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Gallery Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleExtraImagesChange}
                    className="block w-full text-sm text-slate-500 file:mr-2 sm:file:mr-4 file:py-2 sm:file:py-3 file:px-4 sm:file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                  {extraImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 border-slate-200 shadow-md group hover:shadow-lg transition-all duration-200"
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraImage(idx)}
                        className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                        aria-label="Remove image"
                      >
                        <XMarkIcon className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Product Details Section */}
          <section className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-8 py-6 border-b border-slate-200/50">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 text-sm font-bold">📝</span>
                </div>
                Product Information
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Update basic product details and categorization
              </p>
            </div>

            <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Product name is required",
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    placeholder="Describe your product..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    {...register("category_id", {
                      required: "Category is required",
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  >
                    <option value="">Select a category</option>
                    {categoryOptions}
                  </select>
                  {errors.category_id && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.category_id.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    placeholder="0.00"
                    disabled={submitting}
                  />
                  {errors.price && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    {...register("stock", {
                      required: "Stock is required",
                      min: { value: 0, message: "Stock must be positive" },
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    placeholder="0"
                    disabled={submitting}
                  />
                  {errors.stock && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span>⚠️</span> {errors.stock.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Display Order
                  </label>

                  {loadingProducts ? (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                      <ClipLoader color="#4F46E5" size={18} />
                      <span className="text-sm text-slate-600 font-medium">
                        Loading existing products...
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <label className="block text-xs font-semibold text-slate-600 mb-3">
                          Current Product Order:
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {!selectedCategoryId ? (
                            <p className="text-sm text-slate-500 italic text-center py-4">
                              Select a category to see product order
                            </p>
                          ) : existingProducts.filter(
                              (product) =>
                                product.category_id ===
                                parseInt(selectedCategoryId)
                            ).length === 0 ? (
                            <p className="text-sm text-slate-500 italic text-center py-4">
                              No products in this category yet
                            </p>
                          ) : (
                            existingProducts
                              .filter(
                                (product) =>
                                  product.category_id ===
                                  parseInt(selectedCategoryId)
                              )
                              .map((product, index) => (
                                <div
                                  key={product.id}
                                  className={`flex items-center justify-between text-sm p-2 rounded-lg transition-all duration-200 ${
                                    watch("order") === product.order
                                      ? "bg-indigo-100 border border-indigo-200"
                                      : "hover:bg-slate-100"
                                  }`}
                                >
                                  <span className="font-medium text-slate-700 truncate">
                                    {product.order}. {product.name}
                                  </span>
                                  <span className="text-slate-500 text-xs flex-shrink-0 ml-2">
                                    Position: {index + 1}
                                  </span>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              const currentOrder = watch("order") || 1;
                              const newValue = Math.max(1, currentOrder - 1);
                              setValue("order", newValue);
                            }}
                            disabled={submitting || (watch("order") || 1) <= 1}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="text-lg sm:text-xl font-bold text-slate-700">
                              −
                            </span>
                          </button>
                          <input
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            {...register("order", {
                              required: "Display order is required",
                            })}
                            className="flex-1 px-3 sm:px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-center"
                            placeholder="1"
                            disabled={submitting}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentOrder = watch("order") || 1;
                              const newValue = currentOrder + 1;
                              setValue("order", newValue);
                            }}
                            disabled={submitting}
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center transition-all duration-200"
                          >
                            <span className="text-lg sm:text-xl font-bold text-slate-700">
                              +
                            </span>
                          </button>
                        </div>
                        <div className="px-3 sm:px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-sm text-slate-600 font-medium">
                            {!selectedCategoryId
                              ? "Select category first"
                              : watch("order") === 1
                              ? "🎯 First position"
                              : watch("order") >
                                existingProducts.filter(
                                  (product) =>
                                    product.category_id ===
                                    parseInt(selectedCategoryId)
                                ).length
                              ? "📌 Last position"
                              : `📍 Between ${
                                  existingProducts.filter(
                                    (product) =>
                                      product.category_id ===
                                      parseInt(selectedCategoryId)
                                  )[watch("order") - 1]?.name || "start"
                                } and ${
                                  existingProducts.filter(
                                    (product) =>
                                      product.category_id ===
                                      parseInt(selectedCategoryId)
                                  )[watch("order")]?.name || "end"
                                }`}
                          </span>
                        </div>
                      </div>
                      {errors.order && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <span>⚠️</span> {errors.order.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Actions Section */}
          <section className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/manage-store/products")}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-semibold shadow-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all duration-200"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`w-full sm:w-auto px-6 sm:px-10 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center justify-center gap-2 ${
                  submitting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-xl"
                }`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <ClipLoader color="#fff" size={18} />
                    <span>Updating Product...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Update Product</span>
                  </>
                )}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
