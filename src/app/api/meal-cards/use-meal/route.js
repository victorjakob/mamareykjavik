import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { quantity = 1 } = await req.json();

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return NextResponse.json(
        { error: "Quantity must be a positive integer" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Get all active meal cards for the user
    const now = new Date();
    const { data: allCards, error: fetchError } = await supabase
      .from("meal_cards")
      .select("*")
      .eq("buyer_email", session.user.email)
      .eq("status", "paid")
      .gte("valid_until", now.toISOString().split("T")[0])
      .gt("meals_remaining", 0)
      .order("created_at", { ascending: true }); // Use oldest cards first

    if (fetchError) {
      return NextResponse.json(
        { error: "Failed to fetch meal cards" },
        { status: 500 }
      );
    }

    if (!allCards || allCards.length === 0) {
      return NextResponse.json(
        { error: "No active meal cards found" },
        { status: 404 }
      );
    }

    // Calculate total meals available
    const totalMealsAvailable = allCards.reduce(
      (sum, card) => sum + card.meals_remaining,
      0
    );

    if (quantity > totalMealsAvailable) {
      return NextResponse.json(
        { error: `Cannot use ${quantity} meals. Only ${totalMealsAvailable} meal${totalMealsAvailable !== 1 ? "s" : ""} available across all cards.` },
        { status: 400 }
      );
    }

    // Distribute quantity across cards (use oldest first)
    let remainingToUse = quantity;
    const updatedCards = [];

    for (const card of allCards) {
      if (remainingToUse <= 0) break;

      const mealsToUseFromThisCard = Math.min(remainingToUse, card.meals_remaining);
      const newMealsRemaining = card.meals_remaining - mealsToUseFromThisCard;

      const { data: updatedCard, error: updateError } = await supabase
        .from("meal_cards")
        .update({
          meals_remaining: newMealsRemaining,
          updated_at: new Date().toISOString(),
        })
        .eq("id", card.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating meal card:", updateError);
        return NextResponse.json(
          { error: `Failed to update meal card ${card.id}` },
          { status: 500 }
        );
      }

      // Log usage to history
      await supabase.from("meal_card_usage_history").insert({
        meal_card_id: card.id,
        quantity_used: mealsToUseFromThisCard,
        meals_remaining_after: newMealsRemaining,
        used_by_email: session.user.email,
      });

      updatedCards.push({
        ...updatedCard,
        mealsUsed: mealsToUseFromThisCard,
      });

      remainingToUse -= mealsToUseFromThisCard;
    }

    return NextResponse.json({
      success: true,
      updatedCards,
      totalMealsUsed: quantity,
      message: `${quantity} meal${quantity > 1 ? "s" : ""} used successfully`,
    });
  } catch (error) {
    console.error("Error using meal:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

