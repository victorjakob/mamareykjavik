// Weekly newsletter HTML renderer.
// Used by the Monday cron route and the edit page so the rendered HTML stays
// in lock-step with what subscribers will receive.
//
// Pure function: takes data, returns an HTML string. No side-effects.
// Dark editorial brand, same family as WelcomeNewsletter.jsx.

import "server-only";

const COLORS = {
  pageBg: "#1a1208",
  cardBg: "#1e1610",
  footerBg: "#17100a",
  approveBg: "#241809",
  heading: "#f0ebe3",
  body: "#c0b4a8",
  muted: "#9a8e82",
  orange: "#ff914d",
};

const FONT_SERIF =
  "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const FONT_SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Atlantic/Reykjavik",
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
}

/**
 * Build the next-upcoming-Monday date in YYYY-MM-DD (Reykjavik tz).
 */
export function nextMondayIso() {
  const tz = "Atlantic/Reykjavik";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year").value;
  const m = parts.find((p) => p.type === "month").value;
  const d = parts.find((p) => p.type === "day").value;
  const today = new Date(`${y}-${m}-${d}T00:00:00Z`);
  const daysUntilMonday = (1 - today.getUTCDay() + 7) % 7;
  const monday = new Date(today);
  monday.setUTCDate(monday.getUTCDate() + daysUntilMonday);
  return monday.toISOString().slice(0, 10);
}

/**
 * Render a single event card.
 */
