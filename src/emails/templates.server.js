// Server-only registry of templated emails.
// ────────────────────────────────────────────
// This file MUST NOT be imported from any client component, including the
// /admin/email page. It dynamically imports React Email template components
// which pull in @react-email/components (and the React Email runtime). If
// either reaches the client bundle, the page balloons in size and SSR may
// break.
//
// The "server-only" import is a Next.js sentinel — if anything ever causes
// this module to be bundled for the browser, the build will fail loudly with
// a clear message rather than silently shipping the templates to the client.

import "server-only";

export const TEMPLATE_LOADERS = {
  "monthly-newsletter":               () => import("./templates/MonthlyNewsletter"),
  "welcome-newsletter":               () => import("./templates/WelcomeNewsletter"),
  "welcome-community":                () => import("./templates/WelcomeCommunity"),
  "welcome-tribe":                    () => import("./templates/WelcomeTribe"),
  "password-reset-request":           () => import("./templates/PasswordReset"),
  "membership-first-receipt":         () => import("./templates/FirstReceipt"),
  "membership-renewal-succeeded":     () => import("./templates/RenewalSucceeded"),
  "membership-renewal-soft-failed":   () => import("./templates/RenewalSoftFailed"),
  "membership-renewal-final-failed":  () => import("./templates/RenewalFinalFailed"),
  "membership-renewal-no-card":       () => import("./templates/RenewalNoCard"),
  "membership-cancellation-scheduled": () => import("./templates/CancellationScheduled"),
  "membership-cancellation-final":    () => import("./templates/CancellationFinal"),
  "membership-refund-issued":         () => import("./templates/RefundIssued"),
  "paid-ticket-attendee-confirmation": () => import("./templates/PaidTicketAttendeeConfirmation"),
  "free-ticket-attendee-confirmation": () => import("./templates/FreeTicketAttendeeConfirmation"),
  "ticket-refund":                    () => import("./templates/TicketRefund"),
  "shop-order-buyer-confirmation":    () => import("./templates/ShopOrderBuyerConfirmation"),
  "giftcard-purchase-buyer-confirmation": () => import("./templates/GiftCardPurchase"),
  "5meals-card-buyer-confirmation":   () => import("./templates/FiveMealsCard"),
  "tribe-card-welcome":               () => import("./templates/TribeCardWelcome"),
  "tribe-card-rejection":             () => import("./templates/TribeCardRejection"),
  "catering-quote-customer-confirmation":     () => import("./templates/CateringQuoteConfirmation"),
  "private-cacao-inquiry-customer-confirmation": () => import("./templates/PrivateCacaoConfirmation"),
  "wl-venue-rental-customer-confirmation":    () => import("./templates/WlVenueRentalConfirmation"),
  "wl-booking-customer-confirmation": () => import("./templates/WlBookingCustomerConfirmation"),
  "event-created-host-notification":  () => import("./templates/EventCreatedHostNotification"),
  "paid-ticket-host-notification":    () => import("./templates/PaidTicketHostNotification"),
  "free-ticket-host-notification":    () => import("./templates/FreeTicketHostNotification"),
  "gatekeeper-event-wrap-recap":      () => import("./templates/GatekeeperWrap"),
  "event-host-report":                () => import("./templates/HostReport"),
  "message-attendance-broadcast":     () => import("./templates/MessageAttendanceBroadcast"),
  "host-invite-creation":             () => import("./templates/HostInviteCreation"),
  "tribe-card-request-notification":  () => import("./templates/TribeCardRequestNotification"),
  "wl-booking-admin-notification":    () => import("./templates/WlBookingAdminNotification"),
  "wl-venue-rental-team-notification": () => import("./templates/WlVenueRentalTeamNotification"),
  "catering-quote-team-notification": () => import("./templates/CateringQuoteTeamNotification"),
  "private-cacao-inquiry-team-notification": () => import("./templates/PrivateCacaoTeamNotification"),
  "contact-form-submission":          () => import("./templates/ContactFormSubmission"),
  "wl-review-submission-notification": () => import("./templates/WlReviewSubmission"),
  "summer-market-application-submission": () => import("./templates/SummerMarketApplication"),
  "summer-market-weekend-welcome":    () => import("./templates/SummerMarketWeekendWelcome"),
  "summer-market-schedule-change":    () => import("./templates/SummerMarketScheduleChange"),
  "shop-order-admin-notification":    () => import("./templates/ShopOrderAdminNotification"),
  "giftcard-purchase-admin-notification": () => import("./templates/GiftCardAdminNotification"),
  "5meals-card-admin-notification":   () => import("./templates/FiveMealsAdminNotification"),
  "access-request-notification":      () => import("./templates/AccessRequestNotification"),
  "error-notification-system":        () => import("./templates/ErrorNotification"),
  // Newly cataloged
  "private-space-request-customer":   () => import("./templates/PrivateSpaceRequestCustomer"),
  "private-space-request-admin":      () => import("./templates/PrivateSpaceRequestAdmin"),
  "private-space-approved":           () => import("./templates/PrivateSpaceApproved"),
  "private-space-declined":           () => import("./templates/PrivateSpaceDeclined"),
  "private-space-paid":               () => import("./templates/PrivateSpacePaid"),
  "tour-booking-confirmation":        () => import("./templates/TourBookingConfirmation"),
  "order-delivery-notification":      () => import("./templates/OrderDeliveryNotification"),
  // Final batch
  "summer-market-acceptance":         () => import("./templates/SummerMarketAcceptance"),
  "summer-market-rejection":          () => import("./templates/SummerMarketRejection"),
  "gatekeeper-walkin-receipt":        () => import("./templates/GatekeeperWalkinReceipt"),
  "custom-card-issued":               () => import("./templates/CustomCardIssued"),
  "custom-card-updated":              () => import("./templates/CustomCardUpdated"),
  // ── Private session (visiting practitioners) ──────────────────────────
  "private-session-booking-customer":  () => import("./templates/PrivateSessionBookingCustomer"),
  "private-session-booking-admin":     () => import("./templates/PrivateSessionBookingAdmin"),
  "private-session-waitlist-customer": () => import("./templates/PrivateSessionWaitlistCustomer"),
  "private-session-waitlist-admin":    () => import("./templates/PrivateSessionWaitlistAdmin"),
  "private-session-reminder-customer":      () => import("./templates/PrivateSessionReminderCustomer"),
  "private-session-needs-address-team":     () => import("./templates/PrivateSessionNeedsAddressTeam"),
  "private-session-day-of-no-address":      () => import("./templates/PrivateSessionDayOfNoAddress"),

  // ── Aliases: same template serves multiple manifest entries.
  //    These exist because the manifest distinguishes between flavours
  //    (e.g. comment → customer vs comment → admin, both rendered by the
  //    same template with a `direction` prop) while the hub UI lists each
  //    flavour separately. Routes call renderEmail() with the manifest id
  //    too, so this map stays the single source of truth.
  "wl-booking-comment-customer":       () => import("./templates/WlBookingCommentNotification"),
  "wl-booking-comment-admin":          () => import("./templates/WlBookingCommentNotification"),
  "wl-booking-field-update":           () => import("./templates/WlBookingFieldNotification"),
  "events-create-event-host":          () => import("./templates/EventCreatedHostNotification"),
  "saltpay-ticket-buyer-confirmation": () => import("./templates/PaidTicketAttendeeConfirmation"),
};

// Legacy preview adapters — for emails that haven't been rewritten as React
// Email templates yet, but where we've extracted the HTML-building into a
// pure function so the hub can preview EXACTLY what customers receive today.
// Each adapter module exports `renderHtml(props)` and `previewProps`.
// All legacy adapters have been retired — every email is now a real React
// Email template. Keeping this map here (empty) so the surrounding code
// (preview route, manifest helpers) doesn't break, and so we can re-introduce
// adapters later if a new email arrives that we want to ship as a quick
// preview before fully migrating.
export const ADAPTER_LOADERS = {};

export function getTemplateLoader(id) {
  return TEMPLATE_LOADERS[id] || null;
}

export function getAdapterLoader(id) {
  return ADAPTER_LOADERS[id] || null;
}
