// POST /api/private-session/book
//
// Body shapes:
//   { mode: "book",
//     slot_id, offering_id,
//     client_name, client_email,
//     client_phone?, client_note?, language? }
//   { mode: "waitlist",
//     offering_id,
//     client_name, client_email,
//     client_phone?, client_note?, language? }
//
// Booking flow:
//   1. Validate the body and re-fetch the slot.
//   2. Verify slot.status === "available" and the offering is one of the
//      slot's bookable offerings (private_session_slot_offerings).
//   3. Insert private_session_bookings (PSESS-... reference). The slot_id
//      column has a UNIQUE constraint, so a race where two clients try the
//      same slot will result in one 23505 error → we return 409.
//   4. Flip slot.status -> "booked".
//   5. Fire confirmation + Mama-notification emails (best-effort).
//   6. Return { ok, reference_id, booking_id, redirect }.
//
// Waitlist flow:
//   1. Validate body.
//   2. Insert private_session_waitlist.
//   3. Fire confirmation + Mama-notification emails (best-effort).
//   4. Return { ok }.
//
// Email failures DO NOT roll back the row — once the slot is booked it stays
// booked. The error is logged. We still stamp confirmation_email_sent_at if
// the customer email succeeded so the audit trail reflects reality.

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";
import {
  makeReferenceId,
  pickString,
} from "@/app/private-session/_lib/admin-validation";

const FROM = "Mama Reykjavik <team@mama.is>";
// Global team addresses — both get every booking/waitlist notification.
// Per-practitioner notification_email is added on top when set.
const ADMIN_EMAIL =
  process.env.PRIVATE_SESSION_ADMIN_EMAIL || "mama.reykjavik@gmail.com";
const TEAM_CC = "team@whitelotus.is";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://mama.is";

