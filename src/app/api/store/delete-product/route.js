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
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing product id" },
        { status: 400 }
      );
    }

    // Get the product to find the image URLs
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("image, images")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    // Collect all image URLs (main + extra)
    const allImages = [product?.image]
      .concat(product?.images || [])
      .filter(Boolean);

    // Delete all images from storage if they are Supabase Storage URLs
    for (const imgUrl of allImages) {
      if (
        imgUrl &&
        imgUrl.includes("supabase.co/storage/v1/object/public/Store/")
      ) {
        const path = imgUrl.split("/Store/")[1];
        if (path) {
          const { error: storageError } = await supabase.storage
            .from("Store")
            .remove([path]);
          if (storageError) {
            // Log but don't block deletion
            console.error("Error deleting image from storage:", storageError);
          }
        }
      }
    }

    // Delete the product from the database
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
