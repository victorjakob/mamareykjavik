"use client";

import { useRole } from "@/hooks/useRole";

/**
 * Convenience wrapper around useRole for the "is the current viewer an
 * admin?" check that the inline shop controls use.
 *
 * IMPORTANT: this is a UI-gating helper only. Every mutation must also
 * be re-verified server-side (see /api/admin/store/_helpers.js).
 */
export function useIsAdmin() {
  const role = useRole();
  return role === "admin";
}
