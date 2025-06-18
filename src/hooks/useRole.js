import { useSession } from "next-auth/react";

export function useRole() {
  const { data: session, status } = useSession();
  return session?.user?.role || "guest"; // Default to 'guest' if not logged in
}
