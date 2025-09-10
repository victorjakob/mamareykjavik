"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/util/supabase/client";
import {
  CheckIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  TagIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 text-white transition-all duration-300 ${
        type === "error" ? "bg-red-500" : "bg-green-500"
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3">
        {type === "error" ? (
          <XMarkIcon className="h-5 w-5" />
        ) : (
          <CheckIcon className="h-5 w-5" />
        )}
        <span className="font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export default function MenuRestaurant() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchData();
  }, []); // fetchData has no dependencies, so we can use empty array

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type }), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: categoryData, error: categoryError } = await supabase
        .from("menu_categories")
        .select("*")
        .order("order");

      if (categoryError) throw categoryError;
      setCategories(categoryData);

      // Fetch menu items with join, only available
      const { data, error } = await supabase
        .from("menu_items")
        .select("*, menu_categories:category_id(*)")
        .eq("available", true)
        .order("order");

      if (error) throw error;

      const sortedItems = data.sort((a, b) => {
        if (a.menu_categories.order !== b.menu_categories.order) {
          return a.menu_categories.order - b.menu_categories.order;
        }
        return a.order - b.order;
      });

      setMenuItems(sortedItems);
    } catch (err) {
      setError("Failed to load data");
      showToast("Failed to load data", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateItem = async (itemId, updates) => {
    try {
      const { menu_categories, ...itemUpdates } = updates;
      const { error } = await supabase
        .from("menu_items")
        .update(itemUpdates)
        .eq("id", itemId);

      if (error) throw error;

      setEditingItem(null);
      showToast("Menu item updated");
      fetchData();
    } catch (err) {
      setError("Failed to update item");
      showToast("Failed to update item", "error");
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ available: false })
        .eq("id", itemId);

      if (error) throw error;

      showToast("Menu item deleted");
      fetchData();
    } catch (err) {
      setError("Failed to delete item");
      showToast("Failed to delete item", "error");
      console.error(err);
    }
  };

  const handleUpdateCategory = async (categoryId, updates) => {
    try {
      const { error } = await supabase
        .from("menu_categories")
        .update(updates)
        .eq("id", categoryId);

      if (error) throw error;

      setEditingCategory(null);
      showToast("Category updated");
      fetchData();
    } catch (err) {
      setError("Failed to update category");
      showToast("Failed to update category", "error");
      console.error(err);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Are you sure? This will also delete all items in this category!"
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("menu_categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      showToast("Category deleted");
      fetchData();
    } catch (err) {
      setError("Failed to delete category");
      showToast("Failed to delete category", "error");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Categories Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu Items Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XMarkIcon className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Data
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: toast.type })}
      />
      {/* Categories Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TagIcon className="h-6 w-6 text-white" />
              <h3 className="text-lg font-semibold text-white">Categories</h3>
            </div>
            <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
              {categories.length} total
            </span>
          </div>
        </div>

        <div className="p-6">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Categories
              </h4>
              <p className="text-gray-500">
                Create your first category to organize menu items.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                >
                  {editingCategory?.id === category.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm"
                        value={editingCategory.name}
                        placeholder="Category name"
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        }
                      />
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
                        value={editingCategory.description || ""}
                        placeholder="Description"
                        rows={2}
                        onChange={(e) =>
                          setEditingCategory({
                            ...editingCategory,
                            description: e.target.value,
                          })
                        }
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                          value={editingCategory.order}
                          placeholder="Order"
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              order: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                        <span className="text-xs text-gray-500">Order</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleUpdateCategory(category.id, editingCategory)
                          }
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckIcon className="h-4 w-4 mr-1" /> Save
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {category.name}
                        </h4>
                        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full">
                          #{category.order}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() =>
                            setEditingCategory({
                              ...category,
                              order: category.order || 0,
                            })
                          }
                          className="inline-flex items-center px-2 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-200 transition-colors"
                          title="Edit category"
                        >
                          <PencilSquareIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="inline-flex items-center px-2 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-md hover:bg-red-100 transition-colors"
                          title="Delete category"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Menu Items Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bars3Icon className="h-6 w-6 text-white" />
              <h3 className="text-lg font-semibold text-white">Menu Items</h3>
            </div>
            <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
              {menuItems.length} total
            </span>
          </div>
        </div>

        <div className="p-6">
          {menuItems.length === 0 ? (
            <div className="text-center py-8">
              <Bars3Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Menu Items
              </h4>
              <p className="text-gray-500">
                Create your first menu item to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                >
                  {editingItem?.id === item.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm"
                            value={editingItem.category_id}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                category_id: e.target.value,
                              })
                            }
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm"
                            value={editingItem.name}
                            placeholder="Item name"
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
                          value={editingItem.description}
                          placeholder="Description"
                          rows={2}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price (ISK)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                              value={editingItem.price}
                              placeholder="Price"
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  price: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                            <span className="absolute right-3 top-2 text-xs text-gray-500">
                              ISK
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm"
                            value={editingItem.order}
                            placeholder="Order"
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                order: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() =>
                                handleUpdateItem(item.id, editingItem)
                              }
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" /> Save
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              <XMarkIcon className="h-4 w-4 mr-1" /> Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-base">
                              {item.name}
                            </h4>
                            <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full mt-1">
                              {item.menu_categories.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {item.price} ISK
                            </div>
                            <div className="text-xs text-gray-500">
                              Order #{item.order}
                            </div>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1.5 ml-4">
                        <button
                          onClick={() =>
                            setEditingItem({
                              ...item,
                              price: item.price || 0,
                              order: item.order || 0,
                            })
                          }
                          className="inline-flex items-center px-2 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-200 transition-colors"
                          title="Edit menu item"
                        >
                          <PencilSquareIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="inline-flex items-center px-2 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-md hover:bg-red-100 transition-colors"
                          title="Delete menu item"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
