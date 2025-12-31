import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const sectionLabels = {
      guest_count: "Fjöldi gesta",
      services: "Valin þjónusta",
      food: "Matur",
      drinks: "Drykkir",
      room_setup: "Uppsetning",
      tech_and_music: "Tækni",
      tablecloth: "Borð & Skreyting",
      notes: "Athugasemdir",
      event_info: "Viðburður",
      contact: "Tengiliður",
    };

    const contactName =
      booking.contact_name || booking.contact_email || "Óþekkt";

    // Send email notifications (only for non-internal comments)
    if (userIsAdmin && notifyCustomer && !isInternalNote) {
      // Admin created comment and wants to notify customer
      await resend.emails.send({
        from: "White Lotus <team@mama.is>",
        to: booking.contact_email,
        replyTo: "team@whitelotus.is",
        subject: `Uppfærsla á bókun ${booking.reference_id} - ${sectionLabels[section] || section}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
            <h2 style="color: #a77d3b;">Ný athugasemd á bókun</h2>
            <p><strong>Bókun:</strong> ${booking.reference_id}</p>
            <p><strong>Svið:</strong> ${sectionLabels[section] || section}</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${comment.trim()}</p>
            </div>
            <p>
              <a href="${bookingUrl}" style="background-color: #a77d3b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Skoða bókun
              </a>
            </p>
          </div>
        `,
      });
    } else if (!userIsAdmin) {
      // Customer created comment - notify admin
      await resend.emails.send({
        from: `WL - ${contactName} <team@mama.is>`,
        to: "team@whitelotus.is",
        replyTo: userEmail,
        subject: `WL - ${contactName} - Ný athugasemd á bókun ${booking.reference_id} - ${sectionLabels[section] || section}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
            <h2 style="color: #a77d3b;">Ný athugasemd á bókun</h2>
            <p><strong>Bókun:</strong> ${booking.reference_id}</p>
            <p><strong>Svið:</strong> ${sectionLabels[section] || section}</p>
            <p><strong>Frá:</strong> ${userEmail}</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${comment.trim()}</p>
            </div>
            <p>
              <a href="${bookingUrl}" style="background-color: #a77d3b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Skoða bókun
              </a>
            </p>
          </div>
        `,
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
