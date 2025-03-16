import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, amount } = await req.json();

  // Validate inputs
  if (!email || typeof amount !== "number") {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  // First check if user already has a credit row
  const { data: existingCredit, error: fetchError } = await supabase
    .from("work_credit")
    .select("amount")
    .eq("email", email)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 is "not found" error
    return Response.json({ error: fetchError.message }, { status: 500 });
  }

  let result;

  if (existingCredit) {
    // Update existing record
    const newAmount = existingCredit.amount + amount;
    result = await supabase
      .from("work_credit")
      .update({ amount: newAmount })
      .eq("email", email)
      .select();
  } else {
    // Create new record
    result = await supabase
      .from("work_credit")
      .insert([{ email, amount }])
      .select();
  }

  if (result.error) {
    return Response.json({ error: result.error.message }, { status: 500 });
  }

  return Response.json({ data: result.data[0] }, { status: 200 });
}
