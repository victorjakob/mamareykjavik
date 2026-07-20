import { NextResponse } from "next/server";
import { createResend } from "@/lib/resend";
import { createServerSupabase } from "@/util/supabase/server";
import { renderEmail } from "@/emails/render.server";
import {
  isSummerMarketDateInPast,
  isSummerMarketSunday,
  normalizeSummerMarketDates,
} from "@/lib/summerMarketPricing";

const resend = createResend();
const BUCKET_NAME = "summer-market-applications";
const SUMMER_MARKET_ADMIN_URL =
  process.env.SUMMER_MARKET_ADMIN_URL || "https://mama.is/admin/summer-market";

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "yes", "on"].includes(value.toLowerCase());
  }
  return false;
}

function getRequiredText(formData, key) {
  const value = String(formData.get(key) || "").trim();
  return value;
}

async function buildEmailHtml(payload) {
  // Build via the React Email template — returns { html, text }
  const { html, text } = await renderEmail("summer-market-application-submission", {
    brandName: payload.brandName,
    contactPerson: payload.contactPerson,
    email: payload.email,
    phoneWhatsapp: payload.phoneWhatsapp,
    whatDoYouSell: payload.whatDoYouSell,
    productCategory: payload.productCategory,
    instagramOrWebsite: payload.instagramOrWebsite,
    month: payload.month,
    preferredDates: payload.preferredDates,
    needsPower: payload.needsPower,
    tableclothRental: payload.tableclothRental,
    setupNotes: payload.setupNotes,
    anythingElse: payload.anythingElse,
    instagramShare: payload.instagramShare,
    photoUrls: payload.photoUrls || [],
    adminUrl: SUMMER_MARKET_ADMIN_URL,
  });
  return { html, text };
}

