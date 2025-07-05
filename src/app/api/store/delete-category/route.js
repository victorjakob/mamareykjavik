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
        { error: "Missing category id" },
        { status: 400 }
      );
    }

    // Get the category to find the image URL
    const { data: category, error: fetchError } = await supabase
      .from("categories")
      .select("image")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    // Delete the image from storage if it exists and is a Supabase Storage URL
    if (
      category?.image &&
      category.image.includes("supabase.co/storage/v1/object/public/Store/")
    ) {
      // Extract the path after /Store/
      const path = category.image.split("/Store/")[1];
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

    // Delete the category from the database
    const { error: deleteError } = await supabase
      .from("categories")
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
