import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/admin/promo-codes
 * Get all promo codes (admin only)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin or host
    if (
      !session?.user?.role ||
      (session.user.role !== "admin" && session.user.role !== "host")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const offset = (page - 1) * limit;

    // Get promo codes with pagination
    const supabaseClient = createServerSupabase();
    const {
      data: promoCodes,
      error,
      count,
    } = await supabaseClient
      .from("event_promo_codes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching promo codes:", error);
      return NextResponse.json(
        { error: "Failed to fetch promo codes" },
        { status: 500 }
      );
    }

    // Get usage statistics for each promo code
    const promoCodesWithUsage = await Promise.all(
      promoCodes.map(async (promoCode) => {
        const { count: usageCount } = await supabaseClient
          .from("event_promo_redemptions")
          .select("*", { count: "exact", head: true })
          .eq("promo_id", promoCode.id)
          .eq("status", "APPLIED");

        return {
          ...promoCode,
          usage: {
            total: usageCount || 0,
          },
        };
      })
    );

    return NextResponse.json({
      promoCodes: promoCodesWithUsage,
      user: {
        email: session.user.email,
        role: session.user.role,
      },
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Admin promo codes API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/promo-codes
 * Create a new promo code (admin only)
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin or host
    if (
      !session?.user?.role ||
      (session.user.role !== "admin" && session.user.role !== "host")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      code,
      type,
      value,
      max_uses,
      per_user_limit = 1,
      start_at,
      end_at,
      min_cart_total = 0,
      applicable_event_ids,
      is_active = true,
    } = await request.json();

    // Validate required fields
    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: code, type, value" },
        { status: 400 }
      );
    }

    // Validate promo code type
    if (!["PERCENT", "AMOUNT"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid promo code type. Must be PERCENT or AMOUNT" },
        { status: 400 }
      );
    }

    // Validate value
    if (type === "PERCENT" && (value <= 0 || value > 100)) {
      return NextResponse.json(
        { error: "Percentage value must be between 1 and 100" },
        { status: 400 }
      );
    }

    if (type === "AMOUNT" && value <= 0) {
      return NextResponse.json(
        { error: "Amount value must be greater than 0" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const supabaseClient = createServerSupabase();
    const { data: existingCode } = await supabaseClient
      .from("event_promo_codes")
      .select("id")
      .eq("code", code.toUpperCase())
      .single();

    if (existingCode) {
      return NextResponse.json(
        { error: "Promo code already exists" },
        { status: 400 }
      );
    }

    // For hosts, ensure they can only create promo codes for their events
    let finalApplicableEventIds = applicable_event_ids;

    if (session.user.role === "host") {
      // Get events that belong to this host
      const { data: hostEvents } = await supabaseClient
        .from("events")
        .select("id")
        .eq("host", session.user.email);

      const hostEventIds =
        hostEvents?.map((event) => event.id.toString()) || [];

      if (finalApplicableEventIds && finalApplicableEventIds.length > 0) {
        // Check if selected events belong to host
        const unauthorizedEvents = finalApplicableEventIds.filter(
          (id) => !hostEventIds.includes(id)
        );

        if (unauthorizedEvents.length > 0) {
          return NextResponse.json(
            { error: "You can only create promo codes for your own events" },
            { status: 403 }
          );
        }
      } else {
        // If no specific events selected (meaning "all events"),
        // set it to only the host's events
        finalApplicableEventIds = hostEventIds;
      }
    }

    // Create promo code
    const { data: newPromoCode, error } = await supabaseClient
      .from("event_promo_codes")
      .insert({
        code: code.toUpperCase(),
        type,
        value,
        max_uses,
        per_user_limit,
        start_at: start_at || new Date().toISOString(),
        end_at: end_at || null, // Convert empty string to null
        min_cart_total,
        applicable_event_ids: finalApplicableEventIds,
        is_active,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating promo code:", error);
      return NextResponse.json(
        { error: "Failed to create promo code" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      promoCode: newPromoCode,
      message: "Promo code created successfully",
    });
  } catch (error) {
    console.error("Admin create promo code API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
