// Email manifest — the single source of truth for /admin/email.
// ────────────────────────────────────────────────────────────────
// Every email this codebase sends is registered here. The Email Hub admin
// page reads from this file to render its sidebar, statuses, and previews.
//
// Two kinds of entries:
//
//   1. status: "templated"
//      Modern React Email templates living in src/emails/templates/.
//      The hub renders these via @react-email/render and they have full
//      preview + send-test support.
//
//   2. status: "legacy"
//      Old emails written as inline HTML strings (from before the system
//      existed). The hub still lists them so you can SEE every email in
//      one place — preview shows source-file metadata + a "view source"
//      link so you can read the existing implementation. They get migrated
//      to React Email one at a time as we touch them.
//
// To add a new templated email:
//   1. Create src/emails/templates/MyEmail.jsx (default-export the component,
//      attach .previewProps and .subject)
//   2. Add an entry below with status "templated" and templateImport pointing
//      to the file path
//
// To migrate a legacy email:
//   1. Build the React Email version
//   2. Flip status from "legacy" to "templated"
//   3. Wire the actual sender (in src/lib or the api route) to use it

export const EMAIL_GROUPS = [
  { id: "marketing",   label: "Marketing",   order: 1 },
  { id: "membership",  label: "Membership",  order: 2 },
  { id: "account",     label: "Account",     order: 3 },
  { id: "tickets",     label: "Tickets",     order: 4 },
  { id: "bookings",    label: "Bookings",    order: 5 },
  { id: "operations",  label: "Operations",  order: 6 },
];

