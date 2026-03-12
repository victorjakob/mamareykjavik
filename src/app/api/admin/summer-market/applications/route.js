import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";

function isAdminOrHost(session) {
  return (
    session &&
    session.user &&
    (session.user.role === "admin" || session.user.role === "host")
  );
}

function readAdminMeta(row) {
  const {
    raw_payload: rawPayload,
    status,
    payment_status,
    accepted_at,
    acceptance_email_sent_at,
    accepted_by,
    is_confirmed,
    confirmed_at,
  } = row || {};

  const payload =
    rawPayload && typeof rawPayload === "object" && !Array.isArray(rawPayload)
      ? rawPayload
      : {};
  const adminMeta =
    payload.admin_meta &&
    typeof payload.admin_meta === "object" &&
    !Array.isArray(payload.admin_meta)
      ? payload.admin_meta
      : {};

  return {
    applicationStatus:
      status === "accepted" || status === "rejected"
        ? status
        : adminMeta.applicationStatus === "accepted" ||
            adminMeta.applicationStatus === "rejected"
          ? adminMeta.applicationStatus
          : "pending",
    paymentStatus:
      payment_status === "confirmation_paid" || payment_status === "fully_paid"
        ? payment_status
        : adminMeta.paymentStatus === "confirmation_paid" ||
            adminMeta.paymentStatus === "fully_paid"
          ? adminMeta.paymentStatus
          : "unpaid",
    acceptedAt: accepted_at || adminMeta.acceptedAt || null,
    acceptanceEmailSentAt:
      acceptance_email_sent_at || adminMeta.acceptanceEmailSentAt || null,
    acceptedBy: accepted_by || adminMeta.acceptedBy || null,
    isConfirmed:
      typeof is_confirmed === "boolean"
        ? is_confirmed
        : Boolean(adminMeta.isConfirmed),
    confirmedAt: confirmed_at || adminMeta.confirmedAt || null,
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminOrHost(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("summer_market_vendor_applications")
      .select(
        [
          "id",
          "created_at",
          "brand_name",
          "contact_person",
          "email",
          "phone_whatsapp",
          "what_do_you_sell",
          "product_categories",
          "instagram_or_website",
          "interested_month",
          "selected_dates",
          "needs_power",
          "tablecloth_rental",
          "setup_notes",
          "photo_urls",
          "community_share",
          "anything_else",
          "application_acknowledged",
          "status",
          "payment_status",
          "accepted_at",
          "acceptance_email_sent_at",
          "accepted_by",
          "is_confirmed",
          "confirmed_at",
          "raw_payload",
        ].join(",")
      )
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Error fetching summer market applications:", error);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    const applications = (data || []).map((row) => {
      const adminMeta = readAdminMeta(row);
      return {
        ...row,
        admin_meta: adminMeta,
      };
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error in summer market applications GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
