import Master from "@/app/shop/cart/Master";
import { getServerSession } from "next-auth";
import { CartService } from "@/util/cart-util";
import { authOptions } from "@/lib/authOptions";
import { getGuestId } from "@/util/guest-util";

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  const guestId = getGuestId();

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
        // address: session.user.address || "",
        // phone: session.user.phone || "",
      }
    : null;

  const { cart, items } = await CartService.fetchCartData(user?.email, guestId);

  return <Master initialCart={cart} initialItems={items} user={user} />;
}
