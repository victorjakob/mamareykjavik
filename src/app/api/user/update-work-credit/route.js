import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
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

  // If newAmount is 0, delete the row instead of updating
  if (newAmount === 0) {
    const { error: deleteError } = await supabase
      .from("work_credit")
      .delete()
      .eq("email", userEmail);

    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }
  } else {
    // Update the credit
    const { error: updateError } = await supabase
      .from("work_credit")
      .update({ amount: newAmount })
      .eq("email", userEmail);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }
  }

  return Response.json({ newAmount }, { status: 200 });
}
