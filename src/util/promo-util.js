/**
 * Promo code utility functions
 */

/**
 * Format promo code for display
 */
export function formatPromoCode(code) {
  return code?.toUpperCase().trim() || "";
}

/**
 * Calculate discount amount based on promo code type and value
 */
export function calculateDiscount(type, value, cartTotal) {
  if (!type || !value || cartTotal <= 0) return 0;

  let discountAmount = 0;

  if (type === "PERCENT") {
    discountAmount = Math.round((cartTotal * value) / 100);
  } else if (type === "AMOUNT") {
    discountAmount = value;
  }

  // Ensure discount doesn't exceed cart total
  return Math.min(discountAmount, cartTotal);
}

/**
 * Format discount for display
 */
export function formatDiscount(type, value) {
  if (type === "PERCENT") {
    return `${value}% off`;
  } else if (type === "AMOUNT") {
    return `${value} ISK off`;
  }
  return "";
}

/**
 * Validate promo code format (client-side basic validation)
 */
export function validatePromoCodeFormat(code) {
  if (!code || typeof code !== "string") {
    return { valid: false, error: "Please enter a promo code" };
  }

  const trimmedCode = code.trim();
  if (trimmedCode.length === 0) {
    return { valid: false, error: "Please enter a promo code" };
  }

  if (trimmedCode.length < 3) {
    return { valid: false, error: "Promo code must be at least 3 characters" };
  }

  if (trimmedCode.length > 20) {
    return {
      valid: false,
      error: "Promo code must be less than 20 characters",
    };
  }

  // Allow alphanumeric and hyphens
  if (!/^[A-Z0-9-]+$/i.test(trimmedCode)) {
    return {
      valid: false,
      error: "Promo code can only contain letters, numbers, and hyphens",
    };
  }

  return { valid: true };
}

/**
 * Generate a unique cart ID for guest users
 */
export function generateCartId() {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * API call to validate and apply promo code
 */
export async function validatePromoCode(
  code,
  eventId,
  cartTotal,
  cartId = null
) {
  try {
    const response = await fetch("/api/promo/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: formatPromoCode(code),
        eventId,
        cartTotal,
        cartId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to validate promo code",
      };
    }

    return data;
  } catch (error) {
    console.error("Promo code validation error:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

/**
 * API call to preview promo code details
 */
export async function previewPromoCode(code, eventId) {
  try {
    const response = await fetch(
      `/api/promo/validate?code=${encodeURIComponent(formatPromoCode(code))}&eventId=${eventId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to preview promo code",
      };
    }

    return data;
  } catch (error) {
    console.error("Promo code preview error:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}
