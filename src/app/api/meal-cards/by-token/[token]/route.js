import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Fetch the meal card by access_token
    const { data: card, error } = await supabase
      .from("meal_cards")
      .select("*")
      .eq("access_token", token)
      .single();

    if (error || !card) {
      return NextResponse.json(
        { error: "Card not found or invalid token" },
        { status: 404 }
      );
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error("Error fetching meal card by token:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

