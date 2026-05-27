// Automations manifest — single source of truth for /admin/automations.
// ─────────────────────────────────────────────────────────────────────
// Catalogs every automatic thing that runs in the system: scheduled jobs
// (cron), webhook callbacks (third-party systems POST to us), and admin
// actions that fan out to side-effects.
//
// To add a new automation, drop an entry here. The hub renders it
// automatically. Each entry just describes — the actual logic lives in
// its sourceFile.

export const AUTOMATION_GROUPS = [
  { id: "cron",         label: "Scheduled (Cron)", order: 1 },
  { id: "webhook",      label: "Webhooks",         order: 2 },
  { id: "admin-action", label: "Admin actions",    order: 3 },
];

// Helper to convert a cron expression to a human-readable line.
// We only need to handle the simple `0 H * * *` (daily-at-HH:00) shape for now.
export function describeCron(expr) {
  if (!expr) return "";
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return expr;
  const [m, h, dom, mon, dow] = parts;
  if (m === "0" && /^\d+$/.test(h) && dom === "*" && mon === "*" && dow === "*") {
    return `Daily at ${h.padStart(2, "0")}:00 UTC`;
  }
  return expr;
}

export const AUTOMATION_MANIFEST = [
  // ── Scheduled (Vercel cron, registered in vercel.json) ──────────────
  {
    id: "cron-process-monthly-credits",
    name: "Process Monthly Credits",
    group: "cron",
    schedule: "0 2 * * *",
    cronPath: "/api/cron/process-monthly-credits",
    summary:
      "Charges every active auto_credit_subscription whose next_payment_date is today-or-earlier. Handles multi-month overdue catch-up.",
    sideEffects: [
      "Inserts row in mama_coins ledger per cycle credited",
      "Calls Teya RPG (MIT) using stored MultiToken to actually charge the card",
      "Bumps next_payment_date forward by one month per successful cycle",
    ],
    sourceFile: "src/app/api/cron/process-monthly-credits/route.js",
  },
  {
    id: "cron-renew-memberships",
    name: "Renew Memberships",
    group: "cron",
    schedule: "0 3 * * *",
    cronPath: "/api/cron/renew-memberships",
    summary:
      "Finds Tribe memberships due for renewal (or in grace with a retry due) and charges via Teya RPG MIT using the MultiToken from signup.",
    sideEffects: [
      "Emails: Renewal Succeeded / Renewal Failed (Retry) / Final Failed / No Card",
      "Updates membership_subscriptions status: active | grace_period | past_due | paused",
      "Logs to membership_payment_events",
      "Delegates per-sub state to renewOne() in @/lib/membershipRenew (admin Retry button uses same code)",
    ],
    sourceFile: "src/app/api/cron/renew-memberships/route.js",
  },
  {
    id: "cron-renew-private-space",
    name: "Renew Private Space",
    group: "cron",
    schedule: "0 4 * * *",
    cronPath: "/api/cron/renew-private-space",
    summary:
      "Daily charge of weekly Private Space recurring rentals. Uses MultiToken minted from the SecurePay VCN at first run. Scheduled at 04:00 to avoid overlap with the membership cron.",
    sideEffects: [
      "Calls Teya RPG MIT for each active private_space_subscription",
      "Emails the renter on success / failure",
      "Updates next_charge_at + failed_charge_count",
      "Per-sub logic lives in renewPrivateSpaceOne() in @/lib/private-space/renew",
    ],
    sourceFile: "src/app/api/cron/renew-private-space/route.js",
  },
  {
    id: "cron-run-workflows",
    name: "Run Workflows",
    group: "cron",
    schedule: "*/15 * * * *",
    cronPath: "/api/cron/run-workflows",
    summary:
      "Picks up pending and waiting workflow_runs (from the visual Workflow Designer) and advances each one through its graph until it hits the next wait, finishes, or fails. The actual automation engine.",
    sideEffects: [
      "Reads enabled workflows + ready workflow_runs from Supabase",
      "Executes step actions: send_email (via /emails/render.server) and send_to_self (via Resend)",
      "Updates each run's status (waiting/done/error) + next_check_at",
      "Walks edges, evaluates condition branches against the trigger payload",
    ],
    sourceFile: "src/app/api/cron/run-workflows/route.js",
  },
  {
    id: "cron-gatekeeper-wraps",
    name: "Gatekeeper Recap Emails",
    group: "cron",
    schedule: "0 9 * * *",
    cronPath: "/api/cron/gatekeeper-wraps",
    summary:
      "Sends the post-event recap to hosts whose event finished in the last ~36h AND whose gatekeeper kiosk was actually activated. Idempotent via gatekeeper_configs.wrap_sent_at.",
    sideEffects: [
      "Sends Event Wrap-Up Recap email (template: gatekeeper-event-wrap-recap)",
      "Sets wrap_sent_at on gatekeeper_configs so it doesn't re-send",
    ],
    sourceFile: "src/app/api/cron/gatekeeper-wraps/route.js",
  },
  {
    id: "cron-draft-weekly-newsletter",
    name: "Draft Weekly Newsletter",
    group: "cron",
    schedule: "0 11 * * 1",
    cronPath: "/api/cron/draft-weekly-newsletter",
    summary:
      "Builds the Monday newsletter draft from upcoming events and emails team@mama.is a preview with one-click Send it / Edit first buttons. Re-runs are idempotent per Monday (unique index on send_date).",
    sideEffects: [
      "Inserts row in newsletter_drafts (one per Monday)",
      "Sends preview email to team@mama.is",
      "Mama clicks Send it → /api/newsletter/approve calls Resend Broadcasts API",
    ],
    sourceFile: "src/app/api/cron/draft-weekly-newsletter/route.js",
  },

  // ── Payment webhooks (Teya / SaltPay → us) ──────────────────────────
  {
    id: "webhook-saltpay-tickets",
    name: "Ticket Payment Success (Online)",
    group: "webhook",
    triggerSummary: "Teya POSTs after a customer pays for an event ticket online",
    summary:
      "Validates HMAC, marks the ticket paid, stamps the refundid for future refunds, and sends both buyer confirmation + host notification.",
    sideEffects: [
      "Emails: Paid Ticket Confirmation (buyer) + Paid Ticket Reg Host",
      "Capacity check — cancels the ticket if oversold (admin must refund manually in Teya portal)",
      "Stores raw HPP payload in tickets.payment_payload for audit",
    ],
    sourceFile: "src/app/api/saltpay/success-server/route.js",
  },
  {
    id: "webhook-saltpay-shop",
    name: "Shop Order Paid",
    group: "webhook",
    triggerSummary: "Teya POSTs after a shop order checkout succeeds",
    summary:
      "Marks the order paid, inserts order_items rows, decrements product stock, sends buyer confirmation + admin notification.",
    sideEffects: [
      "Emails: Shop Order Confirmation (buyer) + Shop Order Admin",
      "Updates products.stock for each line item",
    ],
    sourceFile: "src/app/api/saltpay/shop/success-server/route.js",
  },
  {
    id: "webhook-saltpay-giftcard",
    name: "Gift Card Paid",
    group: "webhook",
    triggerSummary: "Teya POSTs after a gift card purchase succeeds",
    summary:
      "Marks the gift card paid, generates the magic-link access token, sends buyer + admin emails.",
    sideEffects: [
      "Emails: Gift Card Purchase (buyer) + Gift Card Admin",
      "Sets gift_cards.status=paid + sent_at for email delivery method",
    ],
    sourceFile: "src/app/api/saltpay/giftcard/success-server/route.js",
  },
  {
    id: "webhook-saltpay-5meals",
    name: "5 Meals Card Paid",
    group: "webhook",
    triggerSummary: "Teya POSTs after a 5-Meals card purchase succeeds",
    summary:
      "Marks the meal card paid and sends buyer + admin emails.",
    sideEffects: [
      "Emails: 5 Meals for Winter Card (buyer) + 5 Meals Admin",
    ],
    sourceFile: "src/app/api/saltpay/5-meals/success-server/route.js",
  },
  {
    id: "webhook-saltpay-tours",
    name: "Tour Booking Paid",
    group: "webhook",
    triggerSummary: "Teya POSTs after a tour booking payment succeeds",
    summary:
      "Marks the tour_booking paid and emails the customer the brand-styled confirmation with meeting point + what to bring.",
    sideEffects: ["Emails: Tour Booking Confirmation"],
    sourceFile: "src/app/api/tours/success-server/route.js",
  },
  {
    id: "webhook-saltpay-private-space",
    name: "Private Space Paid (One-Off)",
    group: "webhook",
    triggerSummary: "Teya POSTs after a Private Space booking is paid",
    summary:
      "Verifies hash, marks booking confirmed, captures the VCN for recurring bookings, sends the customer the 'you're booked' confirmation.",
    sideEffects: [
      "Emails: Private Space Paid",
      "For recurring bookings: creates a private_space_subscriptions row (cron picks it up monthly)",
      "Stamps refundid for future refunds",
    ],
    sourceFile: "src/app/api/private-space/securepay-callback/route.js",
  },
  {
    id: "webhook-saltpay-membership",
    name: "Membership Signup Paid",
    group: "webhook",
    triggerSummary: "Teya POSTs after the initial Tribe membership checkout",
    summary:
      "Activates the membership, captures the MultiToken (for the daily renewal cron), sends the welcome receipt.",
    sourceFile: "src/app/api/membership/saltpay-callback/route.js",
  },
  {
    id: "webhook-saltpay-cancel",
    name: "Payment Cancelled",
    group: "webhook",
    triggerSummary: "Teya POSTs when the customer cancels at the payment screen",
    summary:
      "Marks the pending order as cancelled. No email — customer is already on the cancel page.",
    sourceFile: "src/app/api/saltpay/cancel/route.js",
  },
  {
    id: "webhook-saltpay-error",
    name: "Payment Error",
    group: "webhook",
    triggerSummary: "Teya POSTs when the gateway encounters an error",
    summary:
      "Marks the pending order as failed and logs the error code from Teya.",
    sourceFile: "src/app/api/saltpay/error/route.js",
  },

  // ── Admin actions with side-effects ─────────────────────────────────
  {
    id: "admin-private-space-decision",
    name: "Private Space Approve / Decline",
    group: "admin-action",
    triggerSummary: "Admin clicks Approve or Decline on a pending Private Space request",
    summary:
      "Approve: generates a SecurePay checkout URL + emails the customer the payment link. Decline: marks declined + emails the customer the reason.",
    sideEffects: [
      "Emails: Private Space Approved (with pay link) OR Private Space Declined",
      "Sets private_space_bookings.status = approved | declined",
      "Stores securepay_orderid for the callback to match against",
    ],
    sourceFile: "src/app/api/private-space/admin/decision/route.js",
  },
  {
    id: "admin-tribe-card-decision",
    name: "Tribe Card Approve / Reject",
    group: "admin-action",
    triggerSummary: "Admin clicks Approve or Reject on a pending Tribe Card request",
    summary:
      "Approve: creates the tribe_cards row, generates Apple/Google Wallet passes when configured, sends welcome email. Reject (opt-in): sends a soft rejection email with optional reviewer note.",
    sideEffects: [
      "Emails: Tribe Card Welcome (with optional .pkpass attachment) OR Tribe Card Rejection",
      "Inserts/updates tribe_cards (upsert on holder_email)",
    ],
    sourceFile: "src/app/api/admin/tribe-cards/requests/[id]/route.js",
  },
  {
    id: "admin-order-delivery-email",
    name: "Send Order Delivery Email",
    group: "admin-action",
    triggerSummary: "Admin clicks 'Send delivery email' on a paid shop order with delivery=true",
    summary:
      "Sends the brand-styled 'your order is on its way' email to the customer. Idempotent — gates on orders.delivery_notification_sent_at so it can only fire once per order.",
    sourceFile: "src/app/api/admin/orders/send-delivery-email/route.js",
  },
  {
    id: "admin-custom-card-issue",
    name: "Issue or Resend Custom Card",
    group: "admin-action",
    triggerSummary: "Admin creates a custom card (with send_email) or clicks resend on an existing one",
    summary:
      "Sends the brand-styled card email with the magic-link access URL. Used by both the initial create (POST /admin/custom-cards) and the explicit re-send (POST /admin/custom-cards/send-email/[id]).",
    sideEffects: [
      "Emails: Custom Card Issued",
      "Sets custom_cards.email_sent=true + sent_at",
    ],
    sourceFile: "src/app/api/admin/custom-cards/send-email/[id]/route.js",
  },
  {
    id: "admin-summer-market-decision",
    name: "Summer Market Accept / Reject",
    group: "admin-action",
    triggerSummary: "Admin accepts or rejects a Summer Market vendor application",
    summary:
      "Accept: emails the applicant with the pricing block (computed by @/lib/summerMarketPricing), bank details, and terms link. Reject: emails the applicant with an optional reviewer note.",
    sideEffects: [
      "Emails: Summer Market Acceptance OR Rejection",
      "Stores admin_meta + accepted_at / accepted_by on summer_market_vendor_applications",
    ],
    sourceFile: "src/app/api/admin/summer-market/applications/[id]/route.js",
  },
];

// ── Convenience accessors ──────────────────────────────────────────────

export function getAutomationById(id) {
  return AUTOMATION_MANIFEST.find((a) => a.id === id) || null;
}

export function getAutomationsByGroup() {
  return AUTOMATION_GROUPS
    .map((g) => ({
      ...g,
      items: AUTOMATION_MANIFEST
        .filter((a) => a.group === g.id)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.order - b.order);
}

export function countAutomations() {
  const counts = { total: AUTOMATION_MANIFEST.length };
  for (const a of AUTOMATION_MANIFEST) {
    counts[a.group] = (counts[a.group] || 0) + 1;
  }
  return counts;
}
