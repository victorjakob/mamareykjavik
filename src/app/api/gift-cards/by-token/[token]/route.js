import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Find gift card by access token
    const { data: giftCard, error: cardError } = await supabase
      .from("gift_cards")
      .select("*")
      .eq("access_token", token)
      .single();

    if (cardError || !giftCard) {
      return NextResponse.json(
        { error: "Gift card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ card: giftCard });
  } catch (error) {
    console.error("Error fetching gift card:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
