// app/api/tours/sessions/route.js — session CRUD (mutations admin-only).
//
// POST supports `repeat_weeks`: creates the session plus weekly copies
// (same weekday & time) for the following N-1 weeks — "every Wednesday"
// in one click.

import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
}

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

// Create one session — or a weekly series when repeat_weeks > 1
export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const supabase = createServerSupabase();
    const data = await request.json();
    const { tour_id, start_time, available_spots } = data;
    const repeatWeeks = Math.min(Math.max(parseInt(data.repeat_weeks, 10) || 1, 1), 52);

    if (!tour_id || !start_time || !available_spots) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const first = new Date(start_time);
    const rows = Array.from({ length: repeatWeeks }, (_, i) => ({
      tour_id,
      start_time: new Date(first.getTime() + i * 7 * 24 * 60 * 60 * 1000).toISOString(),
      available_spots,
    }));

    const { data: sessions, error } = await supabase
      .from("tour_sessions")
      .insert(rows)
      .select();

    if (error) throw error;

    // Keep the old single-session response shape, add the full list.
    return NextResponse.json({ session: sessions[0], sessions });
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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
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
