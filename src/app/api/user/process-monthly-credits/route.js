import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

// Manual trigger endpoint for admins to process overdue subscriptions
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
      { status: 403 },
    );
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active subscriptions that are due for payment (including overdue ones)
    const { data: subscriptions, error: fetchError } = await supabase
      .from("auto_credit_subscriptions")
      .select("*")
      .eq("is_active", true)
      .lte("next_payment_date", today.toISOString());

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      return Response.json({ error: fetchError.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return Response.json(
        {
          message: "No subscriptions due for payment",
          processed: 0,
        },
        { status: 200 },
      );
    }

    const results = [];
    const errors = [];

    // Process each subscription
    for (const subscription of subscriptions) {
      try {
        // Calculate how many months are overdue
        const nextPaymentDate = new Date(subscription.next_payment_date);
        const monthsOverdue = Math.max(
          0,
          (today.getFullYear() - nextPaymentDate.getFullYear()) * 12 +
            (today.getMonth() - nextPaymentDate.getMonth()),
        );

        // If subscription is overdue by more than 1 month, process all missed months
        const monthsToProcess = Math.max(1, monthsOverdue + 1);

        // Get current credit amount
        const { data: existingCredit, error: fetchCreditError } = await supabase
          .from("work_credit")
          .select("amount")
          .eq("email", subscription.email)
          .single();

        let currentAmount = 0;
        if (fetchCreditError && fetchCreditError.code !== "PGRST116") {
          throw new Error(fetchCreditError.message);
        }
        if (existingCredit) {
          currentAmount = existingCredit.amount;
        }

        // Calculate total amount to add (for all missed months)
        const totalAmountToAdd = subscription.monthly_amount * monthsToProcess;
        const newAmount = currentAmount + totalAmountToAdd;

        // Update or create work credit
        let result;
        if (existingCredit) {
          result = await supabase
            .from("work_credit")
            .update({ amount: newAmount })
            .eq("email", subscription.email)
            .select();
        } else {
          result = await supabase
            .from("work_credit")
            .insert([
              {
                email: subscription.email,
                amount: newAmount,
              },
            ])
            .select();
        }

        if (result.error) {
          throw new Error(result.error.message);
        }

        // Log each month to work_credit_history
        for (let i = 0; i < monthsToProcess; i++) {
          const paymentDate = new Date(nextPaymentDate);
          paymentDate.setMonth(paymentDate.getMonth() + i);

          const { error: historyError } = await supabase
            .from("work_credit_history")
            .insert([
              {
                email: subscription.email,
                amount: subscription.monthly_amount,
                type: "add",
                note: `Monthly auto-credit (${paymentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}): ${subscription.description || "Auto-subscription"}`,
              },
            ]);

          if (historyError) {
            console.error("Error logging to history:", historyError);
          }
        }

        // Update next payment date to the 1st of next month
        const updatedNextPaymentDate = new Date();
        updatedNextPaymentDate.setMonth(updatedNextPaymentDate.getMonth() + 1);
        updatedNextPaymentDate.setDate(1);
        updatedNextPaymentDate.setHours(0, 0, 0, 0);

        const { error: updateError } = await supabase
          .from("auto_credit_subscriptions")
          .update({
            next_payment_date: updatedNextPaymentDate.toISOString(),
            last_payment_date: today.toISOString(),
          })
          .eq("id", subscription.id);

        if (updateError) {
          console.error("Error updating next payment date:", updateError);
          throw new Error(updateError.message);
        }

        results.push({
          email: subscription.email,
          amount: totalAmountToAdd,
          monthsProcessed: monthsToProcess,
          newTotal: newAmount,
          success: true,
        });
      } catch (error) {
        console.error(
          `Error processing subscription for ${subscription.email}:`,
          error,
        );
        errors.push({
          email: subscription.email,
          error: error.message,
        });
      }
    }

    return Response.json(
      {
        message: `Processed ${results.length} subscriptions`,
        processed: results.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Manual trigger error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
