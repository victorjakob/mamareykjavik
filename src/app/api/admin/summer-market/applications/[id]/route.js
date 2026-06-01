import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import {
  buildAcceptanceEmailPlainBody,
  buildAcceptanceEmailPricingBlocks,
  normalizeSummerMarketDates,
  summarizeAcceptanceEmailDates,
} from "@/lib/summerMarketPricing";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();
const TERMS_URL =
  "https://docs.google.com/document/d/1sFTWvTh6H2EtNstGS8F7g_ne5gFDMzrykjjNLzdLkUM/edit?usp=sharing";

async function sendAcceptanceEmail({
  toEmail,
  name,
  selectedDates,
  tableclothRental,
  customSubject,
  customText,
}) {
  const normalizedDates = normalizeSummerMarketDates(selectedDates);
  const introText =
    typeof customText === "string" ? customText.trim() : "";
  const { htmlFragment: pricingHtml } =
    buildAcceptanceEmailPricingBlocks(normalizedDates, Boolean(tableclothRental));
  const summarisedDates = summarizeAcceptanceEmailDates(normalizedDates);

  const defaultPlainText = buildAcceptanceEmailPlainBody({
    name,
    selectedDates: normalizedDates,
    tableclothRental: Boolean(tableclothRental),
    termsUrl: TERMS_URL,
  });
  const emailText = introText || defaultPlainText;

  const { html: emailHtml } = await renderEmail("summer-market-acceptance", {
    name,
    selectedDates: summarisedDates,
    pricingHtml,
  });

  await resend.emails.send({
    from: "White Lotus Summer Market <team@mama.is>",
    to: [toEmail],
    replyTo: "team@mama.is",
    subject:
      customSubject || "Your White Lotus Summer Market application is accepted",
    text: emailText,
    html: emailHtml,
  });

  return {
    normalizedDates,
    sentAt: new Date().toISOString(),
  };
}

function isAdminOrHost(session) {
  return (
    session &&
    session.user &&
    (session.user.role === "admin" || session.user.role === "host")
  );
}

function basePayload(rawPayload) {
  if (rawPayload && typeof rawPayload === "object" && !Array.isArray(rawPayload)) {
    return rawPayload;
  }
  return {};
}

