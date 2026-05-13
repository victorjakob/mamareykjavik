// Workflow catalog — what triggers and actions the designer offers.
// ─────────────────────────────────────────────────────────────────
// Triggers fire workflows. Actions are what flows DO. Each entry is
// self-describing so the UI can render the right form fields when the
// admin picks one.
//
// Keep this file flat data + no React. The runner imports it server-side,
// the designer imports it client-side.

// ── Trigger types ────────────────────────────────────────────────
//
// A workflow has exactly one trigger. The `kind` determines how it fires:
//   schedule — Vercel cron pings /api/cron/run-workflows; flows whose
//              schedule matches today get triggered. Useful for "every
//              day at 9am check X" flows.
//   event    — Code hooks call fireWorkflowEvent(eventId, payload) from
//              specific points (e.g. after a tribe card is created).
//              Flows listening for that event get an instance run.
//   manual   — Admin clicks "Run" from the workflow detail page.
export const TRIGGER_TYPES = [
  {
    id: "schedule",
    label: "On a schedule",
    description: "Run on a recurring cadence (daily / weekly / a specific cron).",
    fields: [
      {
        key: "schedule",
        label: "Cron expression",
        type: "text",
        placeholder: "0 9 * * *",
        hint: "Standard cron — m h dom mon dow",
      },
    ],
  },
  {
    id: "event",
    label: "When something happens",
    description:
      "Fire when a specific event happens in the system (a signup, a payment, etc).",
    fields: [
      {
        key: "event",
        label: "Event",
        type: "select",
        options: () => WORKFLOW_EVENTS.map((e) => ({ value: e.id, label: e.label })),
      },
    ],
  },
  {
    id: "manual",
    label: "Manual",
    description:
      "Only runs when an admin clicks Run. Good for ad-hoc broadcasts.",
    fields: [],
  },
];

// Events that code can fire to trigger workflows. Add a new entry here AND
// call fireWorkflowEvent() at the corresponding point in the route to make
// it real. Until a code hook is wired, the trigger is selectable but inert.
export const WORKFLOW_EVENTS = [
  {
    id: "tribe_card_created",
    label: "Tribe Card created",
    description: "A new Tribe Card was issued (admin approval).",
    payloadShape: { holder_name: "string", holder_email: "string", expires_at: "iso-date" },
  },
  {
    id: "tribe_card_expiring_soon",
    label: "Tribe Card expiring in 3 days",
    description: "Fired by the daily checker for cards with expires_at in 3 days.",
    payloadShape: { holder_name: "string", holder_email: "string", expires_at: "iso-date" },
  },
  {
    id: "membership_started",
    label: "Tribe membership started",
    description: "New paid Tribe subscription activated.",
    payloadShape: { member_name: "string", member_email: "string", tier: "string" },
  },
  {
    id: "membership_cancelled",
    label: "Tribe membership cancelled",
    description: "A member opted out of their subscription.",
    payloadShape: { member_name: "string", member_email: "string" },
  },
  {
    id: "event_attended",
    label: "Event attended",
    description: "An attendee was checked in at the door (gatekeeper kiosk).",
    payloadShape: { buyer_name: "string", buyer_email: "string", event_name: "string", event_date: "iso-date" },
  },
  {
    id: "event_ended",
    label: "Event ended (1 day later)",
    description: "Fired by the daily checker, 24h after an event's end_time.",
    payloadShape: { event_name: "string", event_date: "iso-date" },
  },
  {
    id: "shop_order_paid",
    label: "Shop order paid",
    description: "A shop checkout succeeded via SaltPay.",
    payloadShape: { buyer_email: "string", order_id: "string", amount: "number" },
  },
];

// ── Step types (the boxes you drag onto the canvas) ──────────────
//
// Every step has a `type`. The runner switches on type to execute it.
//   wait      — pause N units (hours/days/weeks) before the next step
//   condition — branch; "then" edge if the check passes, "else" if not
//   action    — actually DO something (send email, etc.)
//
// Each step's `config` shape is defined in `fields` below.
export const STEP_TYPES = [
  {
    id: "wait",
    label: "Wait",
    description: "Pause the flow for some time before the next step.",
    fields: [
      {
        key: "amount",
        label: "Amount",
        type: "number",
        placeholder: "1",
      },
      {
        key: "unit",
        label: "Unit",
        type: "select",
        options: [
          { value: "hours", label: "hours" },
          { value: "days", label: "days" },
          { value: "weeks", label: "weeks" },
        ],
      },
    ],
  },
  {
    id: "condition",
    label: "If / Else",
    description: "Branch the flow based on a value in the trigger payload.",
    fields: [
      {
        key: "path",
        label: "Property path",
        type: "text",
        placeholder: "tier",
        hint: "Dot path into the trigger payload, e.g. \"tier\" or \"member.country\".",
      },
      {
        key: "op",
        label: "Comparison",
        type: "select",
        options: [
          { value: "eq",       label: "equals" },
          { value: "ne",       label: "not equals" },
          { value: "contains", label: "contains" },
          { value: "exists",   label: "is set" },
        ],
      },
      {
        key: "value",
        label: "Value",
        type: "text",
        placeholder: "tribe",
        hint: "Leave blank when using 'is set'.",
      },
    ],
  },
  {
    id: "action",
    label: "Do something",
    description: "Run an action. Pick which one and configure its inputs.",
    fields: [
      {
        key: "action",
        label: "Action",
        type: "select",
        options: () => WORKFLOW_ACTIONS.map((a) => ({ value: a.id, label: a.label })),
      },
      // Per-action fields render below this in the designer; see WORKFLOW_ACTIONS.
    ],
  },
];

// ── Actions catalog ──────────────────────────────────────────────
//
// What the designer can DO. Each entry has its own field list. Some
// reference recipients/templates from the email manifest; others touch
// Supabase rows.
//
// Variables in text fields support {{path.into.payload}} substitution at
// runtime. For example "Hi {{holder_name}}".
export const WORKFLOW_ACTIONS = [
  {
    id: "send_email",
    label: "Send email",
    description: "Render an existing template from the email hub and send it.",
    fields: [
      {
        key: "templateId",
        label: "Template",
        type: "select",
        // The designer will resolve this list against the email manifest.
        optionsSource: "email-templates",
      },
      {
        key: "to",
        label: "To (email or {{path}})",
        type: "text",
        placeholder: "{{holder_email}}",
      },
      {
        key: "subjectOverride",
        label: "Subject override (optional)",
        type: "text",
        placeholder: "Leave blank to use the template's default",
      },
    ],
  },
  {
    id: "send_to_self",
    label: "Notify the team",
    description: "Send a quick internal email to team@mama.is (or whoever).",
    fields: [
      {
        key: "to",
        label: "Recipient",
        type: "text",
        placeholder: "team@mama.is",
      },
      {
        key: "subject",
        label: "Subject",
        type: "text",
      },
      {
        key: "body",
        label: "Body",
        type: "textarea",
      },
    ],
  },
  {
    id: "log_only",
    label: "Log only (no side-effect)",
    description: "Write a row to workflow_runs.result. Useful for testing.",
    fields: [
      { key: "message", label: "Message", type: "text" },
    ],
  },
];

export function getStepType(id) {
  return STEP_TYPES.find((s) => s.id === id) || null;
}
export function getTriggerType(id) {
  return TRIGGER_TYPES.find((t) => t.id === id) || null;
}
export function getAction(id) {
  return WORKFLOW_ACTIONS.find((a) => a.id === id) || null;
}
export function getEvent(id) {
  return WORKFLOW_EVENTS.find((e) => e.id === id) || null;
}
