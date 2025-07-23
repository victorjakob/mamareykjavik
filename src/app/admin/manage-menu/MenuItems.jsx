"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/util/supabase/client";
import {
  CheckIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div
      className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white transition-all duration-300 ${
        type === "error" ? "bg-red-600" : "bg-green-600"
      }`}
      role="alert"
      aria-live="assertive"
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 focus:outline-none">
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
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
  }, [fetchData]);

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
    // Simple skeleton loader
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="space-y-6 w-full max-w-2xl">
          {[1, 2].map((section) => (
            <div
              key={section}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
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
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 relative">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: toast.type })}
      />
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Menu Management</h2>
          <p className="mt-2 text-lg text-gray-500">
            Manage your restaurant&apos;s categories and menu items
          </p>
        </div>
        {/* Categories Section */}
        <section className="mb-10">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Categories
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                      Name
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                      Description
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                      Order
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, idx) => (
                    <tr
                      key={category.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {editingCategory?.id === category.id ? (
                        <>
                          <td className="px-4 py-2 align-top">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                              value={editingCategory.name}
                              placeholder="Category name"
                              onChange={(e) =>
                                setEditingCategory({
                                  ...editingCategory,
                                  name: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td className="px-4 py-2 align-top">
                            <textarea
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-400 focus:border-orange-400 resize-y"
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
                          </td>
                          <td className="px-4 py-2 align-top">
                            <input
                              type="number"
                              className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                              value={editingCategory.order}
                              placeholder="Order"
                              onChange={(e) =>
                                setEditingCategory({
                                  ...editingCategory,
                                  order: parseInt(e.target.value),
                                })
                              }
                            />
                          </td>
                          <td className="px-4 py-2 align-top flex gap-2">
                            <button
                              onClick={() =>
                                handleUpdateCategory(
                                  category.id,
                                  editingCategory
                                )
                              }
                              className="inline-flex items-center px-2 py-1 rounded text-white bg-green-600 hover:bg-green-700 text-xs"
                              title="Save"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" /> Save
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="inline-flex items-center px-2 py-1 rounded text-gray-700 bg-gray-100 hover:bg-gray-200 text-xs"
                              title="Cancel"
                            >
                              <XMarkIcon className="h-4 w-4 mr-1" /> Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-sm text-gray-900 align-top">
                            {category.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 align-top whitespace-pre-wrap">
                            {category.description}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 align-top">
                            {category.order}
                          </td>
                          <td className="px-4 py-2 align-top flex gap-2">
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="inline-flex items-center px-2 py-1 rounded text-white bg-orange-500 hover:bg-orange-600 text-xs"
                              title="Edit"
                            >
                              <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="inline-flex items-center px-2 py-1 rounded text-white bg-red-600 hover:bg-red-700 text-xs"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" /> Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {/* Menu Items Section */}
        <section>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Menu Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                      Category
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                      Name
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                      Description
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                      Price
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                      Order
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase border-b">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {editingItem?.id === item.id ? (
                        <>
                          <td className="px-4 py-2 align-top">
                            <select
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
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
                          </td>
                          <td className="px-4 py-2 align-top">
                            <input
                              type="text"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                              value={editingItem.name}
                              placeholder="Item name"
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  name: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td className="px-4 py-2 align-top">
                            <textarea
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-400 focus:border-orange-400 resize-y"
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
                          </td>
                          <td className="px-4 py-2 align-top">
                            <div className="relative">
                              <input
                                type="number"
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-400 focus:border-orange-400 pr-8"
                                value={editingItem.price}
                                placeholder="Price"
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    price: parseInt(e.target.value),
                                  })
                                }
                              />
                              <span className="absolute right-2 top-1 text-xs text-gray-500">
                                ISK
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2 align-top">
                            <input
                              type="number"
                              className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                              value={editingItem.order}
                              placeholder="Order"
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  order: parseInt(e.target.value),
                                })
                              }
                            />
                          </td>
                          <td className="px-4 py-2 align-top flex gap-2">
                            <button
                              onClick={() =>
                                handleUpdateItem(item.id, editingItem)
                              }
                              className="inline-flex items-center px-2 py-1 rounded text-white bg-green-600 hover:bg-green-700 text-xs"
                              title="Save"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" /> Save
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="inline-flex items-center px-2 py-1 rounded text-gray-700 bg-gray-100 hover:bg-gray-200 text-xs"
                              title="Cancel"
                            >
                              <XMarkIcon className="h-4 w-4 mr-1" /> Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-sm text-gray-900 align-top">
                            {item.menu_categories.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 align-top">
                            {item.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 align-top whitespace-pre-wrap">
                            {item.description}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 align-top">
                            {item.price} ISK
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 align-top">
                            {item.order}
                          </td>
                          <td className="px-4 py-2 align-top flex gap-2">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="inline-flex items-center px-2 py-1 rounded text-white bg-orange-500 hover:bg-orange-600 text-xs"
                              title="Edit"
                            >
                              <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="inline-flex items-center px-2 py-1 rounded text-white bg-red-600 hover:bg-red-700 text-xs"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" /> Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