export const EMAIL_MANIFEST = [
  // ── MARKETING ─────────────────────────────────────────────────
  {
    id: "monthly-newsletter",
    name: "Monthly Newsletter",
    group: "marketing",
    trigger: "Sent manually around the 1st of each month — Community + Tribe",
    recipient: "All subscribers (segmentable by tier)",
    status: "templated",
    templateImport: "MonthlyNewsletter",
  },
  {
    id: "welcome-community",
    name: "Welcome — Community",
    group: "marketing",
    trigger: "Sent immediately when someone joins the free Community tier",
    recipient: "New community member",
    status: "templated",
    templateImport: "WelcomeCommunity",
  },
  {
    id: "welcome-tribe",
    name: "Welcome — Tribe",
    group: "marketing",
    trigger: "Sent immediately when a Tribe subscription is created",
    recipient: "New Tribe member",
    status: "templated",
    templateImport: "WelcomeTribe",
    note: "Replaces the legacy 'tribe-card-welcome' email once wired up",
  },

  // ── MEMBERSHIP (migrated — templates in src/emails/templates/) ──────────────
  // The live route still calls the inline-HTML versions in
  // src/lib/membershipEmails.js. Once the route refactor lands, these
  // templates take over as the actual sent HTML.
  {
    id: "membership-renewal-succeeded",
    name: "Renewal Succeeded",
    group: "membership",
    trigger: "Cron-triggered automatic renewal charge succeeds",
    recipient: "Member",
    status: "templated",
    templateImport: "RenewalSucceeded",
    note: "Migrated; route still sends inline HTML — refactor pending",
  },
  {
    id: "membership-renewal-soft-failed",
    name: "Renewal Failed (Retry Available)",
    group: "membership",
    trigger: "Renewal charge fails but retry window is still open (~5 days)",
    recipient: "Member",
    status: "templated",
    templateImport: "RenewalSoftFailed",
  },
  {
    id: "membership-renewal-final-failed",
    name: "Renewal Final Failed",
    group: "membership",
    trigger: "All retry attempts exhausted, membership about to cancel",
    recipient: "Member",
    status: "templated",
    templateImport: "RenewalFinalFailed",
  },
  {
    id: "membership-renewal-no-card",
    name: "No Card on File",
    group: "membership",
    trigger: "Renewal attempted with no valid payment method stored",
    recipient: "Member",
    status: "templated",
    templateImport: "RenewalNoCard",
  },
  {
    id: "membership-cancellation-scheduled",
    name: "Cancellation Scheduled",
    group: "membership",
    trigger: "Member initiates cancellation",
    recipient: "Member",
    status: "templated",
    templateImport: "CancellationScheduled",
  },
  {
    id: "membership-cancellation-final",
    name: "Cancellation Final",
    group: "membership",
    trigger: "Membership reaches end of period",
    recipient: "Member",
    status: "templated",
    templateImport: "CancellationFinal",
  },
  {
    id: "membership-refund-issued",
    name: "Refund Issued",
    group: "membership",
    trigger: "Refund processed for a membership charge",
    recipient: "Member",
    status: "templated",
    templateImport: "RefundIssued",
  },

  // ── ACCOUNT ───────────────────────────────────────────────────
  {
    id: "tribe-card-welcome",
    name: "Tribe Card Welcome",
    group: "account",
    trigger: "Admin approves a tribe card request",
    recipient: "Tribe card holder",
    status: "templated",
    templateImport: "TribeCardWelcome",
    note: "Wallet attachment (.pkpass) handled by legacy sender; template renders the HTML around it",
  },
  {
    id: "tribe-card-rejection",
    name: "Tribe Card Rejection",
    group: "account",
    trigger: "Admin rejects a tribe card request (opt-in)",
    recipient: "Requestor",
    status: "templated",
    templateImport: "TribeCardRejection",
  },
  {
    id: "password-reset-request",
    name: "Password Reset",
    group: "account",
    trigger: "User requests password reset",
    recipient: "User",
    status: "templated",
    templateImport: "PasswordReset",
    note: "Migrated to brand template — old route still sends inline HTML; route refactor pending so the live send uses this template too.",
  },

  // ── TICKETS (migrated — templates in src/emails/templates/) ─────────────
  // Live routes still send the old inline-HTML versions until the route
  // refactor lands; templates here are the design we'll switch to.
  {
    id: "paid-ticket-attendee-confirmation",
    name: "Paid Ticket Confirmation",
    group: "tickets",
    trigger: "Attendee buys an event ticket",
    recipient: "Attendee",
    status: "templated",
    templateImport: "PaidTicketAttendeeConfirmation",
    note: "Includes 15% restaurant discount offer (preserved in callout)",
  },
  {
    id: "free-ticket-attendee-confirmation",
    name: "Free Ticket Confirmation",
    group: "tickets",
    trigger: "Attendee registers for a free event",
    recipient: "Attendee",
    status: "templated",
    templateImport: "FreeTicketAttendeeConfirmation",
  },
  {
    id: "ticket-refund",
    name: "Ticket Refund",
    group: "tickets",
    trigger: "Refund processed for a ticket",
    recipient: "Ticket buyer",
    status: "templated",
    templateImport: "TicketRefund",
  },
  {
    id: "shop-order-buyer-confirmation",
    name: "Shop Order Confirmation",
    group: "tickets",
    trigger: "Shop checkout succeeds",
    recipient: "Buyer",
    status: "templated",
    templateImport: "ShopOrderBuyerConfirmation",
  },
  {
    id: "giftcard-purchase-buyer-confirmation",
    name: "Gift Card Purchase",
    group: "tickets",
    trigger: "Gift card payment succeeds",
    recipient: "Buyer",
    status: "templated",
    templateImport: "GiftCardPurchase",
  },
  {
    id: "5meals-card-buyer-confirmation",
    name: "5 Meals for Winter Card",
    group: "tickets",
    trigger: "5 Meals card payment succeeds",
    recipient: "Buyer",
    status: "templated",
    templateImport: "FiveMealsCard",
  },

  // ── BOOKINGS ──────────────────────────────────────────────────
  {
    id: "wl-booking-customer-confirmation",
    name: "WL Booking Confirmation",
    group: "bookings",
    trigger: "Customer completes a White Lotus venue booking",
    recipient: "Customer",
    status: "templated",
    templateImport: "WlBookingCustomerConfirmation",
  },
  {
    id: "wl-venue-rental-customer-confirmation",
    name: "WL Venue Rental Inquiry (Confirmation)",
    group: "bookings",
    trigger: "Customer submits venue rental inquiry",
    recipient: "Customer",
    status: "templated",
    templateImport: "WlVenueRentalConfirmation",
  },
  {
    id: "catering-quote-customer-confirmation",
    name: "Catering Quote (Confirmation)",
    group: "bookings",
    trigger: "Customer submits catering quote request",
    recipient: "Customer",
    status: "templated",
    templateImport: "CateringQuoteConfirmation",
  },
  {
    id: "private-cacao-inquiry-customer-confirmation",
    name: "Private Cacao Inquiry (Confirmation)",
    group: "bookings",
    trigger: "Customer submits private cacao ceremony inquiry",
    recipient: "Customer",
    status: "templated",
    templateImport: "PrivateCacaoConfirmation",
  },

  // ── OPERATIONS (team / host notifications) ────────────────────
  {
    id: "tribe-card-request-notification",
    name: "Tribe Card Request (Team)",
    group: "operations",
    trigger: "Visitor submits a public tribe card request",
    recipient: "team@mama.is",
    status: "templated",
    templateImport: "TribeCardRequestNotification",
  },
  {
    id: "wl-booking-admin-notification",
    name: "WL Booking (Team)",
    group: "operations",
    trigger: "Customer completes a WL booking",
    recipient: "team@whitelotus.is",
    status: "templated",
    templateImport: "WlBookingAdminNotification",
  },
  {
    id: "wl-venue-rental-team-notification",
    name: "WL Venue Rental (Team)",
    group: "operations",
    trigger: "Customer submits venue rental inquiry",
    recipient: "team@whitelotus.is",
    status: "templated",
    templateImport: "WlVenueRentalTeamNotification",
  },
  {
    id: "catering-quote-team-notification",
    name: "Catering Quote (Team)",
    group: "operations",
    trigger: "Customer submits catering quote",
    recipient: "team@mama.is",
    status: "templated",
    templateImport: "CateringQuoteTeamNotification",
  },
  {
    id: "private-cacao-inquiry-team-notification",
    name: "Private Cacao Inquiry (Team)",
    group: "operations",
    trigger: "Customer submits private cacao inquiry",
    recipient: "team@mama.is",
    status: "templated",
    templateImport: "PrivateCacaoTeamNotification",
  },
  {
    id: "contact-form-submission",
    name: "Contact Form Submission (Team)",
    group: "operations",
    trigger: "Visitor submits the general contact form",
    recipient: "team@mama.is",
    status: "templated",
    templateImport: "ContactFormSubmission",
  },
  {
    id: "wl-review-submission-notification",
    name: "WL Review Submission (Team)",
    group: "operations",
    trigger: "Customer submits or updates a WL review",
    recipient: "team@mama.is",
    status: "templated",
    templateImport: "WlReviewSubmission",
  },
  {
    id: "summer-market-application-submission",
    name: "Summer Market Application (Team)",
    group: "operations",
    trigger: "Vendor submits Summer Market application",
    recipient: "team@mama.is",
    status: "templated",
    templateImport: "SummerMarketApplication",
  },
  {
    id: "event-created-host-notification",
    name: "Event Created (Host)",
    group: "operations",
    trigger: "Host creates a new event",
    recipient: "Host",
    status: "templated",
    templateImport: "EventCreatedHostNotification",
  },
  {
    id: "free-ticket-host-notification",
    name: "Free Ticket Reg (Host)",
    group: "operations",
    trigger: "Free ticket attendee registers",
    recipient: "Host",
    status: "templated",
    templateImport: "FreeTicketHostNotification",
  },
  {
    id: "paid-ticket-host-notification",
    name: "Paid Ticket Reg (Host)",
    group: "operations",
    trigger: "Paid ticket attendee registers",
    recipient: "Host",
    status: "templated",
    templateImport: "PaidTicketHostNotification",
  },
  {
    id: "gatekeeper-event-wrap-recap",
    name: "Event Wrap-Up Recap",
    group: "operations",
    trigger: "Event concludes — gatekeeper recap",
    recipient: "Host",
    status: "templated",
    templateImport: "GatekeeperWrap",
    note: "Original enso/pillars character preserved within brand chrome",
  },
  {
    id: "message-attendance-broadcast",
    name: "Message Attendees (Broadcast)",
    group: "operations",
    trigger: "Host/admin broadcasts a message to event attendees",
    recipient: "All event attendees",
    status: "templated",
    templateImport: "MessageAttendanceBroadcast",
  },
  {
    id: "host-invite-creation",
    name: "Host Event Creation Invitation",
    group: "operations",
    trigger: "Admin invites a new host to create an event",
    recipient: "Invited host",
    status: "templated",
    templateImport: "HostInviteCreation",
  },
  {
    id: "shop-order-admin-notification",
    name: "Shop Order (Admin)",
    group: "operations",
    trigger: "Shop checkout succeeds",
    recipient: "team@mama.is",
    status: "templated",
    templateImport: "ShopOrderAdminNotification",
  },
  {
    id: "giftcard-purchase-admin-notification",
    name: "Gift Card Purchase (Admin)",
    group: "operations",
    trigger: "Gift card payment succeeds",
    recipient: "team@mama.is",
    status: "templated",
    templateImport: "GiftCardAdminNotification",
  },
  {
    id: "5meals-card-admin-notification",
    name: "5 Meals Card Purchase (Admin)",
    group: "operations",
    trigger: "5 Meals card payment succeeds",
    recipient: "team@mama.is",
    status: "templated",
    templateImport: "FiveMealsAdminNotification",
  },
  {
    id: "access-request-notification",
    name: "Role Access Request (Admin)",
    group: "operations",
    trigger: "User requests Event Manager / Admin role",
    recipient: "team@mama.is",
    status: "templated",
    templateImport: "AccessRequestNotification",
  },
  {
    id: "error-notification-system",
    name: "Application Error Notification",
    group: "operations",
    trigger: "Unhandled production error caught by report endpoint",
    recipient: "ERROR_NOTIFICATION_EMAIL",
    status: "templated",
    templateImport: "ErrorNotification",
    note: "Rate-limited (max 3 per error per hour), production-only",
  },

  // ── Newly cataloged (post-original-manifest discoveries) ────────────────
  {
    id: "private-space-request-customer",
    name: "Private Space Request (Customer)",
    group: "bookings",
    trigger: "Customer submits a Private Space booking request",
    recipient: "Customer",
    status: "templated",
    templateImport: "PrivateSpaceRequestCustomer",
    note: "Sent before payment — admin reviews then sends payment link separately.",
  },
  {
    id: "private-space-request-admin",
    name: "Private Space Request (Admin)",
    group: "operations",
    trigger: "Customer submits a Private Space booking request",
    recipient: "PRIVATE_SPACE_ADMIN_EMAIL (or mama.reykjavik@gmail.com)",
    status: "templated",
    templateImport: "PrivateSpaceRequestAdmin",
  },
  {
    id: "private-space-approved",
    name: "Private Space Approved (Pay Link)",
    group: "bookings",
    trigger: "Admin approves a Private Space request",
    recipient: "Customer",
    status: "templated",
    templateImport: "PrivateSpaceApproved",
    note: "Includes the SecurePay checkout URL. Customer pays from this email.",
  },
  {
    id: "private-space-declined",
    name: "Private Space Declined",
    group: "bookings",
    trigger: "Admin declines a Private Space request",
    recipient: "Customer",
    status: "templated",
    templateImport: "PrivateSpaceDeclined",
  },
  {
    id: "private-space-paid",
    name: "Private Space Paid / Confirmed",
    group: "bookings",
    trigger: "SecurePay callback confirms payment for an approved booking",
    recipient: "Customer",
    status: "templated",
    templateImport: "PrivateSpacePaid",
  },
  {
    id: "tour-booking-confirmation",
    name: "Tour Booking Confirmation",
    group: "tickets",
    trigger: "SaltPay payment succeeds for a tour booking",
    recipient: "Tour customer",
    status: "templated",
    templateImport: "TourBookingConfirmation",
    note: "Includes meeting point, what to bring, what's included.",
  },
  {
    id: "order-delivery-notification",
    name: "Order Delivery Notification",
    group: "tickets",
    trigger: "Admin clicks 'send delivery email' on a delivery order",
    recipient: "Order customer",
    status: "templated",
    templateImport: "OrderDeliveryNotification",
    note: "Manual admin action, sent once per order (delivery_notification_sent_at gates re-sends).",
  },

  // ── Newly cataloged but NOT yet templated — placeholders ────────────────
  // These are real send paths that exist but haven't been migrated yet.
  // They show in the hub as legacy entries. Tackle in a later batch.
  {
    id: "saltpay-ticket-buyer-confirmation",
    name: "Ticket Confirmation (Paid Online)",
    group: "tickets",
    trigger: "SaltPay payment succeeds for an event ticket",
    recipient: "Ticket buyer",
    status: "templated",
    templateImport: "PaidTicketAttendeeConfirmation",
    note: "Reuses PaidTicketAttendeeConfirmation with paid=true. Different from sendgrid/ticket which is pay-at-door.",
  },
  {
    id: "summer-market-acceptance",
    name: "Summer Market Application Accepted",
    group: "operations",
    trigger: "Admin accepts a Summer Market application",
    recipient: "Applicant",
    status: "templated",
    templateImport: "SummerMarketAcceptance",
    note: "Pricing block + dates summary come from @/lib/summerMarketPricing helpers",
  },
  {
    id: "summer-market-rejection",
    name: "Summer Market Application Rejected",
    group: "operations",
    trigger: "Admin rejects a Summer Market application",
    recipient: "Applicant",
    status: "templated",
    templateImport: "SummerMarketRejection",
  },
  {
    id: "wl-booking-comment-customer",
    name: "WL Booking Comment → Customer",
    group: "operations",
    trigger: "Admin adds a comment on a customer's WL booking",
    recipient: "Customer",
    status: "templated",
    templateImport: "WlBookingCommentNotification",
    note: "Same template as → Admin, switched by direction prop. Translated to English.",
  },
  {
    id: "wl-booking-comment-admin",
    name: "WL Booking Comment → Admin",
    group: "operations",
    trigger: "Customer adds a comment on their WL booking",
    recipient: "team@whitelotus.is",
    status: "templated",
    templateImport: "WlBookingCommentNotification",
  },
  {
    id: "wl-booking-field-update",
    name: "WL Booking Field Update (4 modes)",
    group: "operations",
    trigger: "Admin approves/rejects/changes a booking field, or customer changes one (pending approval)",
    recipient: "Customer or admin (depending on direction)",
    status: "templated",
    templateImport: "WlBookingFieldNotification",
    note: "One template, 4 modes: approved | rejected | changed | customer_pending",
  },
  {
    id: "events-create-event-host",
    name: "Event Created (multi-date variant)",
    group: "operations",
    trigger: "Host creates an event via /api/events/create-event (multi-date capable)",
    recipient: "Host",
    status: "templated",
    templateImport: "EventCreatedHostNotification",
    note: "Reuses the same template as event-created-host-notification.",
  },
  {
    id: "gatekeeper-walkin-receipt",
    name: "Gatekeeper Walk-in Receipt",
    group: "tickets",
    trigger: "Gatekeeper checks in a walk-in attendee who requested a receipt",
    recipient: "Walk-in attendee",
    status: "templated",
    templateImport: "GatekeeperWalkinReceipt",
  },
  {
    id: "custom-card-issued",
    name: "Custom Card Issued",
    group: "account",
    trigger: "Admin creates a new custom card (or re-sends the welcome)",
    recipient: "Card recipient",
    status: "templated",
    templateImport: "CustomCardIssued",
    note: "Used by POST /admin/custom-cards (when send_email) AND POST /admin/custom-cards/send-email/[id]",
  },
  {
    id: "custom-card-updated",
    name: "Custom Card Updated",
    group: "account",
    trigger: "Admin edits a custom card and opts to notify the recipient",
    recipient: "Card recipient",
    status: "templated",
    templateImport: "CustomCardUpdated",
  },

  // ── Private session (visiting practitioners) ──────────────────────────
  {
    id: "private-session-booking-customer",
    name: "Private Session Booking (Customer)",
    group: "bookings",
    trigger: "Client confirms a private session booking",
    recipient: "Customer",
    status: "templated",
    templateImport: "PrivateSessionBookingCustomer",
    note: "Cash on the day. No address — the day-before cron sends it.",
  },
  {
    id: "private-session-booking-admin",
    name: "Private Session Booking (Admin)",
    group: "operations",
    trigger: "Client confirms a private session booking",
    recipient: "mama.reykjavik@gmail.com",
    status: "templated",
    templateImport: "PrivateSessionBookingAdmin",
  },
  {
    id: "private-session-waitlist-customer",
    name: "Private Session Waitlist (Customer)",
    group: "bookings",
    trigger: "Client joins the waitlist for an offering",
    recipient: "Customer",
    status: "templated",
    templateImport: "PrivateSessionWaitlistCustomer",
  },
  {
    id: "private-session-waitlist-admin",
    name: "Private Session Waitlist (Admin)",
    group: "operations",
    trigger: "Client joins the waitlist for an offering",
    recipient: "mama.reykjavik@gmail.com",
    status: "templated",
    templateImport: "PrivateSessionWaitlistAdmin",
  },
  {
    id: "private-session-reminder-customer",
    name: "Private Session Reminder (Customer)",
    group: "bookings",
    trigger: "Daily cron, day before the session",
    recipient: "Customer",
    status: "templated",
    templateImport: "PrivateSessionReminderCustomer",
    note: "Carries the exact address. Throttled via day_before_email_sent_at.",
  },
  {
    id: "private-session-needs-address-team",
    name: "Private Session Needs Address (Team)",
    group: "operations",
    trigger: "Daily cron, two days before — address still NULL",
    recipient: "mama + team@whitelotus.is (+ practitioner notification_email)",
    status: "templated",
    templateImport: "PrivateSessionNeedsAddressTeam",
    note: "Throttled via location_alert_sent_at.",
  },
  {
    id: "private-session-day-of-no-address",
    name: "Private Session Day-of Fallback (Customer)",
    group: "bookings",
    trigger: "Daily cron, day of session — address still NULL",
    recipient: "Customer",
    status: "templated",
    templateImport: "PrivateSessionDayOfNoAddress",
    note: "Throttled via day_of_email_sent_at.",
  },
];

// NOTE: The TEMPLATE_LOADERS map (which dynamically imports the React Email
// template components) lives in `templates.server.js`, NOT here. If we put it
// in this file, Next's bundler statically discovers the template imports and
// drags the entire React Email runtime + every template into the CLIENT bundle
// the moment any client component imports manifest.js. The split keeps this
// file safe to import from anywhere.

// Convenience accessors -------------------------------------------------------

export function getEmailById(id) {
  return EMAIL_MANIFEST.find((e) => e.id === id) || null;
}

export function getEmailsByGroup() {
  const grouped = EMAIL_GROUPS.map((g) => ({
    ...g,
    items: EMAIL_MANIFEST
      .filter((e) => e.group === g.id)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
  return grouped.sort((a, b) => a.order - b.order);
}

export function countByStatus() {
  const counts = {
    templated: 0,
    legacy: 0,
    legacyPreviewable: 0,
    total: EMAIL_MANIFEST.length,
  };
  for (const e of EMAIL_MANIFEST) {
    counts[e.status] = (counts[e.status] || 0) + 1;
    if (e.status === "legacy" && e.previewable) counts.legacyPreviewable += 1;
  }
  return counts;
}
