// Server-only fetchers for /private-session/admin/*.
// All reads use the service-role client. Callers are admin-gated by the
// layout (notFound() for non-admins).

import "server-only";
import { createServerSupabase } from "@/util/supabase/server";

// ── Practitioners ───────────────────────────────────────────────────────────
export async function listPractitioners() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("private_session_practitioners")
    .select("*")
    .order("is_active", { ascending: false })
    .order("display_order", { ascending: true })
    .order("residency_start", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("[admin] listPractitioners failed", error);
    return [];
  }
  return data || [];
}

export async function getPractitioner(id) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("private_session_practitioners")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[admin] getPractitioner failed", error);
    return null;
  }
  return data;
}

// ── Offerings ───────────────────────────────────────────────────────────────
export async function listOfferings(practitionerId) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("private_session_offerings")
    .select("*")
    .eq("practitioner_id", practitionerId)
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[admin] listOfferings failed", error);
    return [];
  }
  return data || [];
}

// ── Slots ───────────────────────────────────────────────────────────────────
export async function listSlots(practitionerId) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("private_session_slots")
    .select(`
      *,
      private_session_slot_offerings ( offering_id ),
      private_session_bookings ( id, client_name, status )
    `)
    .eq("practitioner_id", practitionerId)
    .order("starts_at", { ascending: true });
  if (error) {
    console.error("[admin] listSlots failed", error);
    return [];
  }
  return (data || []).map((s) => ({
    ...s,
    offering_ids: (s.private_session_slot_offerings || []).map((x) => x.offering_id),
    booking: (s.private_session_bookings || []).find((b) => b.status !== "cancelled") || null,
  }));
}

// ── Bookings ────────────────────────────────────────────────────────────────
const BOOKING_SELECT = `
  *,
  private_session_slots ( id, starts_at, ends_at, actual_location, published_area, practitioner_id ),
  private_session_offerings ( id, title, modality, duration_minutes )
`;

export async function getBooking(id) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("private_session_bookings")
    .select(BOOKING_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[admin] getBooking failed", error);
    return null;
  }
  if (!data) return null;

  // Pull the practitioner separately to avoid a 3-deep nested join.
  if (data.private_session_slots?.practitioner_id) {
    const { data: practitioner } = await supabase
      .from("private_session_practitioners")
      .select("id, name, slug")
      .eq("id", data.private_session_slots.practitioner_id)
      .maybeSingle();
    data.practitioner = practitioner;
  }
  return data;
}

// Bookings in a date window — used by Today/Upcoming and Locations needed.
export async function listBookingsInRange({ fromIso, toIso, includeCancelled = false }) {
  const supabase = createServerSupabase();
  let query = supabase
    .from("private_session_bookings")
    .select(BOOKING_SELECT)
    .order("created_at", { ascending: false });

  if (!includeCancelled) query = query.neq("status", "cancelled");

  const { data, error } = await query;
  if (error) {
    console.error("[admin] listBookingsInRange failed", error);
    return [];
  }
  const rows = data || [];
  const within = rows.filter((b) => {
    const startIso = b.private_session_slots?.starts_at;
    if (!startIso) return false;
    return startIso >= fromIso && startIso <= toIso;
  });
  // Attach practitioner name in one batch.
  const practitionerIds = Array.from(
    new Set(within.map((b) => b.private_session_slots?.practitioner_id).filter(Boolean))
  );
  if (practitionerIds.length > 0) {
    const { data: practitioners } = await supabase
      .from("private_session_practitioners")
      .select("id, name, slug")
      .in("id", practitionerIds);
    const map = new Map((practitioners || []).map((p) => [p.id, p]));
    for (const b of within) {
      b.practitioner = map.get(b.private_session_slots?.practitioner_id) || null;
    }
  }
  return within;
}

// Locations-needed strip — next 7 days, confirmed, no actual_location.
export async function listBookingsNeedingLocation() {
  const nowIso = new Date().toISOString();
  const in7Iso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const all = await listBookingsInRange({ fromIso: nowIso, toIso: in7Iso });
  return all.filter(
    (b) =>
      b.status === "confirmed" &&
      !b.private_session_slots?.actual_location
  );
}

export async function listTodayBookings() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return listBookingsInRange({
    fromIso: start.toISOString(),
    toIso: end.toISOString(),
  });
}

export async function listUpcomingBookings(days = 14) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  end.setHours(23, 59, 59, 999);
  return listBookingsInRange({
    fromIso: start.toISOString(),
    toIso: end.toISOString(),
  });
}

// ── Waitlist ────────────────────────────────────────────────────────────────
export async function listWaitlist(practitionerId) {
  const supabase = createServerSupabase();
  const offerings = await listOfferings(practitionerId);
  const offeringIds = offerings.map((o) => o.id);
  if (offeringIds.length === 0) return { offerings: [], byOffering: new Map() };

  const { data, error } = await supabase
    .from("private_session_waitlist")
    .select("*")
    .in("offering_id", offeringIds)
    .neq("status", "removed")
    .order("offering_id", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[admin] listWaitlist failed", error);
    return { offerings, byOffering: new Map() };
  }

  const byOffering = new Map();
  for (const o of offerings) byOffering.set(o.id, []);
  const positions = new Map();
  for (const w of data || []) {
    if (w.status === "waiting") {
      const next = (positions.get(w.offering_id) || 0) + 1;
      positions.set(w.offering_id, next);
      byOffering.get(w.offering_id)?.push({ ...w, position: next });
    } else {
      byOffering.get(w.offering_id)?.push({ ...w, position: null });
    }
  }
  return { offerings, byOffering };
}
