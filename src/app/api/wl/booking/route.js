import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateBookingData } from "../../../whitelotus/booking/utils/validation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate the booking data
    const validation = validateBookingData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Generate a reference ID...
    const referenceId = `WL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Prepare email content
    const emailContent = generateEmailContent(body, referenceId);
    const confirmationContent = generateConfirmationContent(body, referenceId);

    // Send email to White Lotus team
    await resend.emails.send({
      from: "White Lotus Booking <team@mama.is>",
      to: "team@whitelotus.is",
      replyTo: body.contact.email,
      subject: `New Booking Request - ${referenceId}`,
      html: emailContent,
    });

    // Send confirmation email to customer
    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: [body.contact.email],
      replyTo: "team@mama.is",
      subject: `Booking Request Confirmed - ${referenceId}`,
      html: confirmationContent,
    });

    // TODO: Store in database
    // await storeBookingInDatabase(body, referenceId);

    return NextResponse.json({
      success: true,
      id: referenceId,
      message: "Booking request submitted successfully",
    });
  } catch (error) {
    console.error("Booking submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit booking request" },
      { status: 500 }
    );
  }
}

function generateEmailContent(data, referenceId) {
  const formatEventType = (type) => {
    const types = {
      ceremony: "Athöfn",
      celebration: "Veisla",
      workshop: "Vinnustofa/Retreat",
      dinner: "Einkakvöldverður",
      other: "Annað",
    };
    return types[type] || type;
  };

  const formatGuestCount = (count) => {
    const counts = {
      "1-10": "1-10 gestir",
      "10-20": "10-20 gestir",
      "20-40": "20-40 gestir",
      "40+": "40+ gestir",
    };
    return counts[count] || count;
  };

  const formatBudget = (budget) => {
    const budgets = {
      "<150k": "Undir 150.000 kr",
      "150-300k": "150.000 - 300.000 kr",
      "300-600k": "300.000 - 600.000 kr",
      ">600k": "Yfir 600.000 kr",
      unknown: "Óákveðið",
    };
    return budgets[budget] || budget;
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4a5568;">Ný bókun beiðni - ${referenceId}</h2>
      
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Tengiliðaupplýsingar</h3>
        <p><strong>Nafn:</strong> ${data.contact.name}</p>
        <p><strong>Netfang:</strong> ${data.contact.email}</p>
        <p><strong>Sími:</strong> ${data.contact.phone}</p>
        <p><strong>Fyrsta skipti:</strong> ${data.firstTime ? "Já" : "Nei"}</p>
      </div>

      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Viðburðarupplýsingar</h3>
        <p><strong>Tegund viðburðar:</strong> ${formatEventType(data.eventType)}</p>
        <p><strong>Fjöldi gesta:</strong> ${formatGuestCount(data.guestCount)}</p>
        <p><strong>Kjördagsetning:</strong> ${new Date(data.dateTime.preferred).toLocaleDateString("is-IS")}</p>
        <p><strong>Tími:</strong> ${new Date(data.dateTime.preferred).toLocaleTimeString("is-IS", { hour: "2-digit", minute: "2-digit" })}</p>
        ${data.dateTime.flexible ? `<p><strong>Sveigjanlegt:</strong> Já${data.dateTime.altRange ? ` - ${data.dateTime.altRange}` : ""}</p>` : ""}
      </div>

      ${
        data.eventExtras
          ? `
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Viðbótarkröfur</h3>
        ${Object.entries(data.eventExtras)
          .map(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              return `<p><strong>${key}:</strong> ${value.join(", ")}</p>`;
            } else if (typeof value === "string" && value.trim()) {
              return `<p><strong>${key}:</strong> ${value}</p>`;
            }
            return "";
          })
          .join("")}
      </div>
      `
          : ""
      }

      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Skipulag</h3>
        <p><strong>Uppsetning:</strong> ${data.roomSetup}</p>
        <p><strong>Dúkar:</strong> ${data.tablecloth}</p>
        <p><strong>Atriði:</strong> ${data.entertainment.join(", ")}</p>
        ${data.soundContactPhone ? `<p><strong>Hljóðtengiliður:</strong> ${data.soundContactPhone}</p>` : ""}
        <p><strong>Þjónusta:</strong> ${data.services.join(", ")}</p>
        ${data.drinks && data.drinks.length > 0 ? `<p><strong>Drykkir:</strong> ${data.drinks.join(", ")}</p>` : ""}
        <p><strong>Fjárhagsáætlun:</strong> ${formatBudget(data.budget)}</p>
        <p><strong>Stemning:</strong> ${data.vibe.join(", ")}</p>
      </div>

      ${
        data.notes
          ? `
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Athugasemdir</h3>
        <p>${data.notes}</p>
      </div>
      `
          : ""
      }

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #718096; font-size: 14px;">
          Þessi beiðni var send frá White Lotus bókunarkerfinu.<br>
          Tilvísunarnúmer: <strong>${referenceId}</strong>
        </p>
      </div>
    </div>
  `;
}

function generateConfirmationContent(data, referenceId) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4a5568;">Takk fyrir beiðnina!</h2>
      
      <p>Kæri ${data.contact.name},</p>
      
      <p>Við höfum fengið beiðnina þína um að bóka White Lotus // Kornhlaðan og munum hafa samband við þig innan 24 klukkustunda til að ræða nánar um viðburðinn þinn.</p>
      
      <div style="background: #f0fff4; border: 1px solid #9ae6b4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #22543d;">Tilvísunarnúmer þitt</h3>
        <p style="font-size: 24px; font-weight: bold; color: #22543d; margin: 10px 0;">${referenceId}</p>
        <p style="color: #22543d; font-size: 14px;">Vinsamlegast geymið þetta númer fyrir viðtöl og tengsl.</p>
      </div>

      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Yfirlit af beiðninni</h3>
        <p><strong>Viðburður:</strong> ${new Date(data.dateTime.preferred).toLocaleDateString("is-IS")} kl. ${new Date(data.dateTime.preferred).toLocaleTimeString("is-IS", { hour: "2-digit", minute: "2-digit" })}</p>
        <p><strong>Gestir:</strong> ${data.guestCount}</p>
        <p><strong>Þjónusta:</strong> ${data.services.join(", ")}</p>
      </div>

      <p>Ef þú hefur spurningar eða þarfnast að breyta einhverju, endilega hafðu samband við okkur á <a href="mailto:team@whitelotus.is">team@whitelotus.is</a> eða svaraðu bara þessum tölvupósti.</p>
      
      <p>Með kveðju,<br>
      <strong>White Lotus // Kornhlaðan</strong></p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #718096; font-size: 12px;">
          White Lotus // Kornhlaðan<br>
          Fógetagarður 1, 101 Reykjavík<br>
          team@whitelotus.is
        </p>
      </div>
    </div>
  `;
}
