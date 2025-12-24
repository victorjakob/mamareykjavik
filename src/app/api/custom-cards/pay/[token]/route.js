import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";

// POST - Process a payment using the custom card
export async function POST(req, { params }) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { amount } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: "Amount must be a positive integer" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Get the card with a lock to prevent race conditions
    const { data: card, error: cardError } = await supabase
      .from("custom_cards")
      .select("*")
      .eq("access_token", token)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: "Custom card not found" },
        { status: 404 }
      );
    }

    // Check if card is active
    if (card.status !== "active") {
      return NextResponse.json(
        { error: `Card is ${card.status}` },
        { status: 400 }
      );
    }

    // Check if card has sufficient balance
    if (card.remaining_balance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ${card.remaining_balance} kr.` },
        { status: 400 }
      );
    }

    // Check expiration if applicable
    if (card.expiration_type === "date" && card.expiration_date) {
      const now = new Date();
      const expiration = new Date(card.expiration_date);
      if (now > expiration) {
        // Auto-update status to expired
        await supabase
          .from("custom_cards")
          .update({ status: "expired" })
          .eq("id", card.id);
        
        return NextResponse.json(
          { error: "This card has expired" },
          { status: 400 }
        );
      }
    }

    // Calculate new balance
    const newBalance = card.remaining_balance - amount;
    const newStatus = newBalance === 0 ? "used" : card.status;

    // Update the card balance atomically
    const { data: updatedCard, error: updateError } = await supabase
      .from("custom_cards")
      .update({
        remaining_balance: newBalance,
        status: newStatus,
      })
      .eq("id", card.id)
      .eq("remaining_balance", card.remaining_balance) // Optimistic locking to prevent double payment
      .select()
      .single();

    if (updateError || !updatedCard) {
      // If update failed, it might be due to concurrent payment - refetch to check
      const { data: currentCard } = await supabase
        .from("custom_cards")
        .select("*")
        .eq("id", card.id)
        .single();

      if (currentCard && currentCard.remaining_balance < card.remaining_balance) {
        return NextResponse.json(
          { error: "Payment already processed. Please refresh the page." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to process payment. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      card: updatedCard,
      amount_paid: amount,
      remaining_balance: newBalance,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

