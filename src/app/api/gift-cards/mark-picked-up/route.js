import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Find gift card by access token
    const { data: giftCard, error: cardError } = await supabase
      .from("gift_cards")
      .select("id, delivery_method, status, picked_up")
      .eq("access_token", token)
      .single();

    if (cardError || !giftCard) {
      return NextResponse.json(
        { error: "Gift card not found" },
        { status: 404 }
      );
    }

    // Only allow pickup for pickup delivery method
    if (giftCard.delivery_method !== "pickup") {
      return NextResponse.json(
        { error: "This gift card is not for pickup" },
        { status: 400 }
      );
    }

    // Check if already picked up
    if (giftCard.picked_up) {
      return NextResponse.json(
        { error: "Gift card already picked up", card: giftCard },
        { status: 400 }
      );
    }

    // Check if payment is completed
    if (giftCard.status !== "paid") {
      return NextResponse.json(
        { error: "Gift card payment not completed" },
        { status: 400 }
      );
    }

    // Mark as picked up
    const { data: updatedCard, error: updateError } = await supabase
      .from("gift_cards")
      .update({
        picked_up: true,
        picked_up_at: new Date().toISOString(),
      })
      .eq("id", giftCard.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      message: "Gift card marked as picked up",
      card: updatedCard,
    });
  } catch (error) {
    console.error("Error marking gift card as picked up:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark gift card as picked up" },
      { status: 500 }
    );
  }
}

