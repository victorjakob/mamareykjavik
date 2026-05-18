// Server-only Supabase fetchers for the /private-session feature.
// All reads go through the service-role server client; auth on writes happens
// in the API routes that import this module.
//
// Module-boundary rule (see prompt): every table referenced here is prefixed
// `private_session_`. No cross-feature reads. Stay strict.

import "server-only";
import { createServerSupabase } from "@/util/supabase/server";

const PRACTITIONER_COLUMNS = `
  id, slug, name, country_of_origin, bio_md, photo_url,
  residency_start, residency_end, is_active, display_order,
  meta_seo_title, meta_seo_description, language
`;

const OFFERING_COLUMNS = `
  id, practitioner_id, title, description_md, modality,
  duration_minutes, price_isk, is_active, display_order
`;

// ── List all active practitioners for the index page ────────────────────────
export async function listActivePractitioners() {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("private_session_practitioners")
    .select(`
      ${PRACTITIONER_COLUMNS},
      private_session_offerings (
        id, title, modality, duration_minutes, is_active, display_order
      )
    `)
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("residency_start", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[private-session] listActivePractitioners failed", error);
    return [];
  }

  // Hide inactive offerings client-side; the join already filtered nothing.
  return (data || []).map((p) => ({
    ...p,
    offerings: (p.private_session_offerings || [])
      .filter((o) => o.is_active)
      .sort((a, b) => a.display_order - b.display_order),
  }));
}

// ── Practitioner detail page ────────────────────────────────────────────────
// Returns the practitioner row + their active offerings + their next-2-weeks
// available slots with the offerings bookable in each.
export async function getPractitionerBySlug(slug) {
  const supabase = createServerSupabase();

  const { data: practitioner, error } = await supabase
    .from("private_session_practitioners")
    .select(PRACTITIONER_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("[private-session] getPractitionerBySlug failed", error);
    return null;
  }
  if (!practitioner) return null;

  const [offeringsRes, slotsRes] = await Promise.all([
    supabase
      .from("private_session_offerings")
      .select(OFFERING_COLUMNS)
      .eq("practitioner_id", practitioner.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    fetchAvailableSlotsForPractitioner(supabase, practitioner.id),
  ]);

  const offerings = offeringsRes.data || [];
  const slots = slotsRes;

  // Index slots' bookable offering ids back to offering rows for the picker.
  const offeringById = new Map(offerings.map((o) => [o.id, o]));
  const slotsWithOfferings = slots.map((s) => ({
    id: s.id,
    starts_at: s.starts_at,
    ends_at: s.ends_at,
    status: s.status,
    published_area: s.published_area,
    capacity: s.capacity || 1,
    occupancy: s.occupancy || 0,
    remaining: s.remaining ?? Math.max(0, (s.capacity || 1) - (s.occupancy || 0)),
    offerings: (s.private_session_slot_offerings || [])
      .map((link) => offeringById.get(link.offering_id))
      .filter(Boolean),
  }));

  // Per-offering availability — used to decide whether to show "Join waitlist".
  // A slot here has already been filtered to remaining > 0, so any slot
  // exposing this offering counts as available.
  const offeringHasAvailable = new Set();
  for (const s of slotsWithOfferings) {
    for (const o of s.offerings) offeringHasAvailable.add(o.id);
  }
  const offeringsWithAvailability = offerings.map((o) => ({
    ...o,
    has_available_slot: offeringHasAvailable.has(o.id),
  }));

  return {
    practitioner,
    offerings: offeringsWithAvailability,
    slots: slotsWithOfferings,
  };
}

async function fetchAvailableSlotsForPractitioner(supabase, practitionerId) {
  // Public picker — a slot is "available" when:
  //   1. It still has remaining capacity (non-cancelled booking count < capacity)
  //   2. No fully-booked / completed slot for the same practitioner overlaps
  //      its window (the elders would be busy)
  //
  // Bulk-added schedules are often denser than the session length (hourly
  // grid with 90-min sessions), and slots can hold multiple parallel
  // bookings (e.g. three Mayan elders working at the same time), so we
  // can't trust slot.status alone — we count bookings directly.
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("private_session_slots")
    .select(`
      id, starts_at, ends_at, status, published_area, capacity,
      private_session_slot_offerings ( offering_id ),
      private_session_bookings ( id, status )
    `)
    .eq("practitioner_id", practitionerId)
    .in("status", ["available", "booked", "completed"])
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("[private-session] fetchAvailableSlots failed", error);
    return [];
  }

  const all = (data || []).map((s) => {
    const occupancy = (s.private_session_bookings || []).filter(
      (b) => b.status !== "cancelled"
    ).length;
    const cap = s.capacity || 1;
    return {
      ...s,
      capacity: cap,
      occupancy,
      remaining: Math.max(0, cap - occupancy),
    };
  });

  // Anything with no remaining capacity, or whose admin-managed status is
  // booked/completed, occupies the practitioner's schedule for its window.
  const blocking = all.filter(
    (s) => s.remaining === 0 || s.status === "booked" || s.status === "completed"
  );

  const overlaps = (a, b) => {
    if (a.id === b.id) return false;
    const aStart = new Date(a.starts_at).getTime();
    const aEnd = new Date(a.ends_at).getTime();
    const bStart = new Date(b.starts_at).getTime();
    const bEnd = new Date(b.ends_at).getTime();
    return aStart < bEnd && bStart < aEnd;
  };

  return all
    .filter((s) => s.remaining > 0 && s.status !== "completed")
    .filter((s) => !blocking.some((b) => overlaps(s, b)));
}

// ── Helpers used by the public UI ───────────────────────────────────────────
export function groupSlotsByDate(slots, locale = "en") {
  const dtfDate = new Intl.DateTimeFormat(locale === "is" ? "is-IS" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const groups = new Map();
  for (const s of slots) {
    const start = new Date(s.starts_at);
    const key = start.toISOString().slice(0, 10);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: dtfDate.format(start),
        slots: [],
      });
    }
    groups.get(key).slots.push(s);
  }
  return Array.from(groups.values());
}
