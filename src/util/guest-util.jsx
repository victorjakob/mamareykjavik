import Cookies from "js-cookie";

// Client-side function for use in client components
export function getGuestId() {
  // Try to get guest ID from cookies
  let guestId = Cookies.get("guest_id");
  
  if (!guestId) {
    // Generate a new guest ID
    guestId = `guest_${Math.random()
      .toString(36)
      .slice(2)}${Date.now().toString(36)}`;
    
    // Always try to set the cookie for cart functionality
    // This is essential for cart to work, so we don't require consent
    try {
    Cookies.set("guest_id", guestId, { expires: 365 });
    } catch (e) {
      // Cookie setting failed, but guest ID is still returned
      // The cart will work within the session even without cookies
    }
  }
  
  return guestId;
}

// Server-side function for use in server components and API routes
export async function getGuestIdServer() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  
  // Try to get guest ID from cookies
  const guestId = cookieStore.get("guest_id")?.value;
  
  if (!guestId) {
    // Return null if no guest ID found on server side
    // We can't set cookies from server components without headers
    return null;
  }
  
  return guestId;
}

// New function that checks consent before setting cookies
export function getGuestIdWithConsent(canSetFunctional) {
  if (!canSetFunctional) {
    // Return a temporary ID that won't be stored
    return `temp_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
  return getGuestId();
}
