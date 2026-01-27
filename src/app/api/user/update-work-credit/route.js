import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST(req) {
  const supabase = createServerSupabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userEmail = session.user.email;
  const { amount } = await req.json();

  // First get current credit
  const { data: currentCredit, error: fetchError } = await supabase
    .from("work_credit")
    .select("amount")
    .eq("email", userEmail)
    .single();

  if (fetchError) {
    return Response.json({ error: fetchError.message }, { status: 500 });
  }

  const newAmount = currentCredit.amount + amount;

  // Check if the new amount would be negative
  if (newAmount < 0) {
    return Response.json(
      { error: "Insufficient credit available" },
      { status: 400 }
    );
  }

  // Update the credit (keep the row even if amount is 0)
  const { error: updateError } = await supabase
    .from("work_credit")
    .update({ amount: newAmount })
    .eq("email", userEmail);

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  // Log to work_credit_history
  await supabase.from("work_credit_history").insert([
    {
      email: userEmail,
      amount,
      type: "use",
      note: "User used credit",
    },
  ]);

  return Response.json({ newAmount }, { status: 200 });
}
