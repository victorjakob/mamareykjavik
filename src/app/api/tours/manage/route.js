// app/api/tours/manage/route.js — admin CRUD for tours (auth required).

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

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ð/g, "d")
    .replace(/þ/g, "th")
    .replace(/æ/g, "ae")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Only these fields may be written from the admin form.
const WRITABLE_FIELDS = [
  "name",
  "slug",
  "subtitle",
  "description",
  "short_description",
  "long_description",
  "price",
  "duration_minutes",
  "max_capacity",
  "image_url",
  "gallery",
  "highlights",
  "itinerary",
  "included",
  "what_to_bring",
  "important_info",
  "meeting_point",
  "difficulty",
  "min_age",
  "schedule_note",
  "is_active",
  "private_base_price",
  "private_base_guests",
  "private_extra_guest_price",
  "private_max_guests",
  "private_description",
];

function pickWritable(data) {
  const out = {};
  for (const key of WRITABLE_FIELDS) {
    if (key in data) out[key] = data[key];
  }
  return out;
}

// Get all tours with their session counts
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const supabase = createServerSupabase();
    const data = pickWritable(await request.json());

    if (!data.name || !data.price || !data.duration_minutes || !data.max_capacity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!data.slug) data.slug = slugify(data.name);

    const { data: tour, error } = await supabase
      .from("tours")
      .insert([data])
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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const supabase = createServerSupabase();
    const body = await request.json();
    const { id } = body;
    const updateData = pickWritable(body);

    if (!id) {
      return NextResponse.json(
        { error: "Tour ID is required" },
        { status: 400 }
      );
    }

    if ("slug" in updateData && !updateData.slug && updateData.name) {
      updateData.slug = slugify(updateData.name);
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
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
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
