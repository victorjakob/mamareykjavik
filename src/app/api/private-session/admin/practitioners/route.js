// POST /api/private-session/admin/practitioners
// Create a new practitioner.
//
// Slug policy: the admin form no longer exposes a slug field — it's always
// derived from the name on create. If the derived slug is already taken we
// retry with a random single-digit suffix (e.g. `mama` → `mama-3`) up to a
// handful of times before bailing out. Any slug value posted by the client
// is ignored.

import { NextResponse } from "next/server";
import { requireAdminAndSupabase } from "../_lib/auth";
import {
  slugify,
  pickString,
  pickPositiveInt,
  pickBool,
} from "@/app/private-session/_lib/admin-validation";

// How many random-digit retries to make before giving up on slug uniqueness.
// With base + 9 single-digit candidates this is plenty — collisions are rare.
const SLUG_MAX_ATTEMPTS = 10;

export async function POST(request) {
  const gate = await requireAdminAndSupabase();
  if (!gate.ok) return gate.res;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const name = pickString(body.name, 120);
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });

  const baseSlug = slugify(name);
  if (!baseSlug) {
    return NextResponse.json({ error: "name_unsluggable" }, { status: 400 });
  }

  const baseRow = {
    name,
    country_of_origin: pickString(body.country_of_origin, 80),
    bio_md: pickString(body.bio_md, 8000),
    photo_url: pickString(body.photo_url, 600),
    residency_start: pickString(body.residency_start, 20),
    residency_end: pickString(body.residency_end, 20),
    is_active: pickBool(body.is_active) ?? true,
    display_order: pickPositiveInt(body.display_order, 0),
    meta_seo_title: pickString(body.meta_seo_title, 200),
    meta_seo_description: pickString(body.meta_seo_description, 400),
    notification_email: pickString(body.notification_email, 200),
    language: pickString(body.language, 5) || "en",
  };

  // First attempt with the bare base slug, then `${base}-${randDigit}` retries.
  // Postgres unique-violation = code 23505 on the `slug` unique index.
  let lastError = null;
  for (let attempt = 0; attempt < SLUG_MAX_ATTEMPTS; attempt++) {
    const candidate =
      attempt === 0
        ? baseSlug
        : `${baseSlug}-${Math.floor(Math.random() * 10)}`;
    const { data, error } = await gate.supabase
      .from("private_session_practitioners")
      .insert({ ...baseRow, slug: candidate })
      .select("id, slug")
      .single();
    if (!error) {
      return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
    }
    if (error.code !== "23505") {
      console.error("[admin] create practitioner failed", error);
      return NextResponse.json({ error: "create_failed" }, { status: 500 });
    }
    lastError = error;
  }
  console.error(
    "[admin] create practitioner: exhausted slug retries",
    { baseSlug, lastError },
  );
  return NextResponse.json({ error: "slug_taken" }, { status: 409 });
}
