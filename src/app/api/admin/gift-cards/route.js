import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const searchTerm = searchParams.get("search");

    let query = supabase.from("gift_cards").select("*").order("created_at", {
      ascending: false,
    });

    // Exclude pending cards by default (only show completed payments)
    // Only show pending if explicitly requested via status filter
    if (statusFilter && statusFilter === "pending") {
      query = query.eq("status", "pending");
    } else {
      // Exclude pending - only show paid/sent cards
      query = query.neq("status", "pending");
      
      // Apply additional status filter if provided
      if (statusFilter && statusFilter !== "all") {
        if (statusFilter === "sent") {
          query = query.eq("status", "sent");
        } else if (statusFilter === "paid") {
          query = query.eq("status", "paid");
        }
      }
    }

    const { data: cards, error } = await query;

    if (error) {
      throw error;
    }

    // Apply search filter if provided
    let filteredCards = cards || [];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredCards = filteredCards.filter(
        (card) =>
          card.buyer_name?.toLowerCase().includes(searchLower) ||
          card.buyer_email?.toLowerCase().includes(searchLower) ||
          card.order_id?.toLowerCase().includes(searchLower) ||
          card.recipient_name?.toLowerCase().includes(searchLower) ||
          card.recipient_email?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ cards: filteredCards });
  } catch (error) {
    console.error("Error fetching gift cards:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch gift cards" },
      { status: 500 }
    );
  }
}

