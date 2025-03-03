import Master from "@/app/components/Shop/cart/Master";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { CartService } from "@/util/cart-util";

export default async function CartPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const cookieStore = await cookies();
  const guestId = cookieStore.get("guest_id")?.value;

  const { cart, items } = await CartService.fetchCartData(session, guestId);

  return <Master initialCart={cart} initialItems={items} />;
}
