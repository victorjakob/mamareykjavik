// PATCH /api/private-session/admin/practitioners/[id] — update fields
// DELETE                                              — soft archive (is_active=false)

import { NextResponse } from "next/server";
import { requireAdminAndSupabase } from "../../_lib/auth";
import {
  isValidSlug,
  pickString,
  pickPositiveInt,
  pickBool,
} from "@/app/private-session/_lib/admin-validation";

export async function PATCH(request, ctx) {
  const gate = await requireAdminAndSupabase();
  if (!gate.ok) return gate.res;

  const { id } = await ctx.params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const patch = {};
  if ("slug" in body) {
    if (!isValidSlug(body.slug)) {
      return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
    }
    patch.slug = body.slug;
  }
  if ("name" in body) {
    const n = pickString(body.name, 120);
    if (!n) return NextResponse.json({ error: "name_required" }, { status: 400 });
    patch.name = n;
  }
  for (const k of [
    "country_of_origin",
    "bio_md",
    "photo_url",
    "residency_start",
    "residency_end",
    "meta_seo_title",
    "meta_seo_description",
    "notification_email",
    "language",
  ]) {
    if (k in body) patch[k] = pickString(body[k], k === "bio_md" ? 8000 : 600);
  }
  if ("is_active" in body) {
    const v = pickBool(body.is_active);
    if (v !== null) patch.is_active = v;
  }
  if ("display_order" in body) {
    patch.display_order = pickPositiveInt(body.display_order, 0);
  }

  const { error } = await gate.supabase
    .from("private_session_practitioners")
    .update(patch)
    .eq("id", id);
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    }
    console.error("[admin] patch practitioner failed", error);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, ctx) {
  const gate = await requireAdminAndSupabase();
  if (!gate.ok) return gate.res;

  const { id } = await ctx.params;
  const { error } = await gate.supabase
    .from("private_session_practitioners")
    .update({ is_active: false })
    .eq("id", id);
  if (error) {
    console.error("[admin] archive practitioner failed", error);
    return NextResponse.json({ error: "archive_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
