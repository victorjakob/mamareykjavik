import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

const SECTION_LABELS = {
  guest_count: "Guest count",
  services: "Services",
  food: "Food",
  drinks: "Drinks",
  room_setup: "Room setup",
  tech_and_music: "Tech & music",
  tablecloth: "Tablecloth & decoration",
  notes: "Notes",
  event_info: "Event info",
  contact: "Contact",
};

export async function POST(request, { params }) {
  try {
    const { bookingref } = await params;
    const body = await request.json();
    const { section, comment, notifyCustomer, isInternal } = body;

    if (!section || !comment || !comment.trim()) {
      return NextResponse.json(
        { error: "Section and comment are required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const supabase = createServerSupabase();

    // Get booking to verify it exists and get customer email
    const { data: booking, error: bookingError } = await supabase
      .from("whitelotus_bookings")
      .select("id, contact_name, contact_email, reference_id")
      .eq("reference_id", bookingref)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Determine user status from session (similar to useRole() pattern)
    const role = session?.user?.role || "guest";
    const userIsAdmin = role === "admin";
    let isCustomer = false;
    let userEmail = booking.contact_email; // Default to booking email for public access

    if (session?.user?.email) {
      userEmail = session.user.email;
      isCustomer = booking.contact_email === session.user.email;

      // Verify the user is the customer (email matches) or admin
      if (!userIsAdmin && !isCustomer) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      // No session - assume it's a customer accessing via booking link
      isCustomer = true;
    }

    // Only admins can create internal notes
    const isInternalNote = isInternal && userIsAdmin;

    // Create comment - auto-approve if admin
    const { data: newComment, error: commentError } = await supabase
      .from("whitelotus_booking_comments")
      .insert({
        booking_id: booking.id,
        section,
        comment: comment.trim(),
        status: userIsAdmin ? "accepted" : "pending", // Auto-approve admin comments
        created_by_email: userEmail,
        is_internal: isInternalNote, // Only admins can create internal notes
      })
      .select()
      .single();

    if (commentError) {
      console.error("Error creating comment:", commentError);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";
    const bookingUrl = `${baseUrl}/whitelotus/booking/${bookingref}`;
    const sectionLabel = SECTION_LABELS[section] || section;
    const contactName =
      booking.contact_name || booking.contact_email || "Unknown";

    // Send email notifications (skip internal-only notes).
    // The manifest id (passed to renderEmail) is also what appears in the
    // hub at /admin/email, so each direction has its own id even though
    // they share the same template under the hood.
    if (userIsAdmin && notifyCustomer && !isInternalNote) {
      // Admin → customer
      const { html, text } = await renderEmail("wl-booking-comment-customer", {
        direction: "to_customer",
        referenceId: booking.reference_id,
        section,
        comment: comment.trim(),
        bookingUrl,
      });
      await resend.emails.send({
        from: "White Lotus <team@mama.is>",
        to: booking.contact_email,
        replyTo: "team@whitelotus.is",
        subject: `Booking update — ${booking.reference_id} · ${sectionLabel}`,
        html,
        text,
      });
    } else if (!userIsAdmin) {
      // Customer → admin
      const { html, text } = await renderEmail("wl-booking-comment-admin", {
        direction: "to_admin",
        referenceId: booking.reference_id,
        section,
        comment: comment.trim(),
        fromEmail: userEmail,
        bookingUrl,
      });
      await resend.emails.send({
        from: `WL - ${contactName} <team@mama.is>`,
        to: "team@whitelotus.is",
        replyTo: userEmail,
        subject: `WL - ${contactName} - New comment on ${booking.reference_id} · ${sectionLabel}`,
        html,
        text,
      });
    }

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    console.error("Error in comment creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
