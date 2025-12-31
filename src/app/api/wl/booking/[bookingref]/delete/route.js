import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(request, { params }) {
  try {
    const { bookingref } = await params;
    const session = await getServerSession(authOptions);

    // Only admins can delete bookings
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const supabase = createServerSupabase();

    // Delete booking
    const { error } = await supabase
      .from("whitelotus_bookings")
      .delete()
      .eq("reference_id", bookingref);

    if (error) {
      console.error("Error deleting booking:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}

