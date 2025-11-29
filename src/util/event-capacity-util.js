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

