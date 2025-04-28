import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";

// Get sessions for a specific tour
export async function GET(request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get("tourId");

    if (!tourId) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      );
    }

    const { data: sessions, error } = await supabase
      .from("tour_sessions")
      .select(
        `
        *,
        tour_bookings (
          count,
          number_of_tickets
        )
      `
      )
      .eq("tour_id", tourId)
      .order("start_time", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// Create a new session
export async function POST(request) {
  try {
    const supabase = createServerSupabase();
    const data = await request.json();
    const { tour_id, start_time, available_spots } = data;

    if (!tour_id || !start_time || !available_spots) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: session, error } = await supabase
      .from("tour_sessions")
      .insert([{ tour_id, start_time, available_spots }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

// Update a session
export async function PUT(request) {
  try {
    const supabase = createServerSupabase();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const { data: session, error } = await supabase
      .from("tour_sessions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// Delete a session
export async function DELETE(request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("tour_sessions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
