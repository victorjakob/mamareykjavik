import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (
      !session?.user?.role ||
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all usage history with card details
    const supabase = createServerSupabase();
    const { data: history, error: historyError } = await supabase
      .from("meal_card_usage_history")
      .select(`
        *,
        meal_card:meal_cards (
          buyer_name,
          buyer_email,
          order_id
        )
      `)
      .order("used_at", { ascending: false });

    if (historyError) {
      console.error("Error fetching usage history:", historyError);
      return NextResponse.json(
        { error: "Failed to fetch usage history" },
        { status: 500 }
      );
    }

    // Calculate total meals used
    const totalMealsUsed = history.reduce(
      (sum, record) => sum + record.quantity_used,
      0
    );

    return NextResponse.json({ 
      history,
      totalMealsUsed
    });
  } catch (error) {
    console.error("Error in usage history route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

