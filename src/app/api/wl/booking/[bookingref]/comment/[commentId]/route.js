import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request, { params }) {
  try {
    const { bookingref, commentId } = await params;
    const body = await request.json();
    const { status, adminResponse } = body;

    if (!status || !["accepted", "declined"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'accepted' or 'declined'" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();

    // Verify booking exists
    const { data: booking, error: bookingError } = await supabase
      .from("whitelotus_bookings")
      .select("id")
      .eq("reference_id", bookingref)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Update comment status
    const updateData = {
      status,
      reviewed_by: session.user.email,
      reviewed_at: new Date().toISOString(),
    };

    // Add admin response if provided
    if (adminResponse && adminResponse.trim()) {
      updateData.admin_response = adminResponse.trim();
    }

    const { data: updatedComment, error: updateError } = await supabase
      .from("whitelotus_booking_comments")
      .update(updateData)
      .eq("id", commentId)
      .eq("booking_id", booking.id)
      .select()
      .single();

    if (updateError || !updatedComment) {
      return NextResponse.json(
        { error: "Comment not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, comment: updatedComment });
  } catch (error) {
    console.error("Error updating comment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