function resolveApplicationStatus(dbStatus, adminStatus) {
  if (adminStatus === "cancelled") {
    return "cancelled";
  }
  if (
    dbStatus === "accepted" ||
    dbStatus === "rejected" ||
    dbStatus === "cancelled"
  ) {
    return dbStatus;
  }
  if (
    adminStatus === "accepted" ||
    adminStatus === "rejected" ||
    adminStatus === "cancelled"
  ) {
    return adminStatus;
  }
  return "pending";
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

// Acceptance + rejection HTML now built via React Email templates. The
// pricing block (computed from selected dates + tablecloth rental) is still
// owned by @/lib/summerMarketPricing — we pass the HTML fragment into the
// template via dangerouslySetInnerHTML so the pricing logic stays in one place.

const BUCKET_NAME = "summer-market-applications";

function storagePathFromUrl(publicUrl) {
  // publicUrl: https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
  try {
    const marker = `/object/public/${BUCKET_NAME}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(publicUrl.slice(idx + marker.length));
  } catch {
    return null;
  }
}

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminOrHost(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const contextParams = context?.params ? await context.params : {};
    const idFromParams = contextParams?.id;
    const idFromPath = request.url.split("/").filter(Boolean).pop();
    const id = idFromParams || idFromPath;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    const { data: app, error: fetchError } = await supabase
      .from("summer_market_vendor_applications")
      .select("id,photo_urls")
      .eq("id", id)
      .single();

    if (fetchError || !app) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // Delete storage files
    const photoUrls = Array.isArray(app.photo_urls) ? app.photo_urls : [];
    const paths = photoUrls.map(storagePathFromUrl).filter(Boolean);
    if (paths.length) {
      await supabase.storage.from(BUCKET_NAME).remove(paths);
    }

    const { error: deleteError } = await supabase
      .from("summer_market_vendor_applications")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete application." }, { status: 500 });
    }

    return NextResponse.json({ success: true, id, deletedPhotos: paths.length });
  } catch (err) {
    console.error("Error deleting summer market application:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!isAdminOrHost(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const contextParams = context?.params ? await context.params : {};
    const idFromParams = contextParams?.id;
    const idFromPath = request.url.split("/").filter(Boolean).pop();
    const id = idFromParams || idFromPath;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body?.action;

    const supabase = createServerSupabase();
    const { data: current, error: fetchError } = await supabase
      .from("summer_market_vendor_applications")
      .select(
        "id,email,contact_person,selected_dates,brand_name,raw_payload,status,payment_status,accepted_at,acceptance_email_sent_at,accepted_by,is_confirmed,confirmed_at,tablecloth_rental"
      )
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const currentPayload = basePayload(current.raw_payload);
    const currentAdmin = {
      ...(currentPayload.admin_meta || {}),
      applicationStatus: resolveApplicationStatus(
        current.status,
        currentPayload?.admin_meta?.applicationStatus
      ),
      paymentStatus:
        current.payment_status === "confirmation_paid" ||
        current.payment_status === "fully_paid"
          ? current.payment_status
          : currentPayload?.admin_meta?.paymentStatus || "unpaid",
      acceptedAt: current.accepted_at || currentPayload?.admin_meta?.acceptedAt || null,
      acceptanceEmailSentAt:
        current.acceptance_email_sent_at ||
        currentPayload?.admin_meta?.acceptanceEmailSentAt ||
        null,
      acceptedBy: current.accepted_by || currentPayload?.admin_meta?.acceptedBy || null,
      isConfirmed:
        typeof current.is_confirmed === "boolean"
          ? current.is_confirmed
          : Boolean(currentPayload?.admin_meta?.isConfirmed),
      confirmedAt:
        current.confirmed_at || currentPayload?.admin_meta?.confirmedAt || null,
      cancelledAt: currentPayload?.admin_meta?.cancelledAt || null,
    };

    let nextAdmin = { ...currentAdmin };
    let selectedDatesForAccept = null;

    if (action === "accept") {
      const acceptedAt = new Date().toISOString();
      nextAdmin = {
        ...nextAdmin,
        applicationStatus: "accepted",
        acceptedAt,
        acceptedBy: session.user?.email || "admin",
      };

      selectedDatesForAccept = normalizeSummerMarketDates(
        Array.isArray(body?.selected_dates)
          ? body.selected_dates.filter(
              (d) => typeof d === "string" && d.trim().length > 0
            )
          : current.selected_dates || []
      );

      const requestedToEmail = body?.toEmail;
      const normalizedToEmail =
        requestedToEmail === undefined ? null : normalizeEmail(requestedToEmail);
      if (requestedToEmail !== undefined && !normalizedToEmail) {
        return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
      }
      const deliveryEmail = normalizedToEmail || current.email;
      const shouldUpdateEmail = Boolean(body?.updateEmail);

      const sent = await sendAcceptanceEmail({
        toEmail: deliveryEmail,
        name: current.contact_person,
        selectedDates: selectedDatesForAccept,
        tableclothRental: Boolean(current.tablecloth_rental),
        customSubject: body?.customEmailSubject,
        customText: body?.customEmailText,
      });

      selectedDatesForAccept = sent.normalizedDates;
      nextAdmin.acceptanceEmailSentAt = sent.sentAt;
      nextAdmin.acceptanceEmailTo = deliveryEmail;
      if (shouldUpdateEmail) {
        nextAdmin.previousEmail =
          current.email && current.email !== deliveryEmail ? current.email : nextAdmin.previousEmail;
      }
    } else if (action === "resendAcceptance") {
      if (currentAdmin.applicationStatus !== "accepted") {
        return NextResponse.json(
          { error: "Only accepted applications can receive acceptance emails." },
          { status: 400 }
        );
      }

      const selectedDatesForResend = normalizeSummerMarketDates(
        Array.isArray(body?.selected_dates)
          ? body.selected_dates.filter(
              (d) => typeof d === "string" && d.trim().length > 0
            )
          : current.selected_dates || []
      );

      const requestedToEmail = body?.toEmail;
      const normalizedToEmail =
        requestedToEmail === undefined ? null : normalizeEmail(requestedToEmail);
      if (requestedToEmail !== undefined && !normalizedToEmail) {
        return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
      }
      const deliveryEmail = normalizedToEmail || current.email;
      const shouldUpdateEmail = Boolean(body?.updateEmail);

      const sent = await sendAcceptanceEmail({
        toEmail: deliveryEmail,
        name: current.contact_person,
        selectedDates: selectedDatesForResend,
        tableclothRental: Boolean(current.tablecloth_rental),
        customSubject: body?.customEmailSubject,
        customText: body?.customEmailText,
      });
      nextAdmin.acceptanceEmailSentAt = sent.sentAt;
      nextAdmin.acceptanceEmailTo = deliveryEmail;
      if (shouldUpdateEmail) {
        nextAdmin.previousEmail =
          current.email && current.email !== deliveryEmail ? current.email : nextAdmin.previousEmail;
      }
    } else if (action === "setPaymentStatus") {
      const paymentStatus = body?.paymentStatus;
      if (
        paymentStatus !== "unpaid" &&
        paymentStatus !== "confirmation_paid" &&
        paymentStatus !== "fully_paid"
      ) {
        return NextResponse.json(
          { error: "Invalid payment status." },
          { status: 400 }
        );
      }
      nextAdmin = {
        ...nextAdmin,
        paymentStatus,
      };
    } else if (action === "setPaymentTracking") {
      const next = { ...nextAdmin };
      if (body?.paymentStatus !== undefined) {
        const paymentStatus = body.paymentStatus;
        if (
          paymentStatus === "unpaid" ||
          paymentStatus === "confirmation_paid" ||
          paymentStatus === "fully_paid"
        ) {
          next.paymentStatus = paymentStatus;
        }
      }
      if (Array.isArray(body?.paymentEntries)) {
        const valid = body.paymentEntries.filter(
          (e) => typeof e?.amountKr === "number" && Number.isFinite(e.amountKr)
        );
        next.paymentEntries = valid.map((e) => ({
          amountKr: Math.max(0, Math.round(e.amountKr)),
          paidAt: e.paidAt && typeof e.paidAt === "string" ? e.paidAt : null,
        }));
        next.amountPaidKr = next.paymentEntries.reduce(
          (s, e) => s + (e.amountKr || 0),
          0
        );
      } else if (body?.amountPaidKr !== undefined) {
        const raw = body.amountPaidKr;
        if (raw === null || raw === "") {
          next.amountPaidKr = null;
        } else {
          const n =
            typeof raw === "number"
              ? raw
              : parseInt(String(raw).replace(/\s/g, ""), 10);
          if (Number.isFinite(n)) {
            next.amountPaidKr = Math.max(0, Math.round(n));
          }
        }
      }
      if (body?.paymentNotes !== undefined) {
        const notes = String(body.paymentNotes || "").trim();
        next.paymentNotes = notes || null;
      }
      nextAdmin = next;
    } else if (action === "setApplicationStatus") {
      const applicationStatus = body?.applicationStatus;
      if (
        applicationStatus !== "pending" &&
        applicationStatus !== "accepted" &&
        applicationStatus !== "rejected" &&
        applicationStatus !== "cancelled"
      ) {
        return NextResponse.json(
          { error: "Invalid application status." },
          { status: 400 }
        );
      }
      nextAdmin = {
        ...nextAdmin,
        applicationStatus,
      };
      if (applicationStatus === "accepted" && !nextAdmin.acceptedAt) {
        nextAdmin.acceptedAt = new Date().toISOString();
      }
      if (applicationStatus === "cancelled" && !nextAdmin.cancelledAt) {
        nextAdmin.cancelledAt = new Date().toISOString();
      }
      if (applicationStatus !== "cancelled") {
        nextAdmin.cancelledAt = null;
      }
    } else if (action === "reject") {
      const rejectionMessage = String(body?.rejectionMessage || "").trim();
      nextAdmin = {
        ...nextAdmin,
        applicationStatus: "rejected",
        rejectionMessage,
      };

      const { html: rejectionHtml, text: rejectionText } = await renderEmail(
        "summer-market-rejection",
        {
          name: current.contact_person,
          rejectionNote: rejectionMessage || null,
        }
      );

      await resend.emails.send({
        from: "White Lotus Summer Market <team@mama.is>",
        to: [current.email],
        replyTo: "team@mama.is",
        subject: "Update on your White Lotus Summer Market application",
        html: rejectionHtml,
        text: rejectionText,
      });
    } else if (action === "setDetails") {
      const updates = {};
      if (typeof body.tablecloth_rental === "boolean") {
        updates.tablecloth_rental = body.tablecloth_rental;
      }
      if (typeof body.needs_power === "boolean") {
        updates.needs_power = body.needs_power;
      }
      if (body.instagram_or_website !== undefined) {
        const v = body.instagram_or_website;
        updates.instagram_or_website =
          v == null || v === ""
            ? null
            : String(v).trim() || null;
      }
      if (body.email !== undefined) {
        const email = normalizeEmail(body.email);
        if (!email) {
          return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
        }
        updates.email = email;
        nextAdmin.previousEmail =
          current.email && current.email !== email ? current.email : nextAdmin.previousEmail;
      }
      if (Array.isArray(body.selected_dates)) {
        updates.selected_dates = normalizeSummerMarketDates(
          body.selected_dates.filter(
            (d) => typeof d === "string" && d.trim().length > 0
          )
        );
      }
      if (!Object.keys(updates).length) {
        return NextResponse.json({ error: "No fields to update." }, { status: 400 });
      }
      const { error: detailError } = await supabase
        .from("summer_market_vendor_applications")
        .update(updates)
        .eq("id", id);
      if (detailError) {
        return NextResponse.json({ error: "Failed to update details." }, { status: 500 });
      }
      return NextResponse.json({ success: true, id, updates });
    } else if (action === "setConfirmed") {
      const isConfirmed = Boolean(body?.isConfirmed);
      if (isConfirmed && nextAdmin.applicationStatus !== "accepted") {
        return NextResponse.json(
          { error: "Only accepted applications can be confirmed." },
          { status: 400 }
        );
      }
      nextAdmin = {
        ...nextAdmin,
        isConfirmed,
        confirmedAt: isConfirmed ? new Date().toISOString() : null,
      };
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const nextPayload = {
      ...currentPayload,
      admin_meta: nextAdmin,
    };

    const dbApplicationStatus =
      nextAdmin.applicationStatus === "cancelled"
        ? current.status === "accepted"
          ? "accepted"
          : "pending"
        : nextAdmin.applicationStatus || "pending";

    const updatePayload = {
      status: dbApplicationStatus,
      payment_status: nextAdmin.paymentStatus || "unpaid",
      accepted_at: nextAdmin.acceptedAt || null,
      acceptance_email_sent_at: nextAdmin.acceptanceEmailSentAt || null,
      accepted_by: nextAdmin.acceptedBy || null,
      is_confirmed: Boolean(nextAdmin.isConfirmed),
      confirmed_at: nextAdmin.confirmedAt || null,
      raw_payload: nextPayload,
    };
    if (selectedDatesForAccept) {
      updatePayload.selected_dates = selectedDatesForAccept;
    }
    if (
      (action === "accept" || action === "resendAcceptance") &&
      Boolean(body?.updateEmail)
    ) {
      const email = normalizeEmail(body?.toEmail);
      if (!email) {
        return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
      }
      updatePayload.email = email;
    }
    const { error: updateError } = await supabase
      .from("summer_market_vendor_applications")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      console.error("Failed updating summer market application:", updateError);
      return NextResponse.json(
        { error: "Failed to update application." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
      admin_meta: nextAdmin,
      email: updatePayload.email || current.email,
    });
  } catch (error) {
    console.error("Error in summer market application PATCH:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
