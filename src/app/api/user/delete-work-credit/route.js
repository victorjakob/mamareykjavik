import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST(req) {
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

  const { email } = await req.json();

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  // Fetch the current amount before deleting
  const { data: currentCredit, error: fetchError } = await supabase
    .from("work_credit")
    .select("amount")
    .eq("email", email)
    .single();

  let deletedAmount = 0;
  if (currentCredit && typeof currentCredit.amount === "number") {
    deletedAmount = currentCredit.amount;
  }

  // Delete the work credit entry
  const { error } = await supabase
    .from("work_credit")
    .delete()
    .eq("email", email);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Log to work_credit_history
  await supabase.from("work_credit_history").insert([
    {
      email,
      amount: deletedAmount,
      type: "delete",
      note: "Admin deleted credit",
    },
  ]);

  return Response.json(
    { message: "Work credit deleted successfully" },
    { status: 200 }
  );
}
