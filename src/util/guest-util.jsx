import Cookies from "js-cookie";

export function getGuestId() {
  let guestId = Cookies.get("guest_id");
  if (!guestId) {
    guestId = `guest_${Math.random()
      .toString(36)
      .slice(2)}${Date.now().toString(36)}`;
    Cookies.set("guest_id", guestId, { expires: 365 });
  }
  return guestId;
}
