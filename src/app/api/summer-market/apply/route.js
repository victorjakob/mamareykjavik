import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerSupabase } from "@/util/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const BUCKET_NAME = "summer-market-applications";
const MAX_PHOTO_COUNT = 3;

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeBoolean(value) {
  return value === "true";
}

function getRequiredText(formData, key) {
  const value = String(formData.get(key) || "").trim();
  return value;
}

function buildEmailHtml(payload) {
  const list = (items) => (items.length ? items.join(" · ") : "—");
  const val = (v) => v || "—";
  const yesNo = (v) => (v ? "Yes" : "No");

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 12px;color:#8f6f4f;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;vertical-align:top;width:160px;">${label}</td>
      <td style="padding:10px 12px;color:#20150f;font-size:14px;vertical-align:top;">${value}</td>
    </tr>`;

  const section = (title, rows) => `
    <div style="margin-bottom:24px;">
      <div style="background:#f3e9de;border-radius:8px 8px 0 0;padding:8px 16px;">
        <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#9a724d;">${title}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fffaf4;border-radius:0 0 8px 8px;overflow:hidden;">
        ${rows}
      </table>
    </div>`;

  const photoGrid = payload.photoUrls.map((url, i) => `
    <td style="padding:6px;width:33%;">
      <a href="${url}" style="display:block;">
        <img src="${url}" alt="Photo ${i + 1}" style="width:100%;height:130px;object-fit:cover;border-radius:8px;display:block;" />
      </a>
    </td>`).join("");

  const submittedAt = new Date().toLocaleString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5ede3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5ede3;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#9a724d,#7a5538);border-radius:16px 16px 0 0;padding:36px 32px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.18em;color:rgba(255,255,255,0.7);">White Lotus · Reykjavík</p>
          <h1 style="margin:0;font-size:26px;font-weight:300;color:#fff;letter-spacing:0.02em;">Summer Market Application</h1>
          <p style="margin:12px 0 0;font-size:13px;color:rgba(255,255,255,0.65);">${submittedAt}</p>
        </td></tr>

        <!-- Brand name banner -->
        <tr><td style="background:#fff8f1;padding:20px 32px;border-left:1px solid #e8d9c8;border-right:1px solid #e8d9c8;text-align:center;">
          <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#9a724d;">Applicant</p>
          <p style="margin:0;font-size:22px;color:#20150f;">${payload.brandName}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#7a685a;">${payload.contactPerson} &nbsp;·&nbsp; <a href="mailto:${payload.email}" style="color:#9a724d;text-decoration:none;">${payload.email}</a> &nbsp;·&nbsp; ${payload.phoneWhatsapp}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#fffaf4;padding:28px 32px;border:1px solid #e8d9c8;border-top:none;border-radius:0 0 16px 16px;">

          ${section("About the products", `
            ${row("What they sell", val(payload.whatDoYouSell))}
            ${row("Categories", list(payload.productCategory))}
            ${row("Instagram / website", payload.instagramOrWebsite
              ? `<a href="${payload.instagramOrWebsite}" style="color:#9a724d;">${payload.instagramOrWebsite}</a>`
              : "—")}
          `)}

          ${section("Dates", `
            ${row("Month", val(payload.month))}
            ${row("Selected dates", payload.preferredDates.join("<br>"))}
          `)}

          ${section("Setup", `
            ${row("Needs power", yesNo(payload.needsPower === "Yes"))}
            ${row("Tablecloth rental", yesNo(payload.tableclothRental === "Yes"))}
            ${payload.setupNotes ? row("Setup notes", val(payload.setupNotes)) : ""}
          `)}

          ${payload.anythingElse ? section("Anything else", `${row("Note", val(payload.anythingElse))}`) : ""}

          ${section("Community", `
            ${row("Instagram share", yesNo(payload.instagramShare))}
          `)}

          <!-- Photos -->
          <div style="margin-bottom:24px;">
            <div style="background:#f3e9de;border-radius:8px 8px 0 0;padding:8px 16px;">
              <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#9a724d;">Photos</p>
            </div>
            <div style="background:#fffaf4;border-radius:0 0 8px 8px;padding:12px;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>${photoGrid}</tr></table>
            </div>
          </div>

          <!-- Footer -->
          <p style="margin:24px 0 0;text-align:center;font-size:12px;color:#b8a090;">
            White Lotus Summer Market &nbsp;·&nbsp; Bankastræti 2, 101 Reykjavík &nbsp;·&nbsp; team@mama.is
          </p>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const brandName = getRequiredText(formData, "brandName");
    const contactPerson = getRequiredText(formData, "contactPerson");
    const email = getRequiredText(formData, "email");
    const phoneWhatsapp = getRequiredText(formData, "phoneWhatsapp");
    const whatDoYouSell = getRequiredText(formData, "whatDoYouSell");
    const month = getRequiredText(formData, "month");
    const needsPower = getRequiredText(formData, "needsPower");
    const tableclothRental = getRequiredText(formData, "tableclothRental");

    const productCategory = parseJsonArray(formData.get("productCategory"));
    const preferredDates = parseJsonArray(formData.get("preferredDates"));
    const instagramOrWebsite = String(formData.get("instagramOrWebsite") || "").trim();
    const setupNotes = String(formData.get("setupNotes") || "").trim();
    const anythingElse = String(formData.get("anythingElse") || "").trim();
    const instagramShare = normalizeBoolean(formData.get("instagramShare"));
    const applicationConfirmation = normalizeBoolean(
      formData.get("applicationConfirmation")
    );
    const photos = formData.getAll("photos").filter(
      (f) => f instanceof File && f.size > 0
    );

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

    const supabase = createServerSupabase();
    const photoUrls = [];

    for (let index = 0; index < photos.length; index += 1) {
      const photo = photos[index];
      const file = photo;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${index + 1}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: "Failed to upload photos." },
          { status: 500 }
        );
      }

      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
      photoUrls.push(publicData.publicUrl);
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
      preferredDates,
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
        selected_dates: preferredDates,
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
      return NextResponse.json(
        { error: "Failed to save application." },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: "White Lotus Summer Market <team@mama.is>",
      to: ["team@mama.is"],
      replyTo: email,
      subject: `Summer Market application - ${brandName}`,
      html: buildEmailHtml(payload),
    });

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
