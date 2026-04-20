"use client";

import StoreNavigation from "@/app/admin/manage-store/components/store/Navigation";
import {
  AdminShell,
  AdminHeader,
} from "@/app/admin/components/AdminShell";

export default function ManageStoreLayout({ children }) {
  return (
    <AdminShell maxWidth="max-w-6xl">
      <AdminHeader
        eyebrow="Admin"
        title="Store"
        subtitle="Products, categories & orders"
      />
      <StoreNavigation />
      <div className="transition-all duration-300 ease-in-out">{children}</div>
    </AdminShell>
  );
}
