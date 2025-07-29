"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StoreNavigation() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path
      ? "bg-indigo-600 text-white shadow-lg"
      : "text-gray-700 hover:bg-gray-100 hover:shadow-md";
  };

  return (
    <nav className="pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-2 md:flex md:flex-row justify-center gap-4 md:gap-0 md:space-x-8">
          <Link
            href="/admin/manage-store"
            className={`px-6 py-4 border-2 border-indigo-600 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:transform hover:-translate-y-0.5 text-center ${isActive(
              "/admin/manage-store"
            )}`}
          >
            Dashboard
          </Link>

          <Link
            href="/admin/manage-store/products"
            className={`px-6 py-4 border-2 border-indigo-600 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:transform hover:-translate-y-0.5 text-center ${isActive(
              "/admin/manage-store/products"
            )}`}
          >
            Products
          </Link>

          <Link
            href="/admin/manage-store/categories"
            className={`px-6 py-4 border-2 border-indigo-600 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:transform hover:-translate-y-0.5 text-center ${isActive(
              "/admin/manage-store/categories"
            )}`}
          >
            Categories
          </Link>
          <Link
            href="/admin/manage-store/orders"
            className={`px-6 py-4 border-2 border-indigo-600 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:transform hover:-translate-y-0.5 text-center ${isActive(
              "/admin/manage-store/orders"
            )}`}
          >
            Orders
          </Link>
        </div>
      </div>
    </nav>
  );
}
