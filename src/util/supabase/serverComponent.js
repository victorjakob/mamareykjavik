import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createServerSupabaseComponent() {
  const cookieStore = await cookies(); // ✅ Must be awaited
  return createServerComponentClient({ cookies: () => cookieStore });
}
