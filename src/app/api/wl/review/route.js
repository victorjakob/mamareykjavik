import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { Resend } from "resend";

function jsonError(message, status = 400, details) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status }
  );
}

function asInt(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function inRange(n, min, max) {
  return Number.isInteger(n) && n >= min && n <= max;
}

function computeSegment({ overallStars, recommendScore }) {
  const low = overallStars <= 3 || recommendScore <= 6;
  // "middle" must be reachable. If we treat overall>=4 as "high" on its own,
  // every non-low response becomes high. Use a combined high threshold instead.
  const high = overallStars >= 4 && recommendScore >= 9;
  if (low) return "low";
  if (high) return "high";
  return "middle";
}

function getAppOrigin(request) {
  // Prefer Origin (present on fetch), fallback to forwarded headers, then a safe default.
  const origin = request.headers.get("origin");
  if (origin) return origin;

  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (proto && host) return `${proto}://${host}`;
  if (host) return `https://${host}`;

  return "https://mama.is";
}

function presentStars(n) {
  if (!Number.isInteger(n)) return null;
  return `${n}/5`;
}

function presentScore(n) {
  if (!Number.isInteger(n)) return null;
  return `${n}/10`;
}

function isNonEmptyString(s) {
  return typeof s === "string" && s.trim().length > 0;
}

async function sendReviewEmail({ request, kind, review }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("[reviews email] RESEND_API_KEY not set; skipping email");
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const adminLink = `${getAppOrigin(request)}/admin/reviews`;

    const rows = [];
    rows.push(["Overall", `${review.overall_stars}★`]);
    rows.push(["Recommend", presentScore(review.recommend_score) || "—"]);

    const addRowIf = (label, value) => {
      if (value === null || value === undefined) return;
      if (typeof value === "string" && value.trim().length === 0) return;
      rows.push([label, String(value)]);
    };

    addRowIf("Segment", review.segment);
    addRowIf("Locale", review.locale);
    addRowIf("Booking & communication", presentStars(review.booking_communication_stars));
    addRowIf("Staff service", presentStars(review.staff_service_stars));
    addRowIf("Cleanliness", presentStars(review.space_cleanliness_stars));
    addRowIf("Improve", review.improve_one_thing);

    // Low satisfaction extra
    addRowIf("What went wrong", review.low_satisfaction_details);
    addRowIf("Follow-up name", review.follow_up_name);
    addRowIf("Follow-up contact", review.follow_up_contact);

    // Extra details
    addRowIf("Ambience / vibe", presentStars(review.ambience_vibe_stars));
    addRowIf("Tech & equipment", presentStars(review.tech_equipment_stars));
    addRowIf("Flow on the day", presentStars(review.flow_on_the_day_stars));
    addRowIf("Value for money", presentStars(review.value_for_money_stars));
    addRowIf("Best part", review.best_part);

    const subject =
      kind === "submitted"
        ? `New White Lotus review: ${review.overall_stars}★, ${review.recommend_score}/10`
        : `White Lotus review updated: ${review.overall_stars}★, ${review.recommend_score}/10`;

    const title =
      kind === "submitted" ? "New review submitted" : "Review updated";

    const htmlRows = rows
      .map(
        ([k, v]) => `
          <tr>
            <td style="padding:10px 12px; border-top:1px solid #eee; color:#111; font-weight:600; width:220px;">${k}</td>
            <td style="padding:10px 12px; border-top:1px solid #eee; color:#333;">${String(v)
              .replaceAll("&", "&amp;")
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")
              .replaceAll("\n", "<br/>")}</td>
          </tr>`
      )
      .join("");

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.45;">
        <h2 style="margin:0 0 12px; color:#111;">${title}</h2>
        <p style="margin:0 0 16px; color:#444;">
          A White Lotus review was ${kind === "submitted" ? "submitted" : "updated"}.
        </p>
        <table style="border-collapse:collapse; width:100%; max-width:720px; background:#fff; border:1px solid #eee; border-radius:12px; overflow:hidden;">
          ${htmlRows}
        </table>
        <p style="margin:16px 0 0;">
          <a href="${adminLink}" style="display:inline-block; padding:10px 14px; border-radius:10px; background:#0f766e; color:#fff; text-decoration:none; font-weight:700;">
            Open Admin Reviews
          </a>
        </p>
        <p style="margin:12px 0 0; color:#888; font-size:12px;">
          Review ID: ${review.id}
        </p>
      </div>
    `;

    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: "team@mama.is",
      subject,
      html,
    });
  } catch (e) {
    console.error("[reviews email] failed:", e);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const locale = body?.locale === "is" ? "is" : "en";
    const overallStars = asInt(body?.overall_stars ?? body?.overallStars);
    const recommendScore = asInt(body?.recommend_score ?? body?.recommendScore);

    const bookingCommunicationStars = asInt(
      body?.booking_communication_stars ?? body?.bookingCommunicationStars
    );
    const staffServiceStars = asInt(
      body?.staff_service_stars ?? body?.staffServiceStars
    );
    const spaceCleanlinessStars = asInt(
      body?.space_cleanliness_stars ?? body?.spaceCleanlinessStars
    );

    const improveOneThingRaw =
      body?.improve_one_thing ?? body?.improveOneThing ?? null;
    const improveOneThing =
      typeof improveOneThingRaw === "string"
        ? improveOneThingRaw.trim().slice(0, 1000)
        : null;

    if (!inRange(overallStars, 1, 5)) {
      return jsonError("overall_stars must be an integer 1–5", 400);
    }
    if (!inRange(recommendScore, 0, 10)) {
      return jsonError("recommend_score must be an integer 0–10", 400);
    }
    if (
      bookingCommunicationStars !== null &&
      !inRange(bookingCommunicationStars, 1, 5)
    ) {
      return jsonError("booking_communication_stars must be 1–5 or null", 400);
    }
    if (staffServiceStars !== null && !inRange(staffServiceStars, 1, 5)) {
      return jsonError("staff_service_stars must be 1–5 or null", 400);
    }
    if (spaceCleanlinessStars !== null && !inRange(spaceCleanlinessStars, 1, 5)) {
      return jsonError("space_cleanliness_stars must be 1–5 or null", 400);
    }

    const segment = computeSegment({ overallStars, recommendScore });
    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from("whitelotus_event_feedback")
      .insert({
        locale,
        overall_stars: overallStars,
        recommend_score: recommendScore,
        booking_communication_stars: bookingCommunicationStars,
        staff_service_stars: staffServiceStars,
        space_cleanliness_stars: spaceCleanlinessStars,
        improve_one_thing: improveOneThing || null,
        segment,
      })
      .select("id, segment")
      .single();

    if (error) {
      console.error("Feedback insert failed:", error);
      return jsonError("Failed to store feedback", 500, error.message);
    }

    // Best-effort notification email (do not block response on email failure).
    void sendReviewEmail({
      request,
      kind: "submitted",
      review: {
        id: data.id,
        locale,
        segment,
        overall_stars: overallStars,
        recommend_score: recommendScore,
        booking_communication_stars: bookingCommunicationStars,
        staff_service_stars: staffServiceStars,
        space_cleanliness_stars: spaceCleanlinessStars,
        improve_one_thing: improveOneThing || null,
      },
    });

    return NextResponse.json({ id: data.id, segment: data.segment });
  } catch (e) {
    console.error("POST /api/wl/review error:", e);
    return jsonError("Internal server error", 500);
  }
}

const PATCH_ALLOWED_FIELDS = new Set([
  "testimonial_ok",
  "testimonial_name",
  "testimonial_company",
  "low_satisfaction_details",
  "follow_up_ok",
  "follow_up_name",
  "follow_up_contact",
  "ambience_vibe_stars",
  "tech_equipment_stars",
  "flow_on_the_day_stars",
  "value_for_money_stars",
  "best_part",
]);

export async function PATCH(request) {
  try {
    const body = await request.json();
    const id = body?.id;
    if (!id || typeof id !== "string") {
      return jsonError("id is required", 400);
    }

    const updates = {};
    for (const [key, value] of Object.entries(body || {})) {
      if (key === "id") continue;
      if (!PATCH_ALLOWED_FIELDS.has(key)) continue;

      if (key.endsWith("_stars")) {
        const n = asInt(value);
        if (n === null) {
          updates[key] = null;
        } else if (!inRange(n, 1, 5)) {
          return jsonError(`${key} must be 1–5 or null`, 400);
        } else {
          updates[key] = n;
        }
        continue;
      }

      if (key.endsWith("_ok")) {
        if (value === null || value === undefined) {
          updates[key] = null;
        } else {
          updates[key] = Boolean(value);
        }
        continue;
      }

      if (typeof value === "string") {
        updates[key] = value.trim().slice(0, 2000) || null;
      } else if (value === null || value === undefined) {
        updates[key] = null;
      } else {
        return jsonError(`${key} must be a string or null`, 400);
      }
    }

    if (Object.keys(updates).length === 0) {
      return jsonError("No valid fields to update", 400);
    }

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("whitelotus_event_feedback")
      .update(updates)
      .eq("id", id)
      .select(
        [
          "id",
          "locale",
          "segment",
          "overall_stars",
          "recommend_score",
          "booking_communication_stars",
          "staff_service_stars",
          "space_cleanliness_stars",
          "improve_one_thing",
          "low_satisfaction_details",
          "follow_up_name",
          "follow_up_contact",
          "ambience_vibe_stars",
          "tech_equipment_stars",
          "flow_on_the_day_stars",
          "value_for_money_stars",
          "best_part",
        ].join(",")
      )
      .single();

    if (error) {
      console.error("Feedback update failed:", error);
      return jsonError("Failed to update feedback", 500, error.message);
    }

    // Best-effort notification email on updates that add optional details.
    void sendReviewEmail({ request, kind: "updated", review: data });

    return NextResponse.json({ id: data.id, success: true });
  } catch (e) {
    console.error("PATCH /api/wl/review error:", e);
    return jsonError("Internal server error", 500);
  }
}

