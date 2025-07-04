import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    // Check authentication if needed
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const data = await request.json();

    // Upload image to Supabase Storage
    if (data.image && data.image.startsWith("data:")) {
      const base64Data = data.image.split(",")[1];
      const imageBlob = Buffer.from(base64Data, "base64");

      const fileName = `${Date.now()}.${data.extension || "webp"}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("Store")
        .upload(filePath, imageBlob, {
          contentType: data.extension === "png" ? "image/png" : "image/webp",
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("Store").getPublicUrl(filePath);

      data.image = publicUrl;
    }

    // Upload extra images to Supabase Storage and collect URLs
    if (Array.isArray(data.images)) {
      const uploadedUrls = [];
      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        if (img && img.startsWith("data:")) {
          const base64Data = img.split(",")[1];
          const imageBlob = Buffer.from(base64Data, "base64");
          const fileName = `${Date.now()}_${i}.${data.extension || "webp"}`;
          const filePath = `products/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from("Store")
            .upload(filePath, imageBlob, {
              contentType:
                data.extension === "png" ? "image/png" : "image/webp",
            });
          if (uploadError) throw uploadError;
          const {
            data: { publicUrl },
          } = supabase.storage.from("Store").getPublicUrl(filePath);
          uploadedUrls.push(publicUrl);
        }
      }
      data.images = uploadedUrls;
    }

    // Insert product into database
    const { error } = await supabase.from("products").insert([
      {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        category_id: parseInt(data.category_id),
        image: data.image,
        order: parseInt(data.order),
        slug: data.slug,
        images: data.images,
      },
    ]);

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
