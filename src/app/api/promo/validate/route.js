import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

/**
 * Rate limiting middleware
 */
function checkRateLimit(identifier) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }

  const requests = rateLimitStore.get(identifier);

  // Remove old requests outside the window
  const validRequests = requests.filter((timestamp) => timestamp > windowStart);

  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  // Add current request
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);

  return true;
}

/**
 * Log telemetry for promo code attempts
 */
async function logTelemetry(supabase, data) {
  try {
    await supabase.from("event_promo_redemptions").insert({
      promo_id: data.promoId,
      user_id: data.userId,
      cart_id: data.cartId,
      amount_discounted: data.amountDiscounted || 0,
      status: data.success ? "APPLIED" : "REVERSED",
      redeemed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Telemetry logging failed:", error);
    // Don't fail the main request if telemetry fails
  }
}

/**
 * Validate promo code and return discount details
 */
async function validatePromoCode(
  supabase,
  code,
  eventId,
  cartTotal,
  userId = null
) {
  try {
    // Get promo code details (case-insensitive)
    const { data: promoCode, error: promoError } = await supabase
      .from("event_promo_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    // Additional date validation after fetching
    if (promoCode) {
      const now = new Date();

      // Check if promo code has started
      if (promoCode.start_at && new Date(promoCode.start_at) > now) {
        return {
          success: false,
          error: "This promo code is not yet active",
        };
      }

      // Check if promo code has expired
      if (promoCode.end_at && new Date(promoCode.end_at) < now) {
        return {
          success: false,
          error: "This promo code has expired",
        };
      }
    }

    if (promoError || !promoCode) {
      return {
        success: false,
        error: "Invalid or expired promo code",
      };
    }

    // Check if code applies to this event
    if (
      promoCode.applicable_event_ids &&
      promoCode.applicable_event_ids.length > 0 &&
      !promoCode.applicable_event_ids.includes(eventId.toString())
    ) {
      return {
        success: false,
        error: "This promo code is not valid for this event",
      };
    }

    // Check minimum cart total
    if (cartTotal < promoCode.min_cart_total) {
      return {
        success: false,
        error: `Minimum cart total of ${promoCode.min_cart_total} ISK required`,
      };
    }

    // Check global usage limit
    if (promoCode.max_uses) {
      const { count: usageCount } = await supabase
        .from("event_promo_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("promo_id", promoCode.id)
        .eq("status", "APPLIED");

      if (usageCount >= promoCode.max_uses) {
        return {
          success: false,
          error: "This promo code has reached its usage limit",
        };
      }
    }

    // Check per-user usage limit
    if (userId && promoCode.per_user_limit) {
      const { count: userUsageCount } = await supabase
        .from("event_promo_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("promo_id", promoCode.id)
        .eq("user_id", userId)
        .eq("status", "APPLIED");

      if (userUsageCount >= promoCode.per_user_limit) {
        return {
          success: false,
          error:
            "You have already used this promo code the maximum number of times",
        };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.type === "PERCENT") {
      discountAmount = Math.round((cartTotal * promoCode.value) / 100);
    } else if (promoCode.type === "AMOUNT") {
      discountAmount = promoCode.value;
    }

    // Ensure discount doesn't exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    return {
      success: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        discountAmount: discountAmount,
        finalTotal: cartTotal - discountAmount,
      },
    };
  } catch (error) {
    console.error("Promo code validation error:", error);
    return {
      success: false,
      error: "An error occurred while validating the promo code",
    };
  }
}

/**
 * POST /api/promo/validate
 * Validates and applies a promo code
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const { code, eventId, cartTotal, cartId } = await request.json();

    // Validate required fields
    if (!code || !eventId || cartTotal === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: code, eventId, cartTotal" },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid promo code format" },
        { status: 400 }
      );
    }

    if (typeof cartTotal !== "number" || cartTotal < 0) {
      return NextResponse.json(
        { error: "Invalid cart total" },
        { status: 400 }
      );
    }

    // Rate limiting
    const identifier =
      session?.user?.id ||
      request.headers.get("x-forwarded-for") ||
      "anonymous";
    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createServerSupabase();

    // Validate promo code
    const validationResult = await validatePromoCode(
      supabaseClient,
      code.trim().toUpperCase(),
      eventId,
      cartTotal,
      session?.user?.id
    );

    // Log telemetry and record redemption if successful
    if (validationResult.success) {
      // Record the actual redemption
      await supabaseClient.from("event_promo_redemptions").insert({
        promo_id: validationResult.promoCode.id,
        user_id: session?.user?.id,
        cart_id: cartId,
        amount_discounted: validationResult.promoCode.discountAmount,
        status: "APPLIED",
        redeemed_at: new Date().toISOString(),
      });
    } else {
      // Log failed attempt as telemetry only
      await logTelemetry(supabaseClient, {
        promoId: null,
        userId: session?.user?.id,
        cartId: cartId,
        amountDiscounted: 0,
        success: false,
      });
    }

    if (validationResult.success) {
      return NextResponse.json({
        success: true,
        promoCode: validationResult.promoCode,
        message: "Promo code applied successfully",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Promo validation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/promo/validate
 * Get promo code details without applying (for preview)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const eventId = searchParams.get("eventId");

    if (!code || !eventId) {
      return NextResponse.json(
        { error: "Missing required parameters: code, eventId" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    // Rate limiting
    const identifier =
      session?.user?.id ||
      request.headers.get("x-forwarded-for") ||
      "anonymous";
    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const supabaseClient = createServerSupabase();

    // Get promo code details (read-only)
    const { data: promoCode, error } = await supabaseClient
      .from("event_promo_codes")
      .select(
        "id, code, type, value, min_cart_total, applicable_event_ids, is_active, start_at, end_at"
      )
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !promoCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Promo code not found or inactive",
        },
        { status: 404 }
      );
    }

    // Check if code applies to this event
    if (
      promoCode.applicable_event_ids &&
      promoCode.applicable_event_ids.length > 0 &&
      !promoCode.applicable_event_ids.includes(eventId.toString())
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "This promo code is not valid for this event",
        },
        { status: 400 }
      );
    }

    // Check validity period
    const now = new Date();
    if (promoCode.start_at && new Date(promoCode.start_at) > now) {
      return NextResponse.json(
        {
          success: false,
          error: "This promo code is not yet active",
        },
        { status: 400 }
      );
    }

    if (promoCode.end_at && new Date(promoCode.end_at) < now) {
      return NextResponse.json(
        {
          success: false,
          error: "This promo code has expired",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        type: promoCode.type,
        value: promoCode.value,
        minCartTotal: promoCode.min_cart_total,
      },
    });
  } catch (error) {
    console.error("Promo preview API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
