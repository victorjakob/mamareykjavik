"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function MenuRestaurant() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const { data: categoryData, error: categoryError } = await supabase
        .from("menu_categories")
        .select("*")
        .order("order");

      if (categoryError) throw categoryError;
      setCategories(categoryData);

      // Fetch menu items with join
      const { data, error } = await supabase
        .from("menu_items")
        .select("*, menu_categories:category_id(*)")
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (itemId, updates) => {
    try {
      const { menu_categories, ...itemUpdates } = updates;
      const { error } = await supabase
        .from("menu_items")
        .update(itemUpdates)
        .eq("id", itemId);

      if (error) throw error;

      setEditingItem(null);
      fetchData();
    } catch (err) {
      setError("Failed to update item");
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      fetchData();
    } catch (err) {
      setError("Failed to delete item");
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
      fetchData();
    } catch (err) {
      setError("Failed to update category");
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

      fetchData();
    } catch (err) {
      setError("Failed to delete category");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Menu Management
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage your restaurant&apos;s categories and menu items
          </p>
        </div>

        {/* Categories Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">Categories</h3>
          </div>
          <div>
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    {editingCategory?.id === category.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            value={editingCategory.name}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                name: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 resize-y"
                            value={editingCategory.description || ""}
                            rows={4}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                description: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            value={editingCategory.order}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                order: parseInt(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="px-6 py-4 space-x-3">
                          <button
                            onClick={() =>
                              handleUpdateCategory(category.id, editingCategory)
                            }
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 break-words whitespace-pre-wrap">
                          {category.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {category.order}
                        </td>
                        <td className="px-6 py-4 space-x-3">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Delete
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

        {/* Menu Items Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">Menu Items</h3>
          </div>
          <div>
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    {editingItem?.id === item.id ? (
                      <>
                        <td className="px-6 py-4">
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
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
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            value={editingItem.name}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                name: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 resize-y"
                            value={editingItem.description}
                            rows={4}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                description: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <input
                              type="number"
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 pr-12"
                              value={editingItem.price}
                              onChange={(e) =>
                                setEditingItem({
                                  ...editingItem,
                                  price: parseInt(e.target.value),
                                })
                              }
                            />
                            <span className="absolute right-3 top-2 text-gray-500">
                              ISK
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                            value={editingItem.order}
                            onChange={(e) =>
                              setEditingItem({
                                ...editingItem,
                                order: parseInt(e.target.value),
                              })
                            }
                          />
                        </td>
                        <td className="px-6 py-4 space-x-3">
                          <button
                            onClick={() =>
                              handleUpdateItem(item.id, editingItem)
                            }
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.menu_categories.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 break-words whitespace-pre-wrap">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.price} ISK
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.order}
                        </td>
                        <td className="px-6 py-4 space-x-3">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Delete
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
      </div>
    </div>
  );
}
