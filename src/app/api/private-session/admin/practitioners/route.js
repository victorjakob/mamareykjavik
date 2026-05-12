// POST /api/private-session/admin/practitioners
// Create a new practitioner.

import { NextResponse } from "next/server";
import { requireAdminAndSupabase } from "../_lib/auth";
import {
  isValidSlug,
  slugify,
  pickString,
  pickPositiveInt,
  pickBool,
} from "@/app/private-session/_lib/admin-validation";

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

  let slug = pickString(body.slug, 80);
  if (slug && !isValidSlug(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  if (!slug) slug = slugify(name);

  const row = {
    slug,
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
    language: pickString(body.language, 5) || "en",
  };

  const { data, error } = await gate.supabase
    .from("private_session_practitioners")
    .insert(row)
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    }
    console.error("[admin] create practitioner failed", error);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
