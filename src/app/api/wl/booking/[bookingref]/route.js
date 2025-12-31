import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request, { params }) {
  try {
    // In Next.js 15, params is a Promise and needs to be awaited
    const { bookingref } = await params;
    const supabase = createServerSupabase();
    const session = await getServerSession(authOptions);

    console.log("Fetching booking with reference ID:", bookingref);

    if (!bookingref) {
      return NextResponse.json(
        { error: "Bókunarnúmer vantar" },
        { status: 400 }
      );
    }

    // Fetch booking by reference ID (exact match first, then case-insensitive)
    let { data: booking, error } = await supabase
      .from("whitelotus_bookings")
      .select("*")
      .eq("reference_id", bookingref) // Exact match first
      .single();

    if (error) {
      console.error("Database error fetching booking:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);

      // Check if it's a "not found" error
      if (error.code === "PGRST116" || error.message?.includes("No rows")) {
        // Try case-insensitive search as fallback
        const { data: bookingCaseInsensitive, error: error2 } = await supabase
          .from("whitelotus_bookings")
          .select("*")
          .ilike("reference_id", bookingref)
          .single();

        if (error2 || !bookingCaseInsensitive) {
          console.error("Booking not found with reference ID:", bookingref);
          return NextResponse.json(
            { error: "Bókun fannst ekki", referenceId: bookingref },
            { status: 404 }
          );
        }

        // Found with case-insensitive search
        const isAdmin = session?.user?.role === "admin";
        const isOwner =
          session?.user?.email === bookingCaseInsensitive.contact_email;

        return NextResponse.json({
          booking: bookingCaseInsensitive,
          isAdmin: isAdmin || false,
          isOwner: isOwner || false,
        });
      }

      return NextResponse.json(
        { error: "Villa við að sækja bókun", details: error.message },
        { status: 500 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { error: "Bókun fannst ekki", referenceId: bookingref },
        { status: 404 }
      );
    }

    // Check if user is admin
    const isAdmin = session?.user?.role === "admin";

    // If not admin, check if the booking email matches the logged-in user's email
    const isOwner = session?.user?.email === booking.contact_email;

    // Fetch comments for this booking
    const { data: comments, error: commentsError } = await supabase
      .from("whitelotus_booking_comments")
      .select("*")
      .eq("booking_id", booking.id)
      .order("created_at", { ascending: false });

    // Allow access if:
    // 1. User is admin
    // 2. User is the owner
    // 3. No session (public access via secret link - reference ID acts as authentication)
    return NextResponse.json({
      booking,
      comments: comments || [],
      isAdmin: isAdmin || false,
      isOwner: isOwner || false,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Villa við að sækja bókun", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    // In Next.js 15, params is a Promise and needs to be awaited
    const { bookingref } = await params;
    const body = await request.json();
    const session = await getServerSession(authOptions);

    // Only admins can update bookings
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Óheimilt aðgangur" }, { status: 403 });
    }

    const supabase = createServerSupabase();

    // Update booking
    const { data, error } = await supabase
      .from("whitelotus_bookings")
      .update(body)
      .eq("reference_id", bookingref)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Villa við að uppfæra bókun" },
      { status: 500 }
    );
  }
}
