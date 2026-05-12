// POST /api/private-session/admin/offerings — create offering for a practitioner.

import { NextResponse } from "next/server";
import { requireAdminAndSupabase } from "../_lib/auth";
import {
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

  const practitionerId = pickString(body.practitioner_id, 60);
  const title = pickString(body.title, 200);
  const duration = pickPositiveInt(body.duration_minutes, 0);
  if (!practitionerId || !title || !duration) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const row = {
    practitioner_id: practitionerId,
    title,
    description_md: pickString(body.description_md, 4000),
    modality: pickString(body.modality, 120),
    duration_minutes: duration,
    price_isk: pickPositiveInt(body.price_isk, 0),
    is_active: pickBool(body.is_active) ?? true,
    display_order: pickPositiveInt(body.display_order, 0),
  };

  const { data, error } = await gate.supabase
    .from("private_session_offerings")
    .insert(row)
    .select("id")
    .single();
  if (error) {
    console.error("[admin] create offering failed", error);
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: data.id });
}
