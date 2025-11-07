import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { token, quantity = 1 } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (quantity < 1 || quantity > 5) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 5" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Get the meal card by token
    const { data: card, error: cardError } = await supabase
      .from("meal_cards")
      .select("*")
      .eq("access_token", token)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: "Card not found or invalid token" },
        { status: 404 }
      );
    }

    // Check if card is active and has meals remaining
    if (card.status !== "paid") {
      return NextResponse.json(
        { error: "Card is not active" },
        { status: 400 }
      );
    }

    if (card.meals_remaining < quantity) {
      return NextResponse.json(
        { error: `Only ${card.meals_remaining} meal(s) remaining on this card` },
        { status: 400 }
      );
    }

    // Check if card is expired
    const now = new Date();
    const validUntil = new Date(card.valid_until);
    if (now > validUntil) {
      return NextResponse.json(
        { error: "This card has expired" },
        { status: 400 }
      );
    }

    // Update the meal card
    const newMealsRemaining = card.meals_remaining - quantity;

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
        { error: "Failed to update meal card" },
        { status: 500 }
      );
    }

    // Log usage to history
    await supabase.from("meal_card_usage_history").insert({
      meal_card_id: card.id,
      quantity_used: quantity,
      meals_remaining_after: newMealsRemaining,
      used_by_email: card.buyer_email,
    });

    return NextResponse.json({
      success: true,
      updatedCards: [
        {
          ...updatedCard,
          mealsUsed: quantity,
        },
      ],
      totalMealsUsed: quantity,
      message: `${quantity} meal${quantity > 1 ? "s" : ""} used successfully`,
    });
  } catch (error) {
    console.error("Error using meal by token:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

