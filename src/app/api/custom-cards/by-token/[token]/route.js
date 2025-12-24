import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Find custom card by access token
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

    // Handle monthly reset/add if needed
    if (card.expiration_type === "monthly_reset" || card.expiration_type === "monthly_add") {
      const now = new Date();
      const lastReset = card.last_reset_date ? new Date(card.last_reset_date) : new Date(card.created_at);
      
      // Check if we need to reset/add (if it's a new month)
      const needsUpdate = 
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear();

      if (needsUpdate) {
        let updateData = {
          last_reset_date: now.toISOString(),
        };

        if (card.expiration_type === "monthly_reset") {
          // Reset to original amount
          updateData.remaining_balance = card.amount;
        } else if (card.expiration_type === "monthly_add" && card.monthly_amount) {
          // Add monthly amount
          updateData.remaining_balance = card.remaining_balance + card.monthly_amount;
        }

        const { data: updatedCard } = await supabase
          .from("custom_cards")
          .update(updateData)
          .eq("id", card.id)
          .select()
          .single();

        if (updatedCard) {
          return NextResponse.json({ card: updatedCard });
        }
      }
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error("Error fetching custom card:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

