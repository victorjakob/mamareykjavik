import { createServerSupabase } from "@/util/supabase/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// Optional free-text fields: an empty box in the admin form is stored as null.
const optional = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

// The Details table, as edited in the admin. Blank rows are dropped and the
// list is capped so a bad payload can't bloat the row.
// Video URLs, in display order, as edited in the admin.
const videoList = (value) => {
  if (!Array.isArray(value)) return null;
  const urls = value
    .filter((url) => typeof url === "string" && url.trim())
    .map((url) => url.trim().slice(0, 1000))
    .slice(0, 6);
  return urls.length > 0 ? urls : null;
};

const detailRows = (value) => {
  if (!Array.isArray(value)) return null;
  const rows = value
    .filter((row) => row && typeof row === "object")
    .map((row) => ({
      label: String(row.label ?? "").trim().slice(0, 80),
      value: String(row.value ?? "").trim().slice(0, 500),
    }))
    .filter((row) => row.label || row.value)
    .slice(0, 30);
  return rows.length > 0 ? rows : null;
};

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabase();
    const data = await request.json();
    const {
      id,
      name,
      description,
      price,
      stock,
      category_id,
      order,
      image,
      images,
      videos,
      details,
    } = data;
    let mainImageUrl = image;
    let extraImageUrls = images || [];

    // Handle main image upload if base64
    if (mainImageUrl && mainImageUrl.startsWith("data:")) {
      const base64Data = mainImageUrl.split(",")[1];
      const imageBlob = Buffer.from(base64Data, "base64");
      const fileName = `${Date.now()}_main.${data.extension || "webp"}`;
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
      mainImageUrl = publicUrl;
    }

    // Handle extra images upload if base64
    const processedExtraImages = [];
    for (let i = 0; i < extraImageUrls.length; i++) {
      const img = extraImageUrls[i];
      if (img && img.startsWith && img.startsWith("data:")) {
        const base64Data = img.split(",")[1];
        const imageBlob = Buffer.from(base64Data, "base64");
        const fileName = `${Date.now()}_${i}.${data.extension || "webp"}`;
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
        processedExtraImages.push(publicUrl);
      } else {
        processedExtraImages.push(img);
      }
    }

    // Update product in database
    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id: parseInt(category_id),
        image: mainImageUrl,
        order: parseInt(order),
        images: processedExtraImages,
        videos: videoList(videos),
        details: detailRows(details),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    );
  }
}
