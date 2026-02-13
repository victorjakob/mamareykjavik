import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

function deriveServicesFromOps({ adminOps }) {
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

  const services = [];
  if (hasFood) services.push("food");
  if (hasDrinks) services.push("drinks");
  if (services.length === 0) services.push("neither");
  return services;
}

async function generateReferenceId(email, isoDate, supabase) {
  const safeEmail = typeof email === "string" && email.includes("@") ? email : "internal@mama.is";
  const username = safeEmail.split("@")[0].toLowerCase();
  const dateObj = isoDate ? new Date(isoDate) : new Date();
  const fallbackDate = new Date();
  const finalDateObj = Number.isNaN(dateObj.getTime()) ? fallbackDate : dateObj;
  const day = String(finalDateObj.getDate()).padStart(2, "0");
  const month = String(finalDateObj.getMonth() + 1).padStart(2, "0");
  const baseId = `${username}-${day}-${month}`;

  const { data: existing } = await supabase
    .from("whitelotus_bookings")
    .select("reference_id")
    .eq("reference_id", baseId)
    .single();

  if (existing) {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toLowerCase();
    return `${baseId}-${randomSuffix}`;
  }

  return baseId;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const contactName = body?.contact?.name?.trim() || "";
    const contactPhone = body?.contact?.phone?.trim() || "";
    const contactEmail = body?.contact?.email?.trim() || "";
    const guestCount = body?.guestCount?.trim?.() || "";
    const preferred = body?.dateTime?.preferred || null;
    const startTime = body?.dateTime?.startTime || null;
    const endTime = body?.dateTime?.endTime || null;

    const supabase = createServerSupabase();
    const reference_id = await generateReferenceId(
      contactEmail || "internal@mama.is",
      preferred,
      supabase
    );

    const adminOps = body?.adminOps || {};
    const services = deriveServicesFromOps({ adminOps });

    const booking_data = {
      ...(body || {}),
      services,
      guestCount: guestCount || body?.guestCount || null,
      contact: {
        ...(body?.contact || {}),
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
      },
      dateTime: {
        ...(body?.dateTime || {}),
        preferred,
        startTime,
        endTime,
      },
      adminOps,
      metadata: {
        ...(body?.metadata || {}),
        createdBy: session.user.email || null,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    };

    const { data, error } = await supabase
      .from("whitelotus_bookings")
      .insert({
        reference_id,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        preferred_datetime: preferred,
        start_time: startTime,
        end_time: endTime,
        guest_count: guestCount || null,
        services,
        room_setup: body?.roomSetup || null,
        status: "pending",
        booking_data,
        language: body?.language || "is",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ reference_id, booking: data });
  } catch (error) {
    console.error("Admin WL booking create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

