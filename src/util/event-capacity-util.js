/**
 * Utility functions for event capacity management
 */

/**
 * Calculate the total number of tickets sold for an event
 * @param {Array} tickets - Array of ticket objects with quantity and status
 * @returns {number} Total number of tickets sold (paid or door tickets)
 */
export function calculateTicketsSold(tickets) {
  if (!tickets || !Array.isArray(tickets)) return 0;
  
  return tickets.reduce((sum, ticket) => {
    // Count tickets with status "paid" or "door" (confirmed tickets)
    if (ticket.status === "paid" || ticket.status === "door") {
      return sum + (ticket.quantity || 0);
    }
    return sum;
  }, 0);
}

/**
 * Check if an event is sold out based on capacity
 * @param {Object} event - Event object with capacity field
 * @param {number} ticketsSold - Number of tickets already sold
 * @returns {boolean} True if event is sold out
 */
export function isEventSoldOut(event, ticketsSold) {
  // If capacity is null, 0, or undefined, there's no limit
  if (!event.capacity || event.capacity === 0) {
    return false;
  }
  
  // Check if manually marked as sold out
  if (event.sold_out === true) {
    return true;
  }
  
  // Check if capacity is reached
  return ticketsSold >= event.capacity;
}

/**
 * Calculate remaining capacity for an event
 * @param {Object} event - Event object with capacity field
 * @param {number} ticketsSold - Number of tickets already sold
 * @returns {number|null} Remaining capacity, or null if unlimited
 */
export function getRemainingCapacity(event, ticketsSold) {
  // If capacity is null, 0, or undefined, there's no limit
  if (!event.capacity || event.capacity === 0) {
    return null; // Unlimited
  }
  
  const remaining = event.capacity - ticketsSold;
  return Math.max(0, remaining); // Don't return negative
}

/**
 * Check if a purchase can be made (enough capacity available)
 * @param {Object} event - Event object with capacity field
 * @param {number} ticketsSold - Number of tickets already sold
 * @param {number} requestedQuantity - Number of tickets requested
 * @returns {Object} { canPurchase: boolean, reason?: string }
 */
export function canPurchaseTickets(event, ticketsSold, requestedQuantity) {
  // If capacity is null, 0, or undefined, there's no limit
  if (!event.capacity || event.capacity === 0) {
    return { canPurchase: true };
  }
  
  // Check if manually marked as sold out
  if (event.sold_out === true) {
    return { canPurchase: false, reason: "Event is marked as sold out" };
  }
  
  // Check if capacity is already reached
  if (ticketsSold >= event.capacity) {
    return { canPurchase: false, reason: "Event is sold out" };
  }
  
  // Check if requested quantity exceeds remaining capacity
  const remaining = event.capacity - ticketsSold;
  if (requestedQuantity > remaining) {
    return {
      canPurchase: false,
      reason: `Only ${remaining} ticket${remaining === 1 ? "" : "s"} available`,
    };
  }
  
  return { canPurchase: true };
}

/**
 * Check whether the early bird price currently applies.
 *
 * Two mutually exclusive modes, inferred from which column is set:
 *   • ticket-limit mode — early_bird_ticket_limit set: active while fewer
 *     than N tickets are sold (an order started while active gets the early
 *     bird price for its whole quantity, matching the capacity-check style).
 *   • date mode — early_bird_date set: active until the deadline.
 *
 * @param {Object} event - Event with early_bird_price, early_bird_date, early_bird_ticket_limit
 * @param {number} [ticketsSold] - Tickets sold so far (required for ticket-limit mode)
 * @returns {boolean} True if the early bird price applies right now
 */
export function isEarlyBirdActive(event, ticketsSold) {
  if (!event || !event.early_bird_price) return false;

  if (event.early_bird_ticket_limit) {
    const sold = typeof ticketsSold === "number" ? ticketsSold : 0;
    return sold < event.early_bird_ticket_limit;
  }

  if (event.early_bird_date) {
    return new Date() < new Date(event.early_bird_date);
  }

  return false;
}

/**
 * How many early bird tickets are still left (ticket-limit mode only).
 * @param {Object} event - Event object
 * @param {number} [ticketsSold] - Tickets sold so far
 * @returns {number|null} Remaining early bird tickets, or null when the
 *   event doesn't use ticket-limit early bird pricing
 */
export function getEarlyBirdRemaining(event, ticketsSold) {
  if (!event || !event.early_bird_price || !event.early_bird_ticket_limit) {
    return null;
  }
  const sold = typeof ticketsSold === "number" ? ticketsSold : 0;
  return Math.max(0, event.early_bird_ticket_limit - sold);
}


/**
 * Grace window after an event's scheduled end during which it is still
 * treated as live: it stays on /events, keeps its ticket page open, and is
 * kept out of /past-events. Covers the two everyday cases — a session that
 * runs long, and latecomers who still owe for their ticket on the way out.
 */
export const EVENT_END_GRACE_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Scheduled end of an event, in ms since epoch (start + duration, default 2h).
 * @param {Object} event - Event with date and duration
 * @returns {number} Epoch ms, or NaN when the date is unusable
 */
export function getEventEndTime(event) {
  const start = new Date(event?.date).getTime();
  if (Number.isNaN(start)) return NaN;
  return start + (Number(event?.duration) || 2) * 60 * 60 * 1000;
}

/**
 * Single definition of "this event is over" used by the events list, the
 * past-events list, the event page CTA and the series redirects — so those
 * four can never disagree about whether something is still on.
 * @param {Object} event - Event with date and duration
 * @param {Object} [opts]
 * @param {number} [opts.graceMs] - Override the grace window (0 = strict end)
 * @param {number} [opts.now] - Epoch ms to compare against (for testing)
 * @returns {boolean} True once the event has ended and the grace has elapsed
 */
export function hasEventEnded(event, { graceMs = EVENT_END_GRACE_MS, now = Date.now() } = {}) {
  const end = getEventEndTime(event);
  if (Number.isNaN(end)) return false;
  return end + graceMs <= now;
}
