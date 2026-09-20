import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

/**
 * Hand an admin a one-shot signed URL for uploading a product video straight
 * from the browser to the Store bucket.
 *
 * Images go through /api/store/edit-product as base64 in the JSON body, which
 * is fine at a few hundred KB. Video files are tens of megabytes and would
 * blow past the serverless request body limit, so the file never touches our
 * API: we only mint the upload token here and the browser does the transfer.
 */

const BUCKET = "Store";
const FOLDER = "product-videos";

// Kept deliberately narrow — these are the formats that play in every browser
// without transcoding.
const ALLOWED = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

function slugifyBase(name) {
  return (
    String(name || "video")
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "video"
  );
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType } = await request.json();

    const extension = ALLOWED[contentType];
    if (!extension) {
      return NextResponse.json(
        { error: "Unsupported video type. Use MP4 or WebM (a .mov only plays in Safari)." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const path = `${FOLDER}/${Date.now()}_${slugifyBase(filename)}.${extension}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({
      bucket: BUCKET,
      path: data.path,
      token: data.token,
      publicUrl,
    });
  } catch (error) {
    console.error("video-upload-url error:", error);
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}
