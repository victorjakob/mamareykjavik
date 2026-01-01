import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateBookingData } from "../../../whitelotus/booking/utils/validation";
import { createServerSupabase } from "@/util/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email translations
const emailTranslations = {
  is: {
    // Admin email
    adminTitle: "Ný bókun - White Lotus",
    adminBookingNumber: "Bókunarnúmer:",
    adminViewBooking: "Skoða bókun",
    adminViewBookingDesc:
      "Skoðaðu allar upplýsingar um bókunina, breyttu smáatriðum eða sendu viðskiptavininum skilaboð.",
    adminInfo: "Upplýsingar",
    adminName: "Nafn:",
    adminEmail: "Netfang:",
    adminCompany: "Fyrirtæki:",
    adminDate: "Dagsetning:",
    adminStartTime: "Byrjunartími:",
    adminEndTime: "Endatími:",
    adminEarlyAccess: "Aðgangur fyrr:",
    adminFooter: "Þessi bókun var staðfest í gegnum White Lotus bókunarkerfið",

    // Customer email
    customerDashboard: "Viðburðastjórnborð þitt",
    customerOpenDashboard: "Opna stjórnborð →",
    customerDashboardDesc:
      "Hér getur þú uppfært tíma, mat, tæknikröfur, ofnæmi og sent okkur skilaboð hvenær sem er.",
    customerBookingNumber: "Bókunarnúmer",
    customerBookingNumberDesc:
      "Þetta númer er einnig vistað á stjórnborðinu þínu.",
    customerGreeting: "Kæri",
    customerThankYou:
      "Takk fyrir bókunina! Við höfum móttekið upplýsingarnar og munum staðfesta innan 48 klukkustunda.",
    customerNextSteps: "Næstu skref:",
    customerReceived: "Við höfum móttekið upplýsingarnar þínar",
    customerContact: "Hafa samband innan skamms",
    customerFinalize: "Ganga frá síðustu smáatriðum",
    customerQuestions: "Spurningar? Hafðu samband á",
    customerBookingSummary: "Bókunaryfirlit",
    customerDate: "Dagsetning:",
    customerTime: "Tími:",
    customerGuests: "Fjöldi gesta:",
    customerConfirmations: "Staðfestingar",
    customerStaffCost: "Starfsmannakostnaður skilningur staðfestur",
    customerAlcoholRule: "Áfengisregla staðfest",
    customerNotes: "Athugasemdir",

    // Format labels
    yes: "Já",
    no: "Nei",
    notSelected: "Ekki valið",
  },
  en: {
    // Admin email
    adminTitle: "New booking - White Lotus",
    adminBookingNumber: "Booking number:",
    adminViewBooking: "View booking",
    adminViewBookingDesc:
      "View all booking information, make changes or send messages to the customer.",
    adminInfo: "Information",
    adminName: "Name:",
    adminEmail: "Email:",
    adminCompany: "Company:",
    adminDate: "Date:",
    adminStartTime: "Start time:",
    adminEndTime: "End time:",
    adminEarlyAccess: "Early access:",
    adminFooter:
      "This booking was confirmed through the White Lotus booking system",

    // Customer email
    customerDashboard: "Your event dashboard",
    customerOpenDashboard: "Open dashboard →",
    customerDashboardDesc:
      "Here you can update time, food, technical requirements, allergies and send us messages anytime.",
    customerBookingNumber: "Booking number",
    customerBookingNumberDesc: "This number is also saved on your dashboard.",
    customerGreeting: "Dear",
    customerThankYou:
      "Thank you for your booking! We have received your information and will confirm within 48 hours.",
    customerNextSteps: "Next steps:",
    customerReceived: "We have received your information",
    customerContact: "We will contact you shortly",
    customerFinalize: "Finalize the last details",
    customerQuestions: "Questions? Contact us at",
    customerBookingSummary: "Booking Summary",
    customerDate: "Date:",
    customerTime: "Time:",
    customerGuests: "Number of guests:",
    customerConfirmations: "Confirmations",
    customerStaffCost: "Staff cost acknowledgment confirmed",
    customerAlcoholRule: "Alcohol policy confirmed",
    customerNotes: "Notes",

    // Format labels
    yes: "Yes",
    no: "No",
    notSelected: "Not selected",
  },
};