function eventCard(ev, appUrl) {
  const eventUrl = ev.slug ? `${appUrl}/events/${ev.slug}` : appUrl;
  const imgBlock = ev.image
    ? `<tr><td style="padding:0 0 22px 0;"><a href="${escapeHtml(eventUrl)}" style="text-decoration:none;"><img src="${escapeHtml(ev.image)}" width="512" alt="" style="display:block; width:100%; max-width:512px; height:auto; border-radius:6px; border:0;" /></a></td></tr>`
    : "";
  const priceLine =
    ev.price && Number(ev.price) > 0
      ? `${escapeHtml(ev.price)} ISK`
      : ev.sold_out
        ? "Sold out"
        : "Free";
  const desc = ev.sensory_line || ev.shortdescription || "";
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
    <tr>
      <td align="center" style="padding:0 44px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; max-width:512px;">
          ${imgBlock}
          <tr>
            <td style="padding:0 0 8px 0;">
              <div style="font-family:${FONT_SANS}; font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:${COLORS.orange};">${escapeHtml(fmtDate(ev.date))}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 12px 0;">
              <div style="font-family:${FONT_SERIF}; font-style:italic; font-weight:600; font-size:26px; line-height:1.2; color:${COLORS.heading};">${escapeHtml(ev.name || "Event")}</div>
            </td>
          </tr>
          ${desc ? `<tr><td style="padding:0 0 14px 0;"><div style="font-family:${FONT_SANS}; font-size:15px; line-height:1.7; color:${COLORS.body};">${escapeHtml(desc)}</div></td></tr>` : ""}
          <tr>
            <td style="padding:0 0 16px 0;">
              <div style="font-family:${FONT_SANS}; font-size:13px; color:${COLORS.muted};">${escapeHtml(ev.location || "Bankastræti 2, 101 Reykjavík")} &middot; ${priceLine}</div>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:${COLORS.orange}; border-radius:4px;"><a href="${escapeHtml(eventUrl)}" style="display:inline-block; padding:12px 26px; font-family:${FONT_SANS}; font-size:13px; font-weight:600; letter-spacing:0.4px; color:${COLORS.pageBg}; text-decoration:none;">More &amp; tickets</a></td></tr></table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

/**
 * Build the full newsletter HTML.
 *
 * @param {object} opts
 * @param {string} opts.introNote        - Editable intro line above the events.
 * @param {Array<object>} opts.events    - Event rows (with optional sensory_line override per event).
 * @param {string} opts.appUrl           - e.g. https://mama.is
 * @param {string} [opts.approveUrl]     - Send-it link (only when showApproveBar is true).
 * @param {string} [opts.editUrl]        - Edit-first link (only when showApproveBar is true).
 * @param {boolean} [opts.showApproveBar] - True for the preview email; false for the live broadcast.
 */
export function renderNewsletterHtml({
  introNote,
  events,
  appUrl = "https://mama.is",
  approveUrl,
  editUrl,
  showApproveBar = false,
}) {
  const eventsHtml = (events || []).map((e) => eventCard(e, appUrl)).join("\n");
  const approveBar =
    showApproveBar && approveUrl && editUrl
      ? `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.approveBg};">
    <tr>
      <td align="center" style="padding:18px 16px;">
        <div style="font-family:${FONT_SANS}; font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:${COLORS.orange}; margin-bottom:12px;">This is your Monday preview</div>
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="background-color:${COLORS.orange}; border-radius:4px; padding:0;">
            <a href="${escapeHtml(approveUrl)}" style="display:inline-block; padding:14px 30px; font-family:${FONT_SANS}; font-size:14px; font-weight:700; letter-spacing:0.4px; color:${COLORS.pageBg}; text-decoration:none;">Send it</a>
          </td>
          <td style="width:10px;"></td>
          <td style="background-color:transparent; border:1px solid ${COLORS.orange}; border-radius:4px;">
            <a href="${escapeHtml(editUrl)}" style="display:inline-block; padding:13px 28px; font-family:${FONT_SANS}; font-size:14px; font-weight:600; letter-spacing:0.4px; color:${COLORS.orange}; text-decoration:none;">Edit first</a>
          </td>
        </tr></table>
      </td>
    </tr>
  </table>`
      : "";
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>This Monday at Mama</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background-color:${COLORS.pageBg}; -webkit-text-size-adjust:100%;">
  ${approveBar}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.pageBg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background-color:${COLORS.cardBg};">
          <tr><td align="center" style="padding:58px 44px 0 44px;">
            <div style="font-family:${FONT_SERIF}; font-size:42px; font-weight:600; letter-spacing:1px; color:${COLORS.heading};">Mama</div>
            <div style="font-family:${FONT_SANS}; font-size:10px; font-weight:600; letter-spacing:4px; color:${COLORS.muted}; padding-top:13px;">REYKJAVÍK</div>
          </td></tr>
          <tr><td align="center" style="padding:32px 44px 0 44px;">
            <div style="font-family:Georgia,'Times New Roman',serif; font-size:13px; line-height:13px; color:${COLORS.orange};">&#10022;</div>
          </td></tr>
          <tr><td align="center" style="padding:30px 44px 0 44px;">
            <div style="font-family:${FONT_SANS}; font-size:11px; font-weight:600; letter-spacing:3px; color:${COLORS.orange};">THIS WEEK</div>
          </td></tr>
          <tr><td align="center" style="padding:13px 44px 0 44px;">
            <div style="font-family:${FONT_SERIF}; font-style:italic; font-weight:600; font-size:37px; line-height:1.2; color:${COLORS.heading};">A few things at the table</div>
          </td></tr>
          <tr><td align="center" style="padding:24px 44px 36px 44px;">
            <p style="font-family:${FONT_SANS}; font-size:16px; line-height:1.75; color:${COLORS.body}; margin:0; text-align:center;">${escapeHtml(introNote || "")}</p>
          </td></tr>
          ${eventsHtml || `<tr><td align="center" style="padding:0 44px 36px 44px;"><p style="font-family:${FONT_SANS}; font-size:15px; line-height:1.75; color:${COLORS.body}; margin:0; text-align:center;">Quiet week. We will be back next Monday.</p></td></tr>`}
          <tr><td align="center" style="padding:8px 44px 36px 44px;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:${COLORS.orange}; border-radius:4px;">
              <a href="${escapeHtml(appUrl)}/events" style="display:inline-block; padding:15px 36px; font-family:${FONT_SANS}; font-size:14px; font-weight:600; letter-spacing:0.4px; color:${COLORS.pageBg}; text-decoration:none;">See all events</a>
            </td></tr></table>
          </td></tr>
          <tr><td align="center" style="background-color:${COLORS.footerBg}; padding:34px 44px;">
            <div style="font-family:Georgia,'Times New Roman',serif; font-size:12px; line-height:12px; color:${COLORS.orange}; padding-bottom:18px;">&#10022;</div>
            <p style="font-family:${FONT_SANS}; font-size:11px; line-height:1.9; color:${COLORS.muted}; margin:0; text-align:center;">
              Mama Reykjavík &middot; Bankastræti 2 &middot; 101 Reykjavík &middot; team@mama.is<br>
              <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${COLORS.orange}; text-decoration:underline;">Unsubscribe in one click</a>
            </p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Group recurring series so each appears once (earliest occurrence).
 */
export function dedupeRecurringSeries(events) {
  const seen = new Set();
  const out = [];
  for (const ev of events || []) {
    const key = ev.series_id || ev.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ev);
  }
  return out;
}