// Build the deduped recipient list for an admin notification.
// Returns an array suitable for Resend's `to` field.
function adminRecipients(practitionerNotificationEmail) {
  const list = [ADMIN_EMAIL, TEAM_CC];
  const extra = (practitionerNotificationEmail || "").trim();
  if (extra) list.push(extra);
  const seen = new Set();
  return list
    .map((e) => e.trim())
    .filter((e) => {
      if (!e) return false;
      const lower = e.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
}

function publicBookingUrl(bookingId) {
  return `${BASE_URL}/private-session/admin/bookings/${bookingId}`;
}

function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Booking ─────────────────────────────────────────────────────────────────
async function handleBooking(supabase, body) {
  const slotId = pickString(body.slot_id, 60);
  const offeringId = pickString(body.offering_id, 60);
  const clientName = pickString(body.client_name, 120);
  const clientEmail = pickString(body.client_email, 200);
  const clientPhone = pickString(body.client_phone, 40);
  const clientNote = pickString(body.client_note, 2000);
  const language = pickString(body.language, 5) || "en";

  if (!slotId || !offeringId || !clientName || !clientEmail) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // Re-fetch the slot + verify offering link + practitioner.
  const { data: slot, error: slotErr } = await supabase
    .from("private_session_slots")
    .select(`
      id, status, starts_at, ends_at, practitioner_id, published_area, capacity,
      private_session_slot_offerings ( offering_id )
    `)
    .eq("id", slotId)
    .maybeSingle();

  if (slotErr || !slot) {
    return NextResponse.json({ error: "slot_not_found" }, { status: 404 });
  }
  // A slot is bookable when its occupancy (count of non-cancelled bookings)
  // is strictly less than its capacity. status mirrors this but we don't
  // trust status alone — it's recomputed below after every insert.
  const { count: occupancy, error: occErr } = await supabase
    .from("private_session_bookings")
    .select("id", { count: "exact", head: true })
    .eq("slot_id", slot.id)
    .neq("status", "cancelled");
  if (occErr) {
    console.error("[private-session/book] occupancy check failed", occErr);
    return NextResponse.json({ error: "occupancy_check_failed" }, { status: 500 });
  }
  const capacity = slot.capacity || 1;
  if ((occupancy || 0) >= capacity) {
    return NextResponse.json({ error: "slot_unavailable", conflict: true }, { status: 409 });
  }

  const slotOfferingIds = (slot.private_session_slot_offerings || []).map((x) => x.offering_id);
  if (!slotOfferingIds.includes(offeringId)) {
    return NextResponse.json({ error: "offering_not_in_slot" }, { status: 400 });
  }

  // Cross-slot overlap guard — reject if any OTHER slot for the same
  // practitioner is fully booked (status='booked') or completed and its
  // window intersects ours. Slots with remaining capacity stay marked
  // 'available' and don't block — they represent practitioners who are
  // still free during the overlap window.
  const { data: overlapRows, error: overlapErr } = await supabase
    .from("private_session_slots")
    .select("id")
    .eq("practitioner_id", slot.practitioner_id)
    .neq("id", slot.id)
    .in("status", ["booked", "completed"])
    .lt("starts_at", slot.ends_at)
    .gt("ends_at", slot.starts_at)
    .limit(1);
  if (overlapErr) {
    console.error("[private-session/book] overlap check failed", overlapErr);
    return NextResponse.json({ error: "overlap_check_failed" }, { status: 500 });
  }
  if ((overlapRows?.length || 0) > 0) {
    return NextResponse.json({ error: "slot_unavailable", conflict: true }, { status: 409 });
  }

  // Fetch the offering + practitioner — used for emails.
  const [offeringRes, practitionerRes] = await Promise.all([
    supabase
      .from("private_session_offerings")
      .select("id, title, duration_minutes, price_isk, modality")
      .eq("id", offeringId)
      .maybeSingle(),
    supabase
      .from("private_session_practitioners")
      .select("id, name, slug, notification_email")
      .eq("id", slot.practitioner_id)
      .maybeSingle(),
  ]);

  if (offeringRes.error || !offeringRes.data) {
    return NextResponse.json({ error: "offering_not_found" }, { status: 404 });
  }
  const offering = offeringRes.data;
  const practitioner = practitionerRes.data;

  // Insert booking. The unique constraint on slot_id is the race-condition
  // guard: if two requests fly at the same slot, exactly one wins.
  const referenceId = makeReferenceId("PSESS");
  const insertRow = {
    reference_id: referenceId,
    slot_id: slotId,
    offering_id: offeringId,
    client_name: clientName,
    client_email: clientEmail.toLowerCase(),
    client_phone: clientPhone,
    client_note: clientNote,
    status: "confirmed",
    language,
  };

  const { data: booking, error: insertErr } = await supabase
    .from("private_session_bookings")
    .insert(insertRow)
    .select("id, reference_id")
    .single();

  if (insertErr) {
    if (insertErr.code === "23505") {
      return NextResponse.json({ error: "slot_unavailable", conflict: true }, { status: 409 });
    }
    console.error("[private-session/book] insert error", insertErr);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  // Recompute slot status — only flip to 'booked' once the slot is full,
  // so partial-capacity slots keep accepting bookings.
  const newOccupancy = (occupancy || 0) + 1;
  if (newOccupancy >= capacity) {
    const { error: slotUpdateErr } = await supabase
      .from("private_session_slots")
      .update({ status: "booked" })
      .eq("id", slotId);
    if (slotUpdateErr) {
      console.error("[private-session/book] slot status update failed", slotUpdateErr);
    }
  }

  // Fire emails — best-effort.
  sendBookingEmails({
    booking,
    slot,
    offering,
    practitioner,
    clientName,
    clientEmail,
    clientPhone,
    clientNote,
    supabase,
  }).catch((e) => console.error("[private-session/book] email error", e));

  return NextResponse.json({
    ok: true,
    reference_id: booking.reference_id,
    booking_id: booking.id,
  });
}

async function sendBookingEmails({
  booking,
  slot,
  offering,
  practitioner,
  clientName,
  clientEmail,
  clientPhone,
  clientNote,
  supabase,
}) {
  const resend = createResend();
  if (!process.env.RESEND_API_KEY) {
    console.warn("[private-session/book] RESEND_API_KEY missing — skipping emails");
    return;
  }

  const practitionerName = practitioner?.name || "Mama";
  const offeringTitle = offering.title;
  const startAt = slot.starts_at;

  const [customer, admin] = await Promise.all([
    renderEmail("private-session-booking-customer", {
      clientName,
      referenceId: booking.reference_id,
      practitionerName,
      offeringTitle,
      durationMinutes: offering.duration_minutes,
      priceIsk: offering.price_isk,
      startAt,
      publishedArea: slot.published_area,
    }),
    renderEmail("private-session-booking-admin", {
      clientName,
      clientEmail,
      clientPhone,
      clientNote,
      referenceId: booking.reference_id,
      practitionerName,
      offeringTitle,
      durationMinutes: offering.duration_minutes,
      priceIsk: offering.price_isk,
      startAt,
      reviewUrl: publicBookingUrl(booking.id),
      needsLocation: true,
    }),
  ]);

  const customerSubject = `Booking confirmed · ${practitionerName} · ${fmtTime(startAt)}`;
  const adminSubject = `[Private session] ${clientName} · ${practitionerName} · ${fmtTime(startAt)}`;

  const sendCustomer = resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: customerSubject,
    html: customer.html,
    text: customer.text,
  });
  const sendAdmin = resend.emails.send({
    from: FROM,
    to: adminRecipients(practitioner?.notification_email),
    subject: adminSubject,
    html: admin.html,
    text: admin.text,
  });

  const [customerRes, adminRes] = await Promise.allSettled([sendCustomer, sendAdmin]);

  if (customerRes.status === "fulfilled") {
    await supabase
      .from("private_session_bookings")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", booking.id)
      .then(() => {})
      .catch((e) => console.error("[private-session/book] stamp confirmation_email_sent_at failed", e));
  } else {
    console.error("[private-session/book] customer email failed", customerRes.reason);
  }
  if (adminRes.status === "rejected") {
    console.error("[private-session/book] admin email failed", adminRes.reason);
  }
}

// ── Waitlist ────────────────────────────────────────────────────────────────
async function handleWaitlist(supabase, body) {
  const offeringId = pickString(body.offering_id, 60);
  const slotId = pickString(body.slot_id, 60); // optional, for pinned waitlist
  const clientName = pickString(body.client_name, 120);
  const clientEmail = pickString(body.client_email, 200);
  const clientPhone = pickString(body.client_phone, 40);
  const clientNote = pickString(body.client_note, 2000);
  const language = pickString(body.language, 5) || "en";

  if (!offeringId || !clientName || !clientEmail) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // Verify the offering exists + pull the practitioner.
  const { data: offering, error: offErr } = await supabase
    .from("private_session_offerings")
    .select("id, title, practitioner_id")
    .eq("id", offeringId)
    .maybeSingle();
  if (offErr || !offering) {
    return NextResponse.json({ error: "offering_not_found" }, { status: 404 });
  }
  const { data: practitioner } = await supabase
    .from("private_session_practitioners")
    .select("id, name, slug, notification_email")
    .eq("id", offering.practitioner_id)
    .maybeSingle();

  const insertRow = {
    offering_id: offeringId,
    slot_id: slotId || null,
    client_name: clientName,
    client_email: clientEmail.toLowerCase(),
    client_phone: clientPhone,
    client_note: clientNote,
    status: "waiting",
    language,
  };

  const { data: waitlist, error: insertErr } = await supabase
    .from("private_session_waitlist")
    .insert(insertRow)
    .select("id")
    .single();
  if (insertErr) {
    console.error("[private-session/book] waitlist insert error", insertErr);
    return NextResponse.json({ error: "insert_failed" }, { status: 500 });
  }

  // Compute position — count of "waiting" rows for this offering, ordered
  // by created_at, including this new row.
  const { count } = await supabase
    .from("private_session_waitlist")
    .select("id", { count: "exact", head: true })
    .eq("offering_id", offeringId)
    .eq("status", "waiting");
  const position = count || null;

  sendWaitlistEmails({
    clientName,
    clientEmail,
    clientPhone,
    clientNote,
    practitionerName: practitioner?.name || "Mama",
    practitionerId: offering.practitioner_id,
    practitionerNotificationEmail: practitioner?.notification_email || null,
    offeringTitle: offering.title,
    position,
  }).catch((e) => console.error("[private-session/book] waitlist email error", e));

  return NextResponse.json({ ok: true, waitlist_id: waitlist.id, position });
}

async function sendWaitlistEmails({
  clientName,
  clientEmail,
  clientPhone,
  clientNote,
  practitionerName,
  practitionerId,
  practitionerNotificationEmail,
  offeringTitle,
  position,
}) {
  const resend = createResend();
  if (!process.env.RESEND_API_KEY) return;

  const [customer, admin] = await Promise.all([
    renderEmail("private-session-waitlist-customer", {
      clientName,
      practitionerName,
      offeringTitle,
      position,
    }),
    renderEmail("private-session-waitlist-admin", {
      clientName,
      clientEmail,
      clientPhone,
      clientNote,
      practitionerName,
      offeringTitle,
      position,
      waitlistUrl: `${BASE_URL}/private-session/admin/practitioners/${practitionerId}/waitlist`,
    }),
  ]);

  await Promise.allSettled([
    resend.emails.send({
      from: FROM,
      to: clientEmail,
      subject: `Waitlist · ${practitionerName} · ${offeringTitle}`,
      html: customer.html,
      text: customer.text,
    }),
    resend.emails.send({
      from: FROM,
      to: adminRecipients(practitionerNotificationEmail),
      subject: `[Private session] Waitlist · ${clientName} · ${offeringTitle}`,
      html: admin.html,
      text: admin.text,
    }),
  ]);
}

// ── Entry ───────────────────────────────────────────────────────────────────
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const supabase = createServerSupabase();
  const mode = body?.mode;
  if (mode === "book") return handleBooking(supabase, body);
  if (mode === "waitlist") return handleWaitlist(supabase, body);
  return NextResponse.json({ error: "unknown_mode" }, { status: 400 });
}