// Helper to get translation
const t = (key, lang = "is") => {
  return emailTranslations[lang]?.[key] || emailTranslations.is[key] || key;
};

// Get base URL for booking links
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  return "http://localhost:3000";
};

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
    // If duplicate exists, append a random suffix
    const generateReferenceId = async (email, date, supabase) => {
      // Extract username from email (before @)
      const username = email.split("@")[0].toLowerCase();

      // Format date as DD-MM (day-month)
      const dateObj = new Date(date);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");

      const baseId = `${username}-${day}-${month}`;

      // Check if this reference ID already exists
      const { data: existing } = await supabase
        .from("whitelotus_bookings")
        .select("reference_id")
        .eq("reference_id", baseId)
        .single();

      // If it exists, append a random 4-character suffix
      if (existing) {
        const randomSuffix = Math.random()
          .toString(36)
          .substring(2, 6)
          .toLowerCase();
        return `${baseId}-${randomSuffix}`;
      }

      return baseId;
    };

    const initialReferenceId = await generateReferenceId(
      body.contact?.email || "guest@email.com",
      body.dateTime?.preferred || new Date(),
      createServerSupabase()
    );

    const baseUrl = getBaseUrl();
    // bookingUrl will be updated with finalReferenceId after database insert
    let bookingUrl = `${baseUrl}/whitelotus/booking/${initialReferenceId}`;

    // Store in database
    const supabase = createServerSupabase();

    // Retry logic for duplicate key errors
    let finalReferenceId = initialReferenceId;
    let insertedBooking = null;
    let dbError = null;
    let retries = 0;
    const maxRetries = 3;

    while (retries <= maxRetries) {
      const { data, error } = await supabase
        .from("whitelotus_bookings")
        .insert({
          reference_id: finalReferenceId,
          contact_name: body.contact?.name || "",
          contact_email: body.contact?.email || "",
          contact_phone: body.contact?.phone || "",
          contact_company: body.contact?.company || null,
          contact_kennitala: body.contact?.kennitala || null,
          event_type: body.eventType || null,
          preferred_datetime: body.dateTime?.preferred || null,
          start_time: body.dateTime?.startTime || null,
          end_time: body.dateTime?.endTime || null,
          datetime_comment: body.dateTimeComment || null,
          needs_early_access:
            body.needsEarlyAccess !== undefined ? body.needsEarlyAccess : null,
          setup_time: body.setupTime || null,
          services: body.services || [],
          services_comment: body.servicesComment || null,
          staff_cost_acknowledged: body.staffCostAcknowledged || false,
          no_own_alcohol_confirmed: body.noOwnAlcoholConfirmed || false,
          food: body.food || null,
          food_details: body.foodDetail || null,
          food_comment: body.foodComment || null,
          drinks: body.drinks || null,
          drinks_comment: body.drinks?.comment || null,
          guest_count: body.guestCount || null,
          guest_count_comment: body.guestCountComment || null,
          room_setup: body.roomSetup || null,
          room_setup_comment: body.roomSetupComment || null,
          tech_and_music: body.techAndMusic || null,
          tablecloth_data: body.tableclothData || null,
          notes: body.notes || null,
          language: body.language || "is", // Store language preference (default to Icelandic)
          status: "pending",
          booking_data: body, // Store full booking data as JSON (includes all new fields)
        })
        .select()
        .single();

      if (error) {
        // If it's a duplicate key error and we haven't exceeded max retries, generate a new ID and retry
        if (error.code === "23505" && retries < maxRetries) {
          const randomSuffix = Math.random()
            .toString(36)
            .substring(2, 6)
            .toLowerCase();
          // Get base ID (remove any existing suffix if present)
          const parts = initialReferenceId.split("-");
          const baseId =
            parts.length > 3
              ? parts.slice(0, -1).join("-")
              : initialReferenceId;
          finalReferenceId = `${baseId}-${randomSuffix}`;
          retries++;
          continue; // Retry with new reference ID
        }

        // For other errors or if max retries exceeded, break and handle error
        dbError = error;
        break;
      }

      // Success - break out of retry loop
      insertedBooking = data;
      break;
    }

    if (dbError) {
      console.error("Database storage error:", dbError);
      console.error("Reference ID:", finalReferenceId);
      console.error("Error details:", JSON.stringify(dbError, null, 2));
      // Return error but don't fail the entire request - email was already sent
      // The booking link won't work, but at least the email notification was sent
      return NextResponse.json({
        success: true,
        id: finalReferenceId,
        message: "Bókun staðfest (villa við gagnagrunn)",
        warning:
          "Bókun var ekki vistað í gagnagrunn. Vinsamlegast hafðu samband við okkur.",
      });
    } else {
      console.log(
        "Booking stored successfully:",
        insertedBooking?.reference_id
      );
      // Update booking URL with final reference ID
      bookingUrl = `${baseUrl}/whitelotus/booking/${finalReferenceId}`;
    }

    // Prepare email content with final reference ID (only if booking was successful)
    if (!dbError) {
      const bookingLanguage = body.language || "is";
      const emailContent = generateEmailContent(
        body,
        finalReferenceId,
        bookingUrl,
        bookingLanguage
      );
      const confirmationContent = generateConfirmationContent(
        body,
        finalReferenceId,
        bookingUrl,
        bookingLanguage
      );

      // Email subject translations
      const emailSubjects = {
        is: {
          admin: `Bókun staðfest - ${finalReferenceId}`,
          customer: `Bókun staðfest - ${finalReferenceId}`,
        },
        en: {
          admin: `Booking confirmed - ${finalReferenceId}`,
          customer: `Booking confirmed - ${finalReferenceId}`,
        },
      };

      // Send email to White Lotus team
      await resend.emails.send({
        from: "White Lotus Booking <team@mama.is>",
        to: "team@whitelotus.is",
        replyTo: body.contact.email,
        subject:
          emailSubjects[bookingLanguage]?.admin || emailSubjects.is.admin,
        html: emailContent,
      });

      // Send confirmation email to customer
      await resend.emails.send({
        from: "White Lotus <team@mama.is>",
        to: [body.contact.email],
        replyTo: "team@thewhitelotus.is",
        subject:
          emailSubjects[bookingLanguage]?.customer || emailSubjects.is.customer,
        html: confirmationContent,
      });
    }

    return NextResponse.json({
      success: true,
      id: finalReferenceId,
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

function generateEmailContent(data, referenceId, bookingUrl, language = "is") {
  const formatGuestCount = (count) => {
    const counts = {
      is: {
        "undir-10": "Undir 10 gestir",
        "10-25": "10-25 gestir",
        "26-50": "26-50 gestir",
        "51-75": "51-75 gestir",
        "76-100": "76-100 gestir",
        "100+": "100+ gestir",
      },
      en: {
        "undir-10": "Under 10 guests",
        "10-25": "10-25 guests",
        "26-50": "26-50 guests",
        "51-75": "51-75 guests",
        "76-100": "76-100 guests",
        "100+": "100+ guests",
      },
    };
    return counts[language]?.[count] || counts.is[count] || count;
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

  const formatServices = (services) => {
    const serviceLabels = {
      food: "Matur",
      drinks: "Drykkir",
      eventManager: "Atriði/Veislustjóri",
      neither: "Hvorugt - Einungis salinn",
    };
    return (
      services?.map((s) => serviceLabels[s] || s).join(", ") ||
      "Engin þjónusta valin"
    );
  };

  const formatBarType = (barType) => {
    const types = {
      openBar:
        "Opinn Bar - Við skráum allt sem selst og þú færð rkn eftir veisluna",
      prePurchased: "Fyrirframkeypt - Veldu hvað þú villt bjóða upp á",
      peoplePayThemselves: "Fólk kaupir sér sjálft drykki á barnum",
    };
    return types[barType] || barType;
  };

  const formatFood = (food, foodDetail) => {
    const foodLabels = {
      buffet: "Hlaðborð",
      plated: "Borðhald",
      fingerFood: "Pinnamatur",
    };
    const detailLabels = {
      classic: "Classic",
      simplified: "Einfaldað",
      "3course": "3 rétta",
      "2course": "2 rétta",
      half: "Hálfur (5-6 stk á mann)",
      full: "Heill (10-12 stk á mann)",
    };
    const mainLabel = foodLabels[food] || food;
    const detailLabel = foodDetail
      ? detailLabels[foodDetail] || foodDetail
      : "";
    return detailLabel ? `${mainLabel} - ${detailLabel}` : mainLabel;
  };

  const formatYesNoUnknown = (value) => {
    if (value === true) return t("yes", language);
    if (value === false) return t("no", language);
    if (value === undefined) return "?";
    return t("notSelected", language);
  };

  const formatTablecloth = (tableclothData) => {
    if (!tableclothData) return "Ekki valið";
    if (tableclothData.wantsToRentTablecloths === false) {
      return "Ekki leigja dúka";
    }
    if (tableclothData.wantsToRentTablecloths === true) {
      const color =
        tableclothData.tableclothColor === "white"
          ? "Hvítir dúkar"
          : tableclothData.tableclothColor === "black"
            ? "Svartir dúkar"
            : "";
      return color || "Ekki valið";
    }
    return "Ekki valið";
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    const locale = language === "en" ? "en-US" : "is-IS";
    return date.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    if (timeString.includes(":") && timeString.length <= 5) {
      try {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
          "is-IS",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );
      } catch {
        return timeString;
      }
    }
    return timeString;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="border-bottom: 2px solid #a77d3b; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 300;">${t("adminTitle", language)}</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">${t("adminBookingNumber", language)} <strong style="color: #a77d3b;">${referenceId}</strong></p>
        </div>

        <!-- View Booking CTA - Prominent at Top -->
        <div style="background: linear-gradient(135deg, #a77d3b 0%, #8b6a2f 100%); border-radius: 8px; padding: 30px; margin-bottom: 30px; text-align: center;">
          <h2 style="margin: 0 0 15px 0; font-size: 22px; font-weight: 500; color: #ffffff;">${t("adminViewBooking", language)}</h2>
          <p style="margin: 0 0 20px 0; font-size: 15px; color: rgba(255,255,255,0.95); line-height: 1.5;">
            ${t("adminViewBookingDesc", language)}
          </p>
          <a href="${bookingUrl}" style="display: inline-block; background-color: #ffffff; color: #a77d3b; padding: 16px 36px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); transition: all 0.3s ease;">
            ${t("adminViewBooking", language)} →
          </a>
        </div>

        <!-- Quick Info Summary -->
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">${t("adminInfo", language)}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px; width: 120px; vertical-align: top;">${t("adminName", language)}</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${data.contact?.name || "—"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px; vertical-align: top;">${t("adminEmail", language)}</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">
                <a href="mailto:${data.contact?.email || ""}" style="color: #a77d3b; text-decoration: none;">${data.contact?.email || "—"}</a>
              </td>
            </tr>
            ${
              data.contact?.company
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px; vertical-align: top;">${t("adminCompany", language)}</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${data.contact.company}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px; vertical-align: top;">${t("adminDate", language)}</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${formatDateTime(data.dateTime?.preferred)}</td>
            </tr>
            ${
              data.dateTime?.startTime
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px; vertical-align: top;">${t("adminStartTime", language)}</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${formatTime(data.dateTime.startTime)}</td>
            </tr>
            `
                : ""
            }
            ${
              data.dateTime?.endTime
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px; vertical-align: top;">${t("adminEndTime", language)}</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${formatTime(data.dateTime.endTime)}</td>
            </tr>
            `
                : ""
            }
            ${
              data.needsEarlyAccess !== undefined
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px; vertical-align: top;">${t("adminEarlyAccess", language)}</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px;">${formatYesNoUnknown(data.needsEarlyAccess)}${data.needsEarlyAccess === true && data.setupTime ? ` - ${data.setupTime}` : ""}</td>
            </tr>
            `
                : ""
            }
          </table>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #666; font-size: 13px; margin: 0;">
            ${t("adminFooter", language)}<br>
            <strong style="color: #a77d3b;">${t("adminBookingNumber", language)} ${referenceId}</strong>
          </p>
        </div>
    </div>
    </body>
    </html>
  `;
}

function generateConfirmationContent(
  data,
  referenceId,
  bookingUrl,
  language = "is"
) {
  const formatGuestCount = (count) => {
    const counts = {
      is: {
        "undir-10": "Undir 10 gestir",
        "10-25": "10-25 gestir",
        "26-50": "26-50 gestir",
        "51-75": "51-75 gestir",
        "76-100": "76-100 gestir",
        "100+": "100+ gestir",
      },
      en: {
        "undir-10": "Under 10 guests",
        "10-25": "10-25 guests",
        "26-50": "26-50 guests",
        "51-75": "51-75 guests",
        "76-100": "76-100 guests",
        "100+": "100+ guests",
      },
    };
    return counts[language]?.[count] || counts.is[count] || count;
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    const locale = language === "en" ? "en-US" : "is-IS";
    return date.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    if (timeString.includes(":") && timeString.length <= 5) {
      try {
        const locale = language === "en" ? "en-US" : "is-IS";
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return timeString;
      }
    }
    return timeString;
  };

  const formatDateIS = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    const locale = language === "en" ? "en-US" : "is-IS";
    return date.toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; border-radius: 14px; padding: 40px; box-shadow: 0 12px 34px rgba(0,0,0,0.06);">
  
      <!-- PRIMARY ACTION (FIRST THING THEY SEE) -->
      <div style="text-align:center; margin-bottom:34px;">
        <p style="font-size:12px; text-transform:uppercase; letter-spacing:0.18em; color:#8b6a2f; margin-bottom:8px; font-weight:300;">
          ${t("customerDashboard", language)}
        </p>
        <a href="${bookingUrl}" style="display:inline-block; background:linear-gradient(135deg, #a77d3b, #8b6a2f); color:#ffffff; padding:18px 40px; text-decoration:none; border-radius:14px; font-weight:600; font-size:18px; box-shadow:0 14px 26px rgba(167, 125, 59, 0.25); transition: all 0.3s ease;">
          ${t("customerOpenDashboard", language)}
        </a>
        <p style="font-size:13px; color:#555; margin-top:14px; font-weight:300;">
          ${t("customerDashboardDesc", language)}
        </p>
      </div>
  
      <!-- Booking reference ID (SECOND IN HIERARCHY) -->
      <div style="background: transparent; border: 2px solid #a77d3b; padding:24px; border-radius:14px; margin-bottom:28px; text-align:center;">
        <h2 style="margin:0 0 6px 0; font-size:12px; font-weight:400; text-transform:uppercase; letter-spacing:0.2em; color:#a77d3b;">
          ${t("customerBookingNumber", language)}
        </h2>
        <p style="font-size:24px; font-weight:300; margin:6px 0; letter-spacing:1px; color:#a77d3b;">
          ${referenceId}
        </p>
        <p style="font-size:12px; margin:10px 0 0 0; color:#8b6a2f;">
          ${t("customerBookingNumberDesc", language)}
        </p>
      </div>
  
      <!-- Greeting -->
      <p style="color:#111; font-size:16px; margin:0 0 16px 0;">
        ${t("customerGreeting", language)} ${data.contact?.name || (language === "en" ? "customer" : "viðskiptavinur")},
      </p>
  
      <!-- Main message -->
      <p style="color:#333; font-size:16px; margin:0 0 24px 0;">
        ${t("customerThankYou", language)}
      </p>
  
      <!-- Booking details summary -->
      <div style="background-color:#faf6ef; border-radius:12px; padding:20px 24px; margin:24px 0; border:1px solid #a77d3b22;">
        <p style="font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#8b6a2f; margin:0 0 12px 0;">
          ${t("customerBookingSummary", language)}
        </p>
  
        <p style="margin:0; font-size:15px; color:#222;">
          📅 <strong>${t("customerDate", language)}</strong> ${formatDateIS(data.dateTime?.preferred)}<br>
          ⏰ <strong>${t("customerTime", language)}</strong> ${formatTime(data.dateTime?.startTime)} – ${formatTime(data.dateTime?.endTime)}<br>
          👥 <strong>${t("customerGuests", language)}</strong> ${formatGuestCount(data.guestCount)}
        </p>
  
        ${data.dateTimeComment ? `<p style="margin-top:14px; font-size:14px; color:#444;">💬 ${data.dateTimeComment}</p>` : ""}
      </div>
  
      <!-- Confirmations -->
      <div style="margin:28px 0; padding:16px; border-top:1px solid #eee; border-bottom:1px solid #eee; background-color:#ffffff; border-radius:12px;">
        <p style="font-size:11px; text-transform:uppercase; letter-spacing:0.18em; color:#777; margin-bottom:10px;">
          ${t("customerConfirmations", language)}
        </p>
        <div style="font-size:14px; color:#222; line-height:1.7;">
          ${data.staffCostAcknowledged ? `✓ ${t("customerStaffCost", language)}<br>` : ""}
          ${data.noOwnAlcoholConfirmed ? `✓ ${t("customerAlcoholRule", language)}<br>` : ""}
        </div>
      </div>
  
      <!-- Optional fields if exist -->
      ${data.servicesComment ? `<p style="margin-top:18px; font-size:14px; color:#555;">💬 ${data.servicesComment}</p>` : ""}
      ${data.foodComment ? `<p style="margin-top:18px; font-size:14px; color:#555;">💬 ${data.foodComment}</p>` : ""}
      ${data.drinks?.comment ? `<p style="margin-top:18px; font-size:14px; color:#555;">💬 ${data.drinks.comment}</p>` : ""}
      ${data.roomSetupComment ? `<p style="margin-top:18px; font-size:14px; color:#555;">💬 ${data.roomSetupComment}</p>` : ""}
      ${data.techAndMusic?.comment ? `<p style="margin-top:18px; font-size:14px; color:#555;">💬 ${data.techAndMusic.comment}</p>` : ""}
      ${data.tableclothData?.decorationComments ? `<p style="margin-top:18px; font-size:14px; color:#555;">🕯️ ${data.tableclothData.decorationComments}</p>` : ""}
  
      <!-- Notes -->
      ${
        data.notes
          ? `
      <div style="margin-top:28px;">
        <p style="font-size:11px; text-transform:uppercase; letter-spacing:0.18em; color:#777; margin-bottom:6px;">${t("customerNotes", language)}</p>
        <div style="background-color:#f8f9fa; border-radius:12px; padding:16px 22px; border:1px solid #e2e8f0aa;">
          <p style="margin:0; font-size:14px; color:#444; white-space:pre-wrap; line-height:1.6;">${data.notes}</p>
        </div>
      </div>
      `
          : ""
      }
  
      <!-- Footer -->
      <div style="margin-top:40px; padding-top:20px; border-top:1px solid #eef2f7; text-align:center;">
        <p style="color:#666; font-size:12px; margin:0; line-height:1.6;">
          White Lotus // Kornhlaðan<br>
          Bankastræti 2, 101 Reykjavík<br>
          Blessing ehf - 670220-0440
        </p>
      </div>
  
    </div>
  </body>
  </html>
  `;
}
