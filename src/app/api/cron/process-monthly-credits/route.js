import { createServerSupabase } from "@/util/supabase/server";

export async function POST(req) {
  // Verify this is coming from Vercel Cron or authorized source
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active subscriptions that are due for payment today
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
          message: "No subscriptions due for payment today",
          processed: 0,
        },
        { status: 200 }
      );
    }

    const results = [];
    const errors = [];

    // Process each subscription
    for (const subscription of subscriptions) {
      try {
        // Check if user already has a credit row
        const { data: existingCredit, error: fetchCreditError } = await supabase
          .from("work_credit")
          .select("amount")
          .eq("email", subscription.email)
          .single();

        let newAmount;
        let result;

        if (fetchCreditError && fetchCreditError.code !== "PGRST116") {
          throw new Error(fetchCreditError.message);
        }

        if (existingCredit) {
          // Update existing record
          newAmount = existingCredit.amount + subscription.monthly_amount;
          result = await supabase
            .from("work_credit")
            .update({ amount: newAmount })
            .eq("email", subscription.email)
            .select();
        } else {
          // Create new record
          newAmount = subscription.monthly_amount;
          result = await supabase
            .from("work_credit")
            .insert([
              {
                email: subscription.email,
                amount: subscription.monthly_amount,
              },
            ])
            .select();
        }

        if (result.error) {
          throw new Error(result.error.message);
        }

        // Log to work_credit_history
        const { error: historyError } = await supabase
          .from("work_credit_history")
          .insert([
            {
              email: subscription.email,
              amount: subscription.monthly_amount,
              type: "add",
              note: `Monthly auto-credit: ${subscription.description || "Auto-subscription"}`,
            },
          ]);

        if (historyError) {
          console.error("Error logging to history:", historyError);
        }

        // Update next payment date (30 days from now)
        const nextPaymentDate = new Date();
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);

        const { error: updateError } = await supabase
          .from("auto_credit_subscriptions")
          .update({
            next_payment_date: nextPaymentDate.toISOString(),
            last_payment_date: today.toISOString(),
          })
          .eq("id", subscription.id);

        if (updateError) {
          console.error("Error updating next payment date:", updateError);
        }

        results.push({
          email: subscription.email,
          amount: subscription.monthly_amount,
          newTotal: newAmount,
          success: true,
        });
      } catch (error) {
        console.error(
          `Error processing subscription for ${subscription.email}:`,
          error
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
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron job error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Allow GET for testing (remove in production)
export async function GET(req) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Not allowed in production" },
      { status: 403 }
    );
  }

  return await POST(req);
}
