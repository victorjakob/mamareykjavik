import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

function deriveServicesFromOps({ adminOps, existingServices }) {
  const hasFood = !!(
    adminOps?.foodSelection ||
    adminOps?.allergiesSummary ||
    adminOps?.chefName ||
    adminOps?.chefPhone
  );
  const hasDrinks = !!(
    adminOps?.drinksPrepaidSummary ||
    adminOps?.drinksToHaveAvailable ||
    adminOps?.preDrinksPlan
  );

  // Preserve existing if it already has meaningful values
  const existing = Array.isArray(existingServices) ? existingServices : [];
  if (existing.length > 0 && existing.some((s) => s !== "neither")) {
    return existing;
  }

  const services = [];
  if (hasFood) services.push("food");
  if (hasDrinks) services.push("drinks");
  if (services.length === 0) services.push("neither");
  return services;
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { bookingref } = await params;
    const body = await request.json();
    const supabase = createServerSupabase();

    const { data: booking, error: fetchError } = await supabase
      .from("whitelotus_bookings")
      .select("*")
      .eq("reference_id", bookingref)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const contactName = body?.contact?.name?.trim() || booking.contact_name || "";
    const contactPhone =
      body?.contact?.phone?.trim() || booking.contact_phone || "";
    const contactEmail =
      body?.contact?.email?.trim() || booking.contact_email || "";

    const guestCount = body?.guestCount?.trim?.() || body?.guestCount || null;
    const preferred = body?.dateTime?.preferred || booking.preferred_datetime || null;
    const startTime = body?.dateTime?.startTime || booking.start_time || null;
    const endTime = body?.dateTime?.endTime || booking.end_time || null;

    const adminOps = body?.adminOps || {};
    const services = deriveServicesFromOps({
      adminOps,
      existingServices: booking.services,
    });

    const existingData = booking.booking_data || {};
    const mergedBookingData = {
      ...existingData,
      ...body,
      services,
      contact: {
        ...(existingData.contact || {}),
        ...(body?.contact || {}),
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
      },
      dateTime: {
        ...(existingData.dateTime || {}),
        ...(body?.dateTime || {}),
        preferred,
        startTime,
        endTime,
      },
      guestCount: guestCount ?? existingData.guestCount ?? booking.guest_count ?? null,
      roomSetup: body?.roomSetup ?? existingData.roomSetup ?? booking.room_setup ?? null,
      adminOps: {
        ...(existingData.adminOps || {}),
        ...adminOps,
      },
      metadata: {
        ...(existingData.metadata || {}),
        updatedBy: session.user.email || null,
        lastUpdated: new Date().toISOString(),
      },
    };

    const { data: updated, error: updateError } = await supabase
      .from("whitelotus_bookings")
      .update({
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        preferred_datetime: preferred,
        start_time: startTime,
        end_time: endTime,
        guest_count: guestCount ?? booking.guest_count ?? null,
        services,
        room_setup: body?.roomSetup || booking.room_setup || null,
        booking_data: mergedBookingData,
      })
      .eq("id", booking.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Admin WL booking update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

