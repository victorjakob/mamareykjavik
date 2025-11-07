import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);

    // Check if user is admin (role is already in session from JWT callback)
    if (
      !session?.user?.role ||
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all meal cards, ordered by creation date (newest first)
    const supabase = createServerSupabase();
    const { data: cards, error: cardsError } = await supabase
      .from("meal_cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (cardsError) {
      console.error("Error fetching meal cards:", cardsError);
      return NextResponse.json(
        { error: "Failed to fetch meal cards" },
        { status: 500 }
      );
    }

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Error in meal cards admin route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

