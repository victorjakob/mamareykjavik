import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function PATCH(request, { params }) {
  try {
    const { bookingref } = await params;
    const body = await request.json();
    const { field, value, notifyCustomer, approve, reject } = body;

    // Validate field is provided
    if (!field) {
      return NextResponse.json({ error: "Field is required" }, { status: 400 });
    }

    // Validate value is provided (unless it's approve/reject action)
    const isApproveOrReject =
      approve === true ||
      approve === "true" ||
      reject === true ||
      reject === "true";
    if (value === undefined && !isApproveOrReject) {
      return NextResponse.json({ error: "Value is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const supabase = createServerSupabase();

    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from("whitelotus_bookings")
      .select("id, contact_name, contact_email, reference_id, booking_data")
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

    // Update booking_data JSON
    const bookingData = booking.booking_data || {};

    // Helper function to set nested property
    const setNestedProperty = (obj, path, value) => {
      const keys = path.split('.');
      let current = obj;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    };

    // Helper function to get nested property
    const getNestedProperty = (obj, path) => {
      const keys = path.split('.');
      let current = obj;
      for (const key of keys) {
        if (current === null || current === undefined) return undefined;
        current = current[key];
      }
      return current;
    };

    // Handle approval/rejection by admin
    // Check if approve is explicitly true (could be string "true" or boolean true)
    const isApproveAction = approve === true || approve === "true";
    const isRejectAction = reject === true || reject === "true";

    if (userIsAdmin && isApproveAction) {
      // Admin is approving a pending change - use existing value from booking data
      // The value should already be in bookingData from the customer's change
      const valueToUse = getNestedProperty(bookingData, field) || value || "";

      // Only update if we have a value to approve
      if (valueToUse) {
        setNestedProperty(bookingData, field, valueToUse);
      }
      // Handle approval flags - use base field name (before first dot) for flags
      const baseField = field.split('.')[0];
      bookingData[`${baseField}_pending_approval`] = false;
      bookingData[`${baseField}_approved`] = true;
    } else if (userIsAdmin && isRejectAction) {
      // Admin is rejecting a pending change - clear the value
      setNestedProperty(bookingData, field, "");
      const baseField = field.split('.')[0];
      bookingData[`${baseField}_pending_approval`] = false;
      bookingData[`${baseField}_approved`] = false;
    } else {
      // Regular update (not approve/reject action)
      if (value === undefined) {
        return NextResponse.json(
          { error: "Value is required for updates" },
          { status: 400 }
        );
      }

      setNestedProperty(bookingData, field, value);

      // Admin changes are auto-approved, customer changes need approval
      if (userIsAdmin) {
        // Admin changes are auto-approved immediately
        const baseField = field.split('.')[0];
        bookingData[`${baseField}_pending_approval`] = false;
        bookingData[`${baseField}_approved`] = true;
      } else {
        // Customer changes require admin approval
        const baseField = field.split('.')[0];
        bookingData[`${baseField}_pending_approval`] = true;
        bookingData[`${baseField}_approved`] = false;
      }
    }

    // Update database
    const { data: updatedBooking, error: updateError } = await supabase
      .from("whitelotus_bookings")
      .update({
        booking_data: bookingData,
      })
      .eq("id", booking.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking", details: updateError.message },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";
    const bookingUrl = `${baseUrl}/whitelotus/booking/${bookingref}`;
    const contactName =
      booking.contact_name || booking.contact_email || "Óþekkt";

    // Send email notifications
    if (userIsAdmin && approve && bookingData[field]) {
      // Admin approved a change - notify customer
      const fieldLabels = {
        foodNumberOfCourses: "Fjöldi rétta",
        foodAllergies: "Ofnæmi",
        foodMenu: "Matseðill",
      };

      await resend.emails.send({
        from: "White Lotus <team@mama.is>",
        to: booking.contact_email,
        replyTo: "team@whitelotus.is",
        subject: `Breyting samþykkt á bókun ${booking.reference_id} - ${fieldLabels[field] || field}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
            <h2 style="color: #a77d3b;">Breyting samþykkt</h2>
            <p><strong>Bókun:</strong> ${booking.reference_id}</p>
            <p><strong>Svið:</strong> ${fieldLabels[field] || field}</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${bookingData[field] || ""}</p>
            </div>
            <p>
              <a href="${bookingUrl}" style="background-color: #a77d3b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Skoða bókun
              </a>
            </p>
          </div>
        `,
      });
    } else if (userIsAdmin && reject) {
      // Admin rejected a change - notify customer
      const fieldLabels = {
        foodNumberOfCourses: "Fjöldi rétta",
        foodAllergies: "Ofnæmi",
        foodMenu: "Matseðill",
      };

      await resend.emails.send({
        from: "White Lotus <team@mama.is>",
        to: booking.contact_email,
        replyTo: "team@whitelotus.is",
        subject: `Breyting hafnað á bókun ${booking.reference_id} - ${fieldLabels[field] || field}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
            <h2 style="color: #a77d3b;">Breyting hafnað</h2>
            <p><strong>Bókun:</strong> ${booking.reference_id}</p>
            <p><strong>Svið:</strong> ${fieldLabels[field] || field}</p>
            <p>Breytingin sem þú sendir inn hefur verið hafnað. Vinsamlegast hafðu samband ef þú hefur spurningar.</p>
            <p>
              <a href="${bookingUrl}" style="background-color: #a77d3b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Skoða bókun
              </a>
            </p>
          </div>
        `,
      });
    } else if (userIsAdmin && notifyCustomer && bookingData[field]) {
      // Admin changed something and wants to notify customer
      const fieldLabels = {
        foodNumberOfCourses: "Fjöldi rétta",
        foodAllergies: "Ofnæmi",
        foodMenu: "Matseðill",
      };

      await resend.emails.send({
        from: "White Lotus <team@mama.is>",
        to: booking.contact_email,
        replyTo: "team@whitelotus.is",
        subject: `Uppfærsla á bókun ${booking.reference_id} - ${fieldLabels[field] || field}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
            <h2 style="color: #a77d3b;">Uppfærsla á bókun</h2>
            <p><strong>Bókun:</strong> ${booking.reference_id}</p>
            <p><strong>Svið:</strong> ${fieldLabels[field] || field}</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${bookingData[field] || ""}</p>
            </div>
            <p>
              <a href="${bookingUrl}" style="background-color: #a77d3b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Skoða bókun
              </a>
            </p>
          </div>
        `,
      });
    } else if (!userIsAdmin && bookingData[field]) {
      // Customer made a change - always notify admin
      const fieldLabels = {
        foodNumberOfCourses: "Fjöldi rétta",
        foodAllergies: "Ofnæmi",
        foodMenu: "Matseðill",
      };

      await resend.emails.send({
        from: `WL - ${contactName} <team@mama.is>`,
        to: "team@whitelotus.is",
        replyTo: booking.contact_email,
        subject: `WL - ${contactName} - Ný uppfærsla á bókun ${booking.reference_id} - ${fieldLabels[field] || field} (þarf samþykki)`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
            <h2 style="color: #a77d3b;">Ný uppfærsla á bókun</h2>
            <p><strong>Bókun:</strong> ${booking.reference_id}</p>
            <p><strong>Svið:</strong> ${fieldLabels[field] || field}</p>
            <p><strong>Frá:</strong> ${userEmail}</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; white-space: pre-wrap;">${value}</p>
            </div>
            <p style="color: #d97706; font-weight: bold;">⚠️ Þessi breyting þarf samþykki</p>
            <p>
              <a href="${bookingUrl}" style="background-color: #a77d3b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Skoða og samþykkja bókun
              </a>
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating field:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
