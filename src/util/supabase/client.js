import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getSession } from "next-auth/react";

export const supabase = createClientComponentClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const getSupabaseClient = async () => {
  const session = await getSession();
  console.log("🟢 NextAuth Session:", session);

  if (!session?.supabaseAccessToken) {
    console.warn("⚠️ No Supabase Access Token Found in Session");
    return createClientComponentClient();
  }

  console.log("✅ Attaching Supabase JWT:", session.supabaseAccessToken);

  return createClientComponentClient({
    options: {
      global: {
        headers: {
          Authorization: `Bearer ${session.supabaseAccessToken}`,
        },
      },
    },
  });
};
