// Pricing logic for The Private Space.
// Used on both client (live preview) and server (authoritative total).
// IMPORTANT: When adjusting numbers, also update copy.js for the public pricing page.

export const PRICES = {
  hourlyBase: 5500,           // ISK per hour (1-3 hour bookings)
  hourlyBulk: 4500,           // ISK per hour when booking ≥ 4 hrs ad hoc
  halfDay: 18000,             // 4-hour block
  fullDay: 32000,             // 8+ hours
  recurring2hr: 34000,        // monthly, 2 hrs/week
  recurring3hr: 48000,        // monthly, 3 hrs/week
  vatRate: 0.24,              // for receipts (prices already include VAT)
};

export const PROMO_CODES = {
  WELCOME15: { percent: 15, oneTimeOnly: true, description: "First-time renters" },
};

export const BOOKING_TYPES = {
  HOURLY: "hourly",
  HALF_DAY: "half_day",
  FULL_DAY: "full_day",
  RECURRING_WEEKLY: "recurring_weekly",
};

const HALF_DAY_BLOCKS = [
  { id: "morning", startHour: 9, endHour: 13, label: { en: "Morning · 9 – 13", is: "Morgun · 9 – 13" } },
  { id: "afternoon", startHour: 13, endHour: 17, label: { en: "Afternoon · 13 – 17", is: "Síðdegi · 13 – 17" } },
  { id: "evening", startHour: 17, endHour: 21, label: { en: "Evening · 17 – 21", is: "Kvöld · 17 – 21" } },
];

export function getHalfDayBlocks() {
  return HALF_DAY_BLOCKS;
}

/**
 * Calculate total price for a booking.
 * @param {{ bookingType: string, durationHours?: number, recurringHoursPerWeek?: number }} input
 * @returns {{ subtotalIsk: number, breakdown: string }}
 */
export function calculateSubtotal({ bookingType, durationHours = 0, recurringHoursPerWeek = 0 }) {
  switch (bookingType) {
    case BOOKING_TYPES.HOURLY: {
      if (durationHours < 2) {
        return { subtotalIsk: 0, breakdown: "Minimum 2 hours" };
      }
      const rate = durationHours >= 4 ? PRICES.hourlyBulk : PRICES.hourlyBase;
      const subtotal = rate * durationHours;
      return {
        subtotalIsk: subtotal,
        breakdown: `${durationHours} hr × ${rate.toLocaleString("is-IS")} ISK = ${subtotal.toLocaleString("is-IS")} ISK`,
      };
    }
    case BOOKING_TYPES.HALF_DAY:
      return { subtotalIsk: PRICES.halfDay, breakdown: `Half-day block · ${PRICES.halfDay.toLocaleString("is-IS")} ISK` };
    case BOOKING_TYPES.FULL_DAY:
      return { subtotalIsk: PRICES.fullDay, breakdown: `Full day · ${PRICES.fullDay.toLocaleString("is-IS")} ISK` };
    case BOOKING_TYPES.RECURRING_WEEKLY: {
      let monthly = 0;
      if (recurringHoursPerWeek === 2) monthly = PRICES.recurring2hr;
      else if (recurringHoursPerWeek === 3) monthly = PRICES.recurring3hr;
      else if (recurringHoursPerWeek > 3) monthly = PRICES.recurring3hr + (recurringHoursPerWeek - 3) * PRICES.hourlyBulk * 4;
      return {
        subtotalIsk: monthly,
        breakdown: `Weekly slot · ${monthly.toLocaleString("is-IS")} ISK / month`,
      };
    }
    default:
      return { subtotalIsk: 0, breakdown: "" };
  }
}

/**
 * Apply promo code to subtotal.
 * @returns {{ discountIsk: number, totalIsk: number, applied: boolean, reason: string }}
 */
export function applyPromo(subtotalIsk, promoCode) {
  if (!promoCode) return { discountIsk: 0, totalIsk: subtotalIsk, applied: false, reason: "" };
  const code = String(promoCode).trim().toUpperCase();
  const def = PROMO_CODES[code];
  if (!def) return { discountIsk: 0, totalIsk: subtotalIsk, applied: false, reason: "Unknown code" };
  const discountIsk = Math.round((subtotalIsk * def.percent) / 100);
  return {
    discountIsk,
    totalIsk: subtotalIsk - discountIsk,
    applied: true,
    reason: def.description,
  };
}

export function formatIsk(amountIsk, locale = "is-IS") {
  return `${Math.round(amountIsk).toLocaleString(locale)} ISK`;
}

export function generateReferenceId(emailOrName, dateLike) {
  const seed = (emailOrName || "anon").split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);
  const d = new Date(dateLike);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 5);
  return `PS-${seed}-${day}${month}-${rand}`;
}
