import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Only admins can access
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from("whitelotus_bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (error) {
    console.error("Error in bookings API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

