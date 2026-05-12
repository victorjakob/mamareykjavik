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
    offerings: (s.private_session_slot_offerings || [])
      .map((link) => offeringById.get(link.offering_id))
      .filter(Boolean),
  }));

  // Per-offering availability — used to decide whether to show "Join waitlist".
  const offeringHasAvailable = new Set();
  for (const s of slotsWithOfferings) {
    if (s.status !== "available") continue;
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
  const nowIso = new Date().toISOString();
  const twoWeeksIso = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("private_session_slots")
    .select(`
      id, starts_at, ends_at, status, published_area,
      private_session_slot_offerings ( offering_id )
    `)
    .eq("practitioner_id", practitionerId)
    .eq("status", "available")
    .gte("starts_at", nowIso)
    .lte("starts_at", twoWeeksIso)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("[private-session] fetchAvailableSlots failed", error);
    return [];
  }
  return data || [];
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
