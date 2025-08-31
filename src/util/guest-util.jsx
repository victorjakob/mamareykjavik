import Cookies from "js-cookie";

export function getGuestId() {
  // This function should only be called when functional cookies are allowed
  // The calling component should check canSetFunctional first
  let guestId = Cookies.get("guest_id");
  if (!guestId) {
    guestId = `guest_${Math.random()
      .toString(36)
      .slice(2)}${Date.now().toString(36)}`;
    Cookies.set("guest_id", guestId, { expires: 365 });
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