export async function POST(request) {
  try {
    const supabase = createServerSupabase();
    const contentType = request.headers.get("content-type") || "";
    let brandName, contactPerson, email, phoneWhatsapp, whatDoYouSell, month, needsPower, tableclothRental;
    let productCategory, preferredDates, instagramOrWebsite, setupNotes, anythingElse, instagramShare, applicationConfirmation;
    let photoUrls = [];

    if (contentType.includes("application/json")) {
      const body = await request.json();
      brandName = String(body.brandName || "").trim();
      contactPerson = String(body.contactPerson || "").trim();
      email = String(body.email || "").trim();
      phoneWhatsapp = String(body.phoneWhatsapp || "").trim();
      whatDoYouSell = String(body.whatDoYouSell || "").trim();
      month = String(body.month || "").trim();
      needsPower = String(body.needsPower || "").trim();
      tableclothRental = String(body.tableclothRental || "").trim();
      productCategory = Array.isArray(body.productCategory) ? body.productCategory : parseJsonArray(body.productCategory);
      preferredDates = Array.isArray(body.preferredDates) ? body.preferredDates : parseJsonArray(body.preferredDates);
      instagramOrWebsite = String(body.instagramOrWebsite || "").trim();
      setupNotes = String(body.setupNotes || "").trim();
      anythingElse = String(body.anythingElse || "").trim();
      instagramShare = normalizeBoolean(body.instagramShare);
      applicationConfirmation = normalizeBoolean(body.applicationConfirmation);
      photoUrls = Array.isArray(body.photoUrls) ? body.photoUrls.filter((u) => typeof u === "string" && u.startsWith("http")) : [];
    } else {
      const formData = await request.formData();
      brandName = getRequiredText(formData, "brandName");
      contactPerson = getRequiredText(formData, "contactPerson");
      email = getRequiredText(formData, "email");
      phoneWhatsapp = getRequiredText(formData, "phoneWhatsapp");
      whatDoYouSell = getRequiredText(formData, "whatDoYouSell");
      month = getRequiredText(formData, "month");
      needsPower = getRequiredText(formData, "needsPower");
      tableclothRental = getRequiredText(formData, "tableclothRental");
      productCategory = parseJsonArray(formData.get("productCategory"));
      preferredDates = parseJsonArray(formData.get("preferredDates"));
      instagramOrWebsite = String(formData.get("instagramOrWebsite") || "").trim();
      setupNotes = String(formData.get("setupNotes") || "").trim();
      anythingElse = String(formData.get("anythingElse") || "").trim();
      instagramShare = normalizeBoolean(formData.get("instagramShare"));
      applicationConfirmation = normalizeBoolean(formData.get("applicationConfirmation"));
      const photos = formData.getAll("photos").filter((f) => f instanceof File && f.size > 0);
      for (let i = 0; i < photos.length; i += 1) {
        try {
          const file = photos[i];
          const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
          const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${i + 1}.${ext}`;
          const buffer = Buffer.from(await file.arrayBuffer());
          const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, buffer, { contentType: file.type || "image/jpeg", upsert: false });
          if (!uploadError) {
            const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
            photoUrls.push(data.publicUrl);
          }
        } catch (err) {
          console.warn("Summer market photo upload error:", err);
        }
      }
    }

    if (
      !brandName ||
      !contactPerson ||
      !email ||
      !phoneWhatsapp ||
      !whatDoYouSell ||
      !month ||
      !needsPower ||
      !tableclothRental
    ) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    if (!applicationConfirmation) {
      return NextResponse.json(
        { error: "Application confirmation is required." },
        { status: 400 }
      );
    }

    if (productCategory.length === 0 || preferredDates.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one category and one date." },
        { status: 400 }
      );
    }

    const normalizedPreferredDates = normalizeSummerMarketDates(preferredDates);
    const pastDates = normalizedPreferredDates.filter((date) =>
      isSummerMarketDateInPast(date)
    );
    if (pastDates.length > 0) {
      return NextResponse.json(
        { error: "One or more selected dates are in the past. Please choose upcoming dates." },
        { status: 400 }
      );
    }

    // Sundays are no longer bookable — the market runs Fridays & Saturdays only
    // (guards against stale forms / direct API calls).
    const sundayDates = normalizedPreferredDates.filter((date) =>
      isSummerMarketSunday(date)
    );
    if (sundayDates.length > 0) {
      return NextResponse.json(
        {
          error:
            "The Summer Market now runs on Fridays & Saturdays only — Sundays can no longer be booked. Please pick Friday or Saturday dates.",
        },
        { status: 400 }
      );
    }

    const payload = {
      brandName,
      contactPerson,
      email,
      phoneWhatsapp,
      whatDoYouSell,
      productCategory,
      instagramOrWebsite,
      month,
      preferredDates: normalizedPreferredDates,
      needsPower,
      tableclothRental,
      setupNotes,
      photoUrls,
      instagramShare,
      anythingElse,
      applicationConfirmation,
    };

    const { error: insertError } = await supabase
      .from("summer_market_vendor_applications")
      .insert({
        brand_name: brandName,
        contact_person: contactPerson,
        email,
        phone_whatsapp: phoneWhatsapp,
        what_do_you_sell: whatDoYouSell,
        product_categories: productCategory,
        instagram_or_website: instagramOrWebsite || null,
        interested_month: month,
        selected_dates: normalizedPreferredDates,
        needs_power: needsPower === "Yes",
        tablecloth_rental: tableclothRental === "Yes",
        setup_notes: setupNotes || null,
        photo_urls: photoUrls,
        community_share: instagramShare,
        anything_else: anythingElse || null,
        application_acknowledged: applicationConfirmation,
        raw_payload: payload,
      });

    if (insertError) {
      console.error("Summer market insert error:", insertError);
      try {
        await resend.emails.send({
          from: "White Lotus Summer Market <team@mama.is>",
          to: ["team@mama.is"],
          replyTo: email,
          subject: `[DB ERROR] Summer Market application - ${brandName}`,
          html: `<p>Application could not be saved to database. Error: ${insertError.message}</p><p><a href="${SUMMER_MARKET_ADMIN_URL}" style="display:inline-block;background:#9a724d;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none;font-weight:600;">Open Summer Market manager</a></p><pre>${JSON.stringify(payload, null, 2)}</pre>`,
        });
      } catch (emailErr) {
        console.error("Fallback email also failed:", emailErr);
      }
      return NextResponse.json(
        { error: "Failed to save application. Please try again or contact team@mama.is." },
        { status: 500 }
      );
    }

    try {
      const { html, text } = await buildEmailHtml(payload);
      await resend.emails.send({
        from: "White Lotus Summer Market <team@mama.is>",
        to: ["team@mama.is"],
        replyTo: email,
        subject: `Summer Market application - ${brandName}`,
        html,
        text,
      });
    } catch (emailErr) {
      console.error("Summer market notification email failed:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Summer market apply error:", error);
    const dnsErrorCode = error?.cause?.code || error?.code;
    if (dnsErrorCode === "ENOTFOUND") {
      return NextResponse.json(
        {
          error:
            "Cannot reach Supabase (DNS lookup failed). Please check internet/DNS and try again.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit application." },
      { status: 500 }
    );
  }
}
