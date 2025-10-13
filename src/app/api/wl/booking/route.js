import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateBookingData } from "../../../whitelotus/booking/utils/validation";
import { createServerSupabase } from "@/util/supabase/server";

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

    // Generate a meaningful reference ID with email username and date
    const generateReferenceId = (email, date) => {
      // Extract username from email (before @)
      const username = email.split("@")[0].toLowerCase();

      // Format date as DD-MM (day-month)
      const dateObj = new Date(date);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");

      return `${username}-${day}-${month}`;
    };

    const referenceId = generateReferenceId(
      body.contact?.email || "guest@email.com",
      body.dateTime?.preferred || new Date()
    );

    // Prepare email content
    const emailContent = generateEmailContent(body, referenceId);
    const confirmationContent = generateConfirmationContent(body, referenceId);

    // Send email to White Lotus team
    await resend.emails.send({
      from: "White Lotus Booking <team@mama.is>",
      to: "team@whitelotus.is",
      replyTo: body.contact.email,
      subject: `Bókun staðfest - ${referenceId}`,
      html: emailContent,
    });

    // Send confirmation email to customer
    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: [body.contact.email],
      replyTo: "team@mama.is",
      subject: `Bókun staðfest - ${referenceId}`,
      html: confirmationContent,
    });

    // Store in database
    const supabase = createServerSupabase();
    const { error: dbError } = await supabase
      .from("whitelotus_bookings")
      .insert({
        reference_id: referenceId,
        contact_name: body.contact?.name || "",
        contact_email: body.contact?.email || "",
        contact_phone: body.contact?.phone || "",
        preferred_datetime: body.dateTime?.preferred || null,
        start_time: body.dateTime?.startTime || null,
        end_time: body.dateTime?.endTime || null,
        datetime_comment: body.dateTimeComment || null,
        services: body.services || [],
        services_comment: body.servicesComment || null,
        food: body.food || null,
        food_details: body.foodDetails || null,
        food_comment: body.foodComment || null,
        drinks: body.drinks || null,
        drinks_comment: body.drinksComment || null,
        guest_count: body.guestCount || null,
        guest_count_comment: body.guestCountComment || null,
        room_setup: body.roomSetup || null,
        room_setup_comment: body.roomSetupComment || null,
        tablecloth: body.tablecloth || null,
        tablecloth_comment: body.tableclothComment || null,
        notes: body.notes || null,
        status: "pending",
        booking_data: body, // Store full booking data as JSON
      });

    if (dbError) {
      console.error("Database storage error:", dbError);
      // Don't fail the request if database storage fails, but log it
    }

    return NextResponse.json({
      success: true,
      id: referenceId,
      message: "Bókun staðfest",
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
  const formatGuestCount = (count) => {
    const counts = {
      "undir-10": "Undir 10 gestir",
      "10-25": "10-25 gestir",
      "26-50": "26-50 gestir",
      "51-75": "51-75 gestir",
      "76-100": "76-100 gestir",
      "100+": "100+ gestir",
    };
    return counts[count] || count;
  };

  const formatRoomSetup = (setup) => {
    const setups = {
      seated: "Borð - allir fá sæti við borð",
      standing: "Standandi - enginn stólar eða borð",
      mixed: "50/50 - Bæði standandi og sitjandi í boði",
      lounge:
        "Lounge - 2 sófar og lágborð, nokkrir stólar og síðan opið dansgólf",
      presentation: "Kynning/Sýning - stólar í átt að sviði",
    };
    return setups[setup] || setup;
  };

  const formatTablecloth = (cloth) => {
    const cloths = {
      white: "Hvítir dúkar",
      black: "Svartir dúkar",
      own: "Eigin dúkar",
    };
    return cloths[cloth] || cloth;
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4a5568;">Bókun staðfest - ${referenceId}</h2>
      
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Tengiliðaupplýsingar</h3>
        <p><strong>Nafn:</strong> ${data.contact?.name || "N/A"}</p>
        <p><strong>Netfang:</strong> ${data.contact?.email || "N/A"}</p>
        <p><strong>Sími:</strong> ${data.contact?.phone || "N/A"}</p>
        ${data.firstTime !== undefined ? `<p><strong>Fyrsta skipti:</strong> ${data.firstTime ? "Já" : "Nei"}</p>` : ""}
      </div>

      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Dagsetning & Tími</h3>
        <p><strong>Dagsetning:</strong> ${data.dateTime?.preferred ? new Date(data.dateTime.preferred).toLocaleDateString("is-IS", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "N/A"}</p>
        ${data.dateTime?.startTime ? `<p><strong>Byrjunartími:</strong> ${data.dateTime.startTime}</p>` : ""}
        ${data.dateTime?.endTime ? `<p><strong>Endatími:</strong> ${data.dateTime.endTime}</p>` : ""}
        ${data.dateTimeComment ? `<p style="font-style: italic; color: #718096;"><strong>Athugasemd:</strong> ${data.dateTimeComment}</p>` : ""}
      </div>

      ${
        data.services && data.services.length > 0
          ? `
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Þjónusta</h3>
        <p><strong>Valin þjónusta:</strong> ${data.services.join(", ")}</p>
        ${data.servicesComment ? `<p style="font-style: italic; color: #718096;"><strong>Athugasemd:</strong> ${data.servicesComment}</p>` : ""}
      </div>
      `
          : ""
      }

      ${
        data.food
          ? `
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Matur</h3>
        <p><strong>Val:</strong> ${data.food}</p>
        ${data.foodComment ? `<p style="font-style: italic; color: #718096;"><strong>Athugasemd:</strong> ${data.foodComment}</p>` : ""}
      </div>
      `
          : ""
      }

      ${
        data.drinks
          ? `
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Drykkir</h3>
        ${data.drinks.barType ? `<p><strong>Bargerð:</strong> ${data.drinks.barType}</p>` : ""}
        ${data.drinks.prePurchased ? `<p><strong>Fyrirframkeypt:</strong> ${JSON.stringify(data.drinks.prePurchased, null, 2)}</p>` : ""}
        ${data.drinksComment ? `<p style="font-style: italic; color: #718096;"><strong>Athugasemd:</strong> ${data.drinksComment}</p>` : ""}
      </div>
      `
          : ""
      }

      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Viðburðarupplýsingar</h3>
        ${data.guestCount ? `<p><strong>Fjöldi gesta:</strong> ${formatGuestCount(data.guestCount)}</p>` : ""}
        ${data.guestCountComment ? `<p style="font-style: italic; color: #718096;"><strong>Athugasemd:</strong> ${data.guestCountComment}</p>` : ""}
        ${data.roomSetup ? `<p><strong>Uppsetning:</strong> ${formatRoomSetup(data.roomSetup)}</p>` : ""}
        ${data.roomSetupComment ? `<p style="font-style: italic; color: #718096;"><strong>Athugasemd:</strong> ${data.roomSetupComment}</p>` : ""}
        ${data.tablecloth ? `<p><strong>Dúkar:</strong> ${formatTablecloth(data.tablecloth)}</p>` : ""}
        ${data.tableclothComment ? `<p style="font-style: italic; color: #718096;"><strong>Athugasemd:</strong> ${data.tableclothComment}</p>` : ""}
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
          Þessi bókun var staðfest í gegnum White Lotus bókunarkerfið.<br>
          Bókunarnúmer: <strong>${referenceId}</strong>
        </p>
      </div>
    </div>
  `;
}

function generateConfirmationContent(data, referenceId) {
  const formatGuestCount = (count) => {
    const counts = {
      "undir-10": "Undir 10 gestir",
      "10-25": "10-25 gestir",
      "26-50": "26-50 gestir",
      "51-75": "51-75 gestir",
      "76-100": "76-100 gestir",
      "100+": "100+ gestir",
    };
    return counts[count] || count;
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4a5568;">Bókun staðfest!</h2>
      
      <p>Kæri ${data.contact?.name || "viðskiptavinur"},</p>
      
      <p>Við erum spennt að sjá þig hjá okkur! Hér fyrir neðan eru upplýsingarnar sem þú gafst upp fyrir viðburðinn þinn í White Lotus // Kornhlaðan.</p>
      
      <div style="background: #f0fff4; border: 1px solid #9ae6b4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #22543d;">Bókunarnúmer</h3>
        <p style="font-size: 24px; font-weight: bold; color: #22543d; margin: 10px 0;">${referenceId}</p>
        <p style="color: #22543d; font-size: 14px;">Vinsamlegast geymið þetta númer fyrir tilvísanir.</p>
      </div>

      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2d3748;">Upplýsingar um viðburðinn þinn</h3>
        ${data.dateTime?.preferred ? `<p><strong>Dagsetning:</strong> ${new Date(data.dateTime.preferred).toLocaleDateString("is-IS", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>` : ""}
        ${data.dateTime?.startTime ? `<p><strong>Byrjunartími:</strong> ${data.dateTime.startTime}</p>` : ""}
        ${data.dateTime?.endTime ? `<p><strong>Endatími:</strong> ${data.dateTime.endTime}</p>` : ""}
        ${data.guestCount ? `<p><strong>Gestir:</strong> ${formatGuestCount(data.guestCount)}</p>` : ""}
        ${data.services && data.services.length > 0 ? `<p><strong>Þjónusta:</strong> ${data.services.join(", ")}</p>` : ""}
        ${data.roomSetup ? `<p><strong>Uppsetning:</strong> ${data.roomSetup}</p>` : ""}
      </div>

      <p>Við munum hafa samband innan skamms til að ganga frá síðustu smáatriðum. Ef þú þarft að breyta einhverju eða hefur spurningar, endilega hafðu samband við okkur á <a href="mailto:team@whitelotus.is">team@whitelotus.is</a>.</p>
      
      <p>Við hlökkum til að taka á móti þér!<br>
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
