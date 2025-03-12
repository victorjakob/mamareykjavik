import { useSession } from "next-auth/react";

export function useRole() {
  const { data: session, status } = useSession();
  console.log("Session data:", session); // Debug session contents
  console.log("User data:", session?.user); // Debug user contents
  return session?.user?.role || "guest"; // Default to 'guest' if not logged in
}
