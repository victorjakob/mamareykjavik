import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function GET(req) {
  const supabase = createServerSupabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = session.user.email; // ✅ Get user email from NextAuth session

  // Fetch work credit for the authenticated user
  const { data, error } = await supabase
    .from("work_credit")
    .select("amount")
    .eq("email", userEmail)
    .single();

  if (error) {
    // Handle PGRST116 error (not found) separately
    if (error.code === "PGRST116") {
      return Response.json({ amount: null }, { status: 200 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ amount: data.amount }, { status: 200 });
}
