// Server-side promo code validation, shared by /api/promo/validate (when the
// buyer applies a code) and /api/tickets/checkout (which re-prices the order
// on the server). At checkout the usage limits are skipped: the redemption
// was already recorded when the buyer applied the code, so counting it again
// would reject a single-use code the buyer is legitimately using.

/**
 * Validate promo code and return discount details
 */
export async function validatePromoCode(
  supabase,
  code,
  eventId,
  cartTotal,
  userId = null,
  { skipUsageLimits = false } = {}
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
      promoCode.applicable_event_ids.length > 0
    ) {
      // Specific events selected - check if current event is in the list
      if (!promoCode.applicable_event_ids.includes(eventId.toString())) {
        return {
          success: false,
          error: "This promo code is not valid for this event",
        };
      }
    } else {
      // "All Events" selected (empty array) - need to check permissions
      // Get the creator of the promo code to determine scope
      const { data: creator } = await supabase
        .from("users")
        .select("role, email")
        .eq("id", promoCode.created_by)
        .single();

      if (creator && creator.role === "host") {
        // Host-created "All Events" promo code - check if event belongs to this host
        const { data: event } = await supabase
          .from("events")
          .select("host")
          .eq("id", eventId)
          .single();

        if (!event || event.host !== creator.email) {
          return {
            success: false,
            error: "This promo code is not valid for this event",
          };
        }
      }
      // For admin-created "All Events" promo codes, allow any event
    }

    // Check minimum cart total
    if (cartTotal < promoCode.min_cart_total) {
      return {
        success: false,
        error: `Minimum cart total of ${promoCode.min_cart_total} ISK required`,
      };
    }

    // Check global usage limit
    if (!skipUsageLimits && promoCode.max_uses) {
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
    if (!skipUsageLimits && userId && promoCode.per_user_limit) {
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
