"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Shared state for inline shop admin mode.
 *
 *   - previewAsCustomer: when true, the admin chrome (overlays, admin bar)
 *     is hidden so the admin can see exactly what a visitor sees.
 *   - editingProduct / editingCategory: which entity, if any, has the
 *     side drawer open.
 *   - refresh(): re-runs the server component (router.refresh()) so the
 *     UI picks up the latest data after a mutation.
 *
 * Provider is only mounted when the viewer is admin — see ShopAdminLayer.
 */
const AdminCtx = createContext(null);

export function AdminProvider({ children }) {
  const router = useRouter();
  const [previewAsCustomer, setPreviewAsCustomer] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <AdminCtx.Provider
      value={{
        previewAsCustomer,
        setPreviewAsCustomer,
        editingProduct,
        setEditingProduct,
        editingCategory,
        setEditingCategory,
        refresh,
      }}
    >
      {children}
    </AdminCtx.Provider>
  );
}

export function useAdminCtx() {
  return useContext(AdminCtx);
}
