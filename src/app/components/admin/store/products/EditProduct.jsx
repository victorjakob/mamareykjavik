"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { PropagateLoader } from "react-spinners";
import Image from "next/image";

export default function EditProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

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

        // Set form values
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
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("Store")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("Store").getPublicUrl(filePath);
      setImagePreview(data.publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setImageProcessing(false);
    }
  };

  const onSubmit = async (data) => {
    if (!product) return;

    if (imageProcessing) {
      alert("Please wait for image to finish processing");
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
          category_id: parseInt(data.category_id),
          image: imagePreview,
          order: parseInt(data.order),
        })
        .eq("id", product.id);

      if (error) throw error;

      router.push("/admin/manage-store/products");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product");
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
    <div className="min-h-screen bg-gray-100">
      <div className="px-4 py-8 transition-all duration-300 ease-in-out">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Product Image
              </label>
              <div className="mt-1">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100
                    focus:outline-none"
                  disabled={imageProcessing}
                />
                {imageProcessing && (
                  <p className="mt-2 text-sm text-indigo-600">
                    Processing image...
                  </p>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2 relative h-48 w-48">
                  <Image
                    src={imagePreview}
                    alt="Product preview"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Product Name
              </label>
              <input
                type="text"
                {...register("name", { required: "Product name is required" })}
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
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                {...register("stock", {
                  required: "Stock is required",
                  min: { value: 0, message: "Stock must be positive" },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                {...register("order", {
                  required: "Display order is required",
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.order && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.order.message}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push("/admin/manage-store/products")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Update Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
