import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request, { params }) {
  try {
    const { bookingref } = await params;
    const session = await getServerSession(authOptions);

    // Only admins can cancel bookings
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const supabase = createServerSupabase();

    // Update booking status to cancelled
    const { data, error } = await supabase
      .from("whitelotus_bookings")
      .update({ status: "cancelled" })
      .eq("reference_id", bookingref)
      .select()
      .single();

    if (error) {
      console.error("Error cancelling booking:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      booking: data 
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
