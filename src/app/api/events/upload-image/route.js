import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ message: "No file provided" }), {
        status: 400,
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}_${file.name
      .replace(/[^a-z0-9._-]/g, "_")
      .toLowerCase()}`;

    const { data, error } = await supabaseAdmin.storage
      .from("event-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("event-images").getPublicUrl(data.path);

    return new Response(JSON.stringify({ url: publicUrl }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Failed to upload image: ${error.message}` }),
      { status: 500 }
    );
  }
}
