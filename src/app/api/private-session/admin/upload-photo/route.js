// POST /api/private-session/admin/upload-photo
//
// Admin-only multipart upload. Writes the image to the
// `private-session-photos` Supabase storage bucket (public) and returns the
// permanent public URL the practitioner form can drop straight into the
// photo_url column.
//
// Bucket lives at supabase.storage("private-session-photos") and is capped
// to 10 MB / image-only MIME types at the storage layer (see the bucket
// creation SQL in database-migrations/). We re-validate here so the user
// sees a clean error in the browser instead of a Supabase storage error.

import { NextResponse } from "next/server";
import { requireAdminAndSupabase } from "../_lib/auth";

const BUCKET = "private-session-photos";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function safeName(name) {
  const base = (name || "photo")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base.slice(0, 80) || "photo";
}

export async function POST(request) {
  const gate = await requireAdminAndSupabase();
  if (!gate.ok) return gate.res;

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "bad_form_data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "file_too_large", limit_bytes: MAX_BYTES },
      { status: 413 }
    );
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "unsupported_type", got: file.type },
      { status: 415 }
    );
  }

  // Optional practitioner slug used as the folder prefix — helps Mama
  // find a specific practitioner's photos in the bucket later.
  const slug = String(formData.get("slug") || "").replace(/[^a-z0-9-]/g, "");
  const folder = slug ? `${slug}/` : "";
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${folder}${ts}-${rand}-${safeName(file.name)}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await gate.supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    console.error("[private-session/upload-photo] upload failed", error);
    return NextResponse.json({ error: "upload_failed", message: error.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = gate.supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return NextResponse.json({ ok: true, url: publicUrl, path: data.path });
}
