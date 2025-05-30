import { createServerSupabase } from "@/util/supabase/server";

export async function GET(req) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  let query = supabase
    .from("work_credit_history")
    .select("*")
    .order("created_at", { ascending: false });

  if (email) {
    query = query.eq("email", email);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ history: data }, { status: 200 });
}
