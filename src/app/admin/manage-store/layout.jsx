"use client";

import StoreNavigation from "@/app/components/admin/store/Navigation";

export default function ManageStoreLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <StoreNavigation />
      <div className="px-4 py-8 transition-all duration-300 ease-in-out">
        {children}
      </div>
    </div>
  );
}
