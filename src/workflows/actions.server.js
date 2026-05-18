// Workflow action dispatchers.
// ─────────────────────────────────────────────────────────────────
// One function per action id from src/workflows/catalog.js. The runner
// calls runAction(actionId, config, context) and we return a small result
// object that gets folded into workflow_runs.result.
//
// All handlers are best-effort: a failure here turns into the run's
// `error` field but doesn't crash the cron — the runner catches.
//
// Variable substitution: any string field can include {{path.into.payload}}
// segments which we resolve against the run's `context` (trigger payload).

import "server-only";
import { renderEmail } from "@/emails/render.server";
import { createResend } from "@/lib/resend";

const FROM_DEFAULT = "Mama Reykjavík <hello@mamareykjavik.is>";
const TEAM_DEFAULT = "team@mamareykjavik.is";

// ── Variable substitution ────────────────────────────────────────
// {{foo.bar}} → context.foo.bar. Missing paths → empty string (so
// templates don't render literal "{{undefined}}" garbage).
export function substitute(value, context) {
  if (typeof value !== "string") return value;
  return value.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
    const v = path.split(".").reduce(
      (acc, key) => (acc == null ? undefined : acc[key]),
      context,
    );
    return v == null ? "" : String(v);
  });
}

// Recursively substitute strings in an object — handy for nested config.
export function substituteDeep(obj, context) {
  if (obj == null) return obj;
  if (typeof obj === "string") return substitute(obj, context);
  if (Array.isArray(obj)) return obj.map((x) => substituteDeep(x, context));
  if (typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = substituteDeep(v, context);
    return out;
  }
  return obj;
}

// ── send_email ────────────────────────────────────────────────────
// Renders a template from the email manifest and posts to Resend.
async function sendEmail(config, context) {
  const cfg = substituteDeep(config || {}, context);
  if (!cfg.templateId) return { ok: false, error: "send_email: templateId missing" };
  if (!cfg.to)         return { ok: false, error: "send_email: 'to' missing" };

  const { html, text, subject: defaultSubject } = await renderEmail(
    cfg.templateId,
    context, // pass the whole payload as props — template picks what it needs
  );

  const resend = createResend();
  const { error } = await resend.emails.send({
    from: cfg.from || FROM_DEFAULT,
    to: cfg.to,
    subject: cfg.subjectOverride || defaultSubject || "Mama Reykjavík",
    html,
    text,
  });

  if (error) return { ok: false, error: String(error?.message || error) };
  return {
    ok: true,
    sent: { to: cfg.to, templateId: cfg.templateId, subject: cfg.subjectOverride || defaultSubject },
  };
}

// ── send_to_self ──────────────────────────────────────────────────
// Plain internal notification. No template — body is admin-authored text.
async function sendToSelf(config, context) {
  const cfg = substituteDeep(config || {}, context);
  const to = cfg.to || TEAM_DEFAULT;
  const subject = cfg.subject || "Workflow notification";
  const body = cfg.body || "(no body)";

  const resend = createResend();
  const { error } = await resend.emails.send({
    from: FROM_DEFAULT,
    to,
    subject,
    text: body,
    html: `<pre style="font-family:ui-sans-serif,system-ui,sans-serif;white-space:pre-wrap;">${escapeHtml(body)}</pre>`,
  });
  if (error) return { ok: false, error: String(error?.message || error) };
  return { ok: true, sent: { to, subject } };
}

// ── log_only ──────────────────────────────────────────────────────
// No side-effect — just records to workflow_runs.result. Great for
// dry-running a flow before flipping on the real action.
async function logOnly(config, context) {
  const cfg = substituteDeep(config || {}, context);
  return { ok: true, logged: cfg.message || "(no message)" };
}

const DISPATCH = {
  send_email: sendEmail,
  send_to_self: sendToSelf,
  log_only: logOnly,
};

export async function runAction(actionId, config, context) {
  const fn = DISPATCH[actionId];
  if (!fn) return { ok: false, error: `Unknown action: ${actionId}` };
  try {
    return await fn(config, context);
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
}

// ── Condition evaluator (used by runner, kept here for proximity) ──
export function evaluateCondition(condition, context) {
  if (!condition) return false;
  const { path, op, value } = condition;
  if (!path) return false;
  const actual = path.split(".").reduce(
    (acc, key) => (acc == null ? undefined : acc[key]),
    context,
  );
  switch (op) {
    case "eq":       return String(actual) === String(value);
    case "ne":       return String(actual) !== String(value);
    case "contains": return typeof actual === "string" && actual.includes(String(value || ""));
    case "exists":   return actual != null && actual !== "";
    default:         return false;
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
