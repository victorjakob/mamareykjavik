import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function GET(req) {
  const supabase = createServerSupabase();
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is admin
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return Response.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  // Fetch all work credits from the database
  const { data, error } = await supabase
    .from("work_credit")
    .select("email, amount");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ workCredits: data }, { status: 200 });
}
