import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

// Endpoint to reset next_payment_date for overdue subscriptions without processing payments
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

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate 1st of next month (e.g., if today is Jan 27, target is Feb 1)
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 1);
    targetDate.setDate(1);
    targetDate.setHours(0, 0, 0, 0);

    // Get all active subscriptions that are overdue (next_payment_date is in the past)
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
          message: "No overdue subscriptions found",
          updated: 0,
        },
        { status: 200 }
      );
    }

    const results = [];
    const errors = [];

    // Update each subscription's next_payment_date
    for (const subscription of subscriptions) {
      try {
        const { error: updateError } = await supabase
          .from("auto_credit_subscriptions")
          .update({
            next_payment_date: targetDate.toISOString(),
          })
          .eq("id", subscription.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        results.push({
          email: subscription.email,
          oldDate: subscription.next_payment_date,
          newDate: targetDate.toISOString(),
          success: true,
        });
      } catch (error) {
        console.error(
          `Error updating subscription for ${subscription.email}:`,
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
        message: `Updated ${results.length} subscription(s)`,
        updated: results.length,
        targetDate: targetDate.toISOString(),
        results,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset dates error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
