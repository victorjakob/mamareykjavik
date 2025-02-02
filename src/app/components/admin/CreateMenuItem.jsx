"use client";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateMenuItem() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_categories")
        .select("id, name, order")
        .order("order");
      if (error) throw error;
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories");
    }
  };

  const onSubmitCategory = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const { error: supabaseError } = await supabase
        .from("menu_categories")
        .insert([
          {
            name: data.categoryName,
            description: data.categoryDescription,
            order: parseInt(data.categoryOrder),
          },
        ]);

      if (supabaseError) throw supabaseError;

      await fetchCategories();
      setSuccess(true);
      reset();
      setShowCategoryForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitMenuItem = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: supabaseError } = await supabase
        .from("menu_items")
        .insert([
          {
            name: data.name,
            description: data.description,
            price: parseInt(data.price),
            category_id: data.category_id,
            order: parseInt(data.order),
          },
        ]);

      if (supabaseError) throw supabaseError;

      setSuccess(true);
      reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Add New Menu Item</h2>
        <button
          onClick={() => setShowCategoryForm(!showCategoryForm)}
          className="px-4 py-2 text-sm font-medium text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50"
        >
          {showCategoryForm ? "Cancel" : "Add New Category"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border-l-4 border-green-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Item created successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {showCategoryForm ? (
        <form onSubmit={handleSubmit(onSubmitCategory)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Category Name
            </label>
            <input
              {...register("categoryName", {
                required: "Category name is required",
              })}
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.categoryName && (
              <p className="text-sm text-red-600">
                {errors.categoryName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Category Description
            </label>
            <textarea
              {...register("categoryDescription")}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows="3"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Display Order
            </label>
            <input
              {...register("categoryOrder", {
                required: "Display order is required",
                pattern: {
                  value: /^\d+$/,
                  message: "Order must be a whole number",
                },
              })}
              type="number"
              placeholder="Enter display order (e.g. 1, 2, 3)"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.categoryOrder && (
              <p className="text-sm text-red-600">
                {errors.categoryOrder.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onSubmitMenuItem)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Category
            </label>
            <select
              {...register("category_id", {
                required: "Please select a category",
              })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-sm text-red-600">
                {errors.category_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Name</label>
            <input
              {...register("name", { required: "Name is required" })}
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              rows="4"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Price (ISK)
            </label>
            <div className="relative">
              <input
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                  pattern: {
                    value: /^\d+$/,
                    message: "Price must be a whole number",
                  },
                })}
                type="number"
                step="1"
                className="w-full pl-4 pr-12 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="absolute right-4 top-2 text-gray-500">ISK</span>
            </div>
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Display Order
            </label>
            <input
              {...register("order", {
                required: "Display order is required",
                pattern: {
                  value: /^\d+$/,
                  message: "Order must be a whole number",
                },
              })}
              type="number"
              placeholder="Enter display order (e.g. 1, 2, 3)"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {errors.order && (
              <p className="text-sm text-red-600">{errors.order.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transform transition duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                Creating...
              </div>
            ) : (
              "Create Menu Item"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
