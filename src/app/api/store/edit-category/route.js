import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const data = await request.json();
    const { id, name, description, order, image } = data;
    let imageUrl = image;

    // Upload image to Supabase Storage if base64
    if (image && image.startsWith("data:")) {
      const base64Data = image.split(",")[1];
      const imageBlob = Buffer.from(base64Data, "base64");
      const fileName = `${Date.now()}.${data.extension || "webp"}`;
      const filePath = `categories/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("Store")
        .upload(filePath, imageBlob, {
          contentType: data.extension === "png" ? "image/png" : "image/webp",
        });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("Store").getPublicUrl(filePath);
      imageUrl = publicUrl;
    }

    // Update category in database
    const { error } = await supabase
      .from("categories")
      .update({
        name,
        description,
        image: imageUrl,
        order: parseInt(order),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
