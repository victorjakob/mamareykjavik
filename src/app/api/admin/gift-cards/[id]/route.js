import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Gift card ID is required" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Prepare update data
    const updateData = {};

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.picked_up !== undefined) {
      updateData.picked_up = body.picked_up;
      if (body.picked_up) {
        updateData.picked_up_at = new Date().toISOString();
      }
    }

    if (body.sent_at !== undefined) {
      updateData.sent_at = body.sent_at;
    }

    if (body.dineout_code !== undefined) {
      updateData.dineout_code = body.dineout_code;
    }

    // Update gift card
    const { data: updatedCard, error: updateError } = await supabase
      .from("gift_cards")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ card: updatedCard });
  } catch (error) {
    console.error("Error updating gift card:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update gift card" },
      { status: 500 }
    );
  }
}

