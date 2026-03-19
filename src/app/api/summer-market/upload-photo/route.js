import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";

const BUCKET_NAME = "summer-market-applications";
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB - Supabase bucket limit

export async function POST(request) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo");

    if (!photo || !(photo instanceof File) || photo.size === 0) {
      return NextResponse.json(
        { error: "No photo provided." },
        { status: 400 }
      );
    }

    if (photo.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Photo is too large. Please choose a smaller image." },
        { status: 413 }
      );
    }

    const supabase = createServerSupabase();
    const ext = (photo.name.split(".").pop() || "jpg").toLowerCase();
    const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await photo.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: photo.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.warn("Summer market photo upload failed:", uploadError.message);
      return NextResponse.json(
        { error: "Failed to upload photo." },
        { status: 500 }
      );
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicData.publicUrl });
  } catch (error) {
    console.error("Summer market upload-photo error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo." },
      { status: 500 }
    );
  }
}
