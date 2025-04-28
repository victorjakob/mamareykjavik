import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";

// Get all tours with their session counts
export async function GET() {
  try {
    const supabase = createServerSupabase();

    const { data: tours, error } = await supabase
      .from("tours")
      .select(
        `
        *,
        tour_sessions (
          count
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ tours });
  } catch (error) {
    console.error("Error fetching tours:", error);
    return NextResponse.json(
      { error: "Failed to fetch tours" },
      { status: 500 }
    );
  }
}

// Create a new tour
export async function POST(request) {
  try {
    const supabase = createServerSupabase();
    const data = await request.json();

    const { name, description, price, duration_minutes, max_capacity } = data;

    // Validate required fields
    if (!name || !price || !duration_minutes || !max_capacity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: tour, error } = await supabase
      .from("tours")
      .insert([{ name, description, price, duration_minutes, max_capacity }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ tour });
  } catch (error) {
    console.error("Error creating tour:", error);
    return NextResponse.json(
      { error: "Failed to create tour" },
      { status: 500 }
    );
  }
}

// Update a tour
export async function PUT(request) {
  try {
    const supabase = createServerSupabase();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      );
    }

    const { data: tour, error } = await supabase
      .from("tours")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ tour });
  } catch (error) {
    console.error("Error updating tour:", error);
    return NextResponse.json(
      { error: "Failed to update tour" },
      { status: 500 }
    );
  }
}

// Delete a tour
export async function DELETE(request) {
  try {
    const supabase = createServerSupabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("tours").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tour:", error);
    return NextResponse.json(
      { error: "Failed to delete tour" },
      { status: 500 }
    );
  }
}
