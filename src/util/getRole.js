import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * Server-side utility to get user role from session
 * Similar to useRole() hook but for server components and API routes
 * @returns {Promise<string>} User role or "guest" if not authenticated
 */
export async function getRole() {
  const session = await getServerSession(authOptions);
  return session?.user?.role || "guest";
}

/**
 * Server-side utility to check if user is admin
 * @returns {Promise<boolean>} True if user is admin
 */
export async function isAdmin() {
  const role = await getRole();
  return role === "admin";
}

