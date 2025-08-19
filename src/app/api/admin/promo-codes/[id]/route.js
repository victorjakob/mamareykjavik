import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/admin/promo-codes/[id]
 * Get a specific promo code (admin only)
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin or host
    if (
      !session?.user?.role ||
      (session.user.role !== "admin" && session.user.role !== "host")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get promo code with usage statistics
    const supabaseClient = createServerSupabase();
    const { data: promoCode, error } = await supabaseClient
      .from("event_promo_codes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !promoCode) {
      return NextResponse.json(
        { error: "Promo code not found" },
        { status: 404 }
      );
    }

    // Get usage statistics
    const { count: totalUsage } = await supabaseClient
      .from("event_promo_redemptions")
      .select("*", { count: "exact", head: true })
      .eq("promo_id", id)
      .eq("status", "APPLIED");

    const { count: recentUsage } = await supabaseClient
      .from("event_promo_redemptions")
      .select("*", { count: "exact", head: true })
      .eq("promo_id", id)
      .eq("status", "APPLIED")
      .gte(
        "redeemed_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ); // Last 30 days

    return NextResponse.json({
      promoCode: {
        ...promoCode,
        usage: {
          total: totalUsage || 0,
          recent: recentUsage || 0,
        },
      },
    });
  } catch (error) {
    console.error("Admin get promo code API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/promo-codes/[id]
 * Update a promo code (admin only)
 */
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin or host
    if (
      !session?.user?.role ||
      (session.user.role !== "admin" && session.user.role !== "host")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const updateData = await request.json();

    // Initialize Supabase client
    const supabaseClient = createServerSupabase();

    // Remove fields that shouldn't be updated
    const { id: _, created_at, created_by, ...allowedUpdates } = updateData;

    // Validate promo code type if provided
    if (
      allowedUpdates.type &&
      !["PERCENT", "AMOUNT"].includes(allowedUpdates.type)
    ) {
      return NextResponse.json(
        { error: "Invalid promo code type. Must be PERCENT or AMOUNT" },
        { status: 400 }
      );
    }

    // Validate value if provided
    if (
      allowedUpdates.type === "PERCENT" &&
      allowedUpdates.value !== undefined
    ) {
      if (allowedUpdates.value <= 0 || allowedUpdates.value > 100) {
        return NextResponse.json(
          { error: "Percentage value must be between 1 and 100" },
          { status: 400 }
        );
      }
    }

    if (
      allowedUpdates.type === "AMOUNT" &&
      allowedUpdates.value !== undefined
    ) {
      if (allowedUpdates.value <= 0) {
        return NextResponse.json(
          { error: "Amount value must be greater than 0" },
          { status: 400 }
        );
      }
    }

    // Check if code already exists (if updating code)
    if (allowedUpdates.code) {
      const { data: existingCode } = await supabaseClient
        .from("event_promo_codes")
        .select("id")
        .eq("code", allowedUpdates.code.toUpperCase())
        .neq("id", id)
        .single();

      if (existingCode) {
        return NextResponse.json(
          { error: "Promo code already exists" },
          { status: 400 }
        );
      }

      // Normalize code to uppercase
      allowedUpdates.code = allowedUpdates.code.toUpperCase();
    }

    // For hosts, ensure they can only update promo codes for their events
    if (session.user.role === "host") {
      // Get events that belong to this host
      const { data: hostEvents } = await supabaseClient
        .from("events")
        .select("id")
        .eq("host", session.user.email);

      const hostEventIds =
        hostEvents?.map((event) => event.id.toString()) || [];

      if (
        allowedUpdates.applicable_event_ids &&
        allowedUpdates.applicable_event_ids.length > 0
      ) {
        // Check if selected events belong to host
        const unauthorizedEvents = allowedUpdates.applicable_event_ids.filter(
          (id) => !hostEventIds.includes(id)
        );

        if (unauthorizedEvents.length > 0) {
          return NextResponse.json(
            { error: "You can only update promo codes for your own events" },
            { status: 403 }
          );
        }
      } else {
        // If no specific events selected (meaning "all events"),
        // set it to only the host's events
        allowedUpdates.applicable_event_ids = hostEventIds;
      }
    }

    // Update promo code
    const { data: updatedPromoCode, error } = await supabaseClient
      .from("event_promo_codes")
      .update(allowedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating promo code:", error);
      return NextResponse.json(
        { error: "Failed to update promo code" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      promoCode: updatedPromoCode,
      message: "Promo code updated successfully",
    });
  } catch (error) {
    console.error("Admin update promo code API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/promo-codes/[id]
 * Delete a promo code (admin only)
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin or host
    if (
      !session?.user?.role ||
      (session.user.role !== "admin" && session.user.role !== "host")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if promo code exists
    const supabaseClient = createServerSupabase();
    const { data: promoCode } = await supabaseClient
      .from("event_promo_codes")
      .select("id, applicable_event_ids")
      .eq("id", id)
      .single();

    if (!promoCode) {
      return NextResponse.json(
        { error: "Promo code not found" },
        { status: 404 }
      );
    }

    // For hosts, ensure they can only delete promo codes for their events
    if (
      session.user.role === "host" &&
      promoCode.applicable_event_ids &&
      promoCode.applicable_event_ids.length > 0
    ) {
      // Get events that belong to this host
      const { data: hostEvents } = await supabaseClient
        .from("events")
        .select("id")
        .eq("host", session.user.email);

      const hostEventIds =
        hostEvents?.map((event) => event.id.toString()) || [];
      const unauthorizedEvents = promoCode.applicable_event_ids.filter(
        (id) => !hostEventIds.includes(id)
      );

      if (unauthorizedEvents.length > 0) {
        return NextResponse.json(
          { error: "You can only delete promo codes for your own events" },
          { status: 403 }
        );
      }
    }

    // Check if promo code has been used
    const { count: usageCount } = await supabaseClient
      .from("event_promo_redemptions")
      .select("*", { count: "exact", head: true })
      .eq("promo_id", id);

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete promo code that has been used. Consider deactivating it instead.",
        },
        { status: 400 }
      );
    }

    // Delete promo code
    const { error } = await supabaseClient
      .from("event_promo_codes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting promo code:", error);
      return NextResponse.json(
        { error: "Failed to delete promo code" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Promo code deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete promo code API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
