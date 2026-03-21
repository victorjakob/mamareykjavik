import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import {
  buildAcceptanceEmailPlainBody,
  buildAcceptanceEmailPricingBlocks,
  escapeHtmlForEmail,
  summarizeAcceptanceEmailDates,
} from "@/lib/summerMarketPricing";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const TERMS_URL =
  "https://docs.google.com/document/d/1sFTWvTh6H2EtNstGS8F7g_ne5gFDMzrykjjNLzdLkUM/edit?usp=sharing";

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

function buildAcceptanceEmailHtml({
  name,
  selectedDates,
  tableclothRental,
  customIntroPlain,
}) {
  const dates = summarizeAcceptanceEmailDates(selectedDates);
  const { htmlFragment: pricingHtml } = buildAcceptanceEmailPricingBlocks(
    selectedDates,
    Boolean(tableclothRental)
  );

  const customBlock = customIntroPlain
    ? `<div style="margin:0 0 18px;padding:14px 16px;background:#fff;border:1px solid #eadfd2;border-radius:12px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9a724d;">Message from us</p>
        <div style="margin:0;font-size:14px;line-height:1.65;color:#20150f;white-space:pre-wrap;">${escapeHtmlForEmail(customIntroPlain)}</div>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f7f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#20150f;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eadfd2;">
          <tr>
            <td style="padding:24px 28px;background:linear-gradient(135deg,#9a724d,#7a5538);color:#fff;">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.75;">White Lotus Summer Market</p>
              <h1 style="margin:0;font-size:26px;font-weight:500;">Application Accepted</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 28px;">
              <p style="margin:0 0 14px;">Hi ${escapeHtmlForEmail(name || "there")},</p>
              ${customBlock}
              <p style="margin:0 0 14px;">Thank you for applying to the White Lotus Summer Market.</p>
              <p style="margin:0 0 14px;">We're happy to confirm that your application has been accepted, and we'd love to have you join us.</p>

              <div style="margin:18px 0;padding:14px 16px;background:#fbf7f1;border:1px solid #eadfd2;border-radius:12px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9a724d;">Your selected dates</p>
                <ul style="margin:0;padding-left:18px;">
                  ${dates.map((date) => `<li style="margin:0 0 4px;">${escapeHtmlForEmail(date)}</li>`).join("")}
                </ul>
              </div>

              ${pricingHtml}

              <p style="margin:0 0 14px;font-size:14px;color:#4e4038;line-height:1.55;">Once the confirmation fee has been paid, your booth will be officially secured.</p>

              <div style="margin:16px 0;padding:14px 16px;background:#fff8f1;border:1px solid #e9d7c3;border-radius:12px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9a724d;">Bank details</p>
                <p style="margin:0;line-height:1.6;">
                  Account no.: 0322-26-670220<br/>
                  Kennitala: 670220-0440
                </p>
              </div>

              <p style="margin:0 0 12px;">Please reply to this email once the transfer has been made.</p>
              <p style="margin:0 0 12px;">The remaining balance will be paid later, and we can also prepare an official invoice if you would like one.</p>
              <p style="margin:0 0 14px;">Please read the instructions, terms, agreements, and all market information carefully here:<br/>
                <a href="${TERMS_URL}" style="color:#9a724d;">${TERMS_URL}</a>
              </p>
              <p style="margin:0;">Warmly,<br/>White Lotus</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildRejectionEmailText({ name, rejectionNote }) {
  return `Hi ${name || "there"},

Thank you for applying to the White Lotus Summer Market.

After review, we're sorry to share that we can't offer a spot for this round.

${rejectionNote ? `Note from our team:\n${rejectionNote}\n` : ""}

Thank you again for your time and application.
`;
}

function buildRejectionEmailHtml({ name, rejectionNote }) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f7f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#20150f;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eadfd2;">
          <tr>
            <td style="padding:24px 28px;background:linear-gradient(135deg,#a74a3f,#8c3329);color:#fff;">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.75;">White Lotus Summer Market</p>
              <h1 style="margin:0;font-size:26px;font-weight:500;">Application Update</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 28px;">
              <p style="margin:0 0 14px;">Hi ${name || "there"},</p>
              <p style="margin:0 0 14px;">Thank you for applying to the White Lotus Summer Market.</p>
              <p style="margin:0 0 14px;">After review, we're sorry to share that we can't offer a spot for this round.</p>
              ${
                rejectionNote
                  ? `<div style="margin:16px 0;padding:14px 16px;background:#fff3f1;border:1px solid #f0c7c2;border-radius:12px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a74a3f;">Note from our team</p>
                <p style="margin:0;white-space:pre-wrap;line-height:1.6;">${rejectionNote}</p>
              </div>`
                  : ""
              }
              <p style="margin:0;">Thank you again for your time and application.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
      applicationStatus:
        current.status === "accepted" || current.status === "rejected"
          ? current.status
          : currentPayload?.admin_meta?.applicationStatus || "pending",
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
    };

    let nextAdmin = { ...currentAdmin };

    if (action === "accept") {
      const acceptedAt = new Date().toISOString();
      nextAdmin = {
        ...nextAdmin,
        applicationStatus: "accepted",
        acceptedAt,
        acceptedBy: session.user?.email || "admin",
      };

      const customText = typeof body?.customEmailText === "string" ? body.customEmailText.trim() : "";
      const { plainText: pricingPlain } = buildAcceptanceEmailPricingBlocks(
        current.selected_dates || [],
        Boolean(current.tablecloth_rental)
      );
      const emailText = customText
        ? `${customText}\n\n---\n${pricingPlain}`
        : buildAcceptanceEmailPlainBody({
            name: current.contact_person,
            selectedDates: current.selected_dates || [],
            tableclothRental: Boolean(current.tablecloth_rental),
            termsUrl: TERMS_URL,
          });
      const emailHtml = buildAcceptanceEmailHtml({
        name: current.contact_person,
        selectedDates: current.selected_dates || [],
        tableclothRental: Boolean(current.tablecloth_rental),
        customIntroPlain: customText || "",
      });

      await resend.emails.send({
        from: "White Lotus Summer Market <team@mama.is>",
        to: [current.email],
        replyTo: "team@mama.is",
        subject: body?.customEmailSubject || "Your White Lotus Summer Market application is accepted",
        text: emailText,
        html: emailHtml,
      });

      nextAdmin.acceptanceEmailSentAt = new Date().toISOString();
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
      if (body?.amountPaidKr !== undefined) {
        const raw = body.amountPaidKr;
        if (raw === null || raw === "") {
          next.amountPaidKr = null;
        } else {
          const n = typeof raw === "number" ? raw : parseInt(String(raw).replace(/\s/g, ""), 10);
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
        applicationStatus !== "rejected"
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
    } else if (action === "reject") {
      const rejectionMessage = String(body?.rejectionMessage || "").trim();
      nextAdmin = {
        ...nextAdmin,
        applicationStatus: "rejected",
        rejectionMessage,
      };

      await resend.emails.send({
        from: "White Lotus Summer Market <team@mama.is>",
        to: [current.email],
        replyTo: "team@mama.is",
        subject: "Update on your White Lotus Summer Market application",
        text: buildRejectionEmailText({
          name: current.contact_person,
          rejectionNote: rejectionMessage,
        }),
        html: buildRejectionEmailHtml({
          name: current.contact_person,
          rejectionNote: rejectionMessage,
        }),
      });
    } else if (action === "setDetails") {
      const updates = {};
      if (typeof body.tablecloth_rental === "boolean") {
        updates.tablecloth_rental = body.tablecloth_rental;
      }
      if (typeof body.needs_power === "boolean") {
        updates.needs_power = body.needs_power;
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

    const { error: updateError } = await supabase
      .from("summer_market_vendor_applications")
      .update({
        status: nextAdmin.applicationStatus || "pending",
        payment_status: nextAdmin.paymentStatus || "unpaid",
        accepted_at: nextAdmin.acceptedAt || null,
        acceptance_email_sent_at: nextAdmin.acceptanceEmailSentAt || null,
        accepted_by: nextAdmin.acceptedBy || null,
        is_confirmed: Boolean(nextAdmin.isConfirmed),
        confirmed_at: nextAdmin.confirmedAt || null,
        raw_payload: nextPayload,
      })
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
    });
  } catch (error) {
    console.error("Error in summer market application PATCH:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
