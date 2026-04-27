// Tribe Card email templates
// ──────────────────────────
// Warm, on-brand HTML + plain-text versions of the two emails we send:
//
//   1. buildNewRequestEmail(...)      — to team@mama.is when a public
//                                        request arrives. Includes a direct
//                                        link into the admin dashboard.
//
//   2. buildWelcomeCardEmail(...)     — to the holder when their card is
//                                        approved. Shows the card visually
//                                        (discount %, expiry), with links
//                                        to the public token page and the
//                                        holder's profile.
//
// Palette mirrors the site's warm earthy palette (amber/emerald/cream)
// so the email looks like part of Mama, not a corporate receipt.

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(d) {
  if (!d) return "Unlimited";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function durationLabel(duration) {
  switch (duration) {
    case "month":
      return "Valid for one month";
    case "6months":
      return "Valid for six months";
    case "year":
      return "Valid for one year";
    case "unlimited":
      return "No expiration — yours to keep";
    default:
      return "";
  }
}

// ─── Team notification: new request arrived ────────────────────────────────
export function buildNewRequestEmail({ request, adminUrl }) {
  const { name, email, phone, message } = request;

  const text = `New Tribe Card request

Name:    ${name}
Email:   ${email}
Phone:   ${phone || "—"}
Message: ${message || "—"}

Review and approve:
${adminUrl}

— Mama`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f7f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#20150f;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #eadfd2;">
        <tr>
          <td style="padding:28px 32px;background:linear-gradient(135deg,#8a4a20,#5c2e12);color:#fff;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.85;">Mama · Admin</p>
            <h1 style="margin:0;font-size:26px;font-weight:600;line-height:1.25;">New Tribe Card request</h1>
            <p style="margin:10px 0 0;font-size:14px;line-height:1.6;opacity:.9;">Someone just asked for a Tribe Card. Details below — click through to approve or reject.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.7;color:#2f241d;">
              <tr><td style="padding:6px 0;width:110px;color:#8a7261;">Name</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(name)}</td></tr>
              <tr><td style="padding:6px 0;color:#8a7261;">Email</td><td style="padding:6px 0;">${escapeHtml(email)}</td></tr>
              <tr><td style="padding:6px 0;color:#8a7261;">Phone</td><td style="padding:6px 0;">${escapeHtml(phone || "—")}</td></tr>
              ${
                message
                  ? `<tr><td style="padding:10px 0;color:#8a7261;vertical-align:top;">Message</td><td style="padding:10px 0;color:#2f241d;">${escapeHtml(message)}</td></tr>`
                  : ""
              }
            </table>

            <div style="margin:24px 0 6px;text-align:center;">
              <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#8a4a20;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:999px;">Open in Admin</a>
            </div>
            <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#8a7261;">You can approve, reject, set the discount % and set the duration directly from the dashboard.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { text, html };
}

// ─── Holder welcome email ──────────────────────────────────────────────────
export function buildWelcomeCardEmail({
  card,
  publicCardUrl,
  profileUrl,
  walletPassUrl,
  walletBadgeUrl,
}) {
  const { holder_name, discount_percent, expires_at, duration_type } = card;
  const expiryLabel = expires_at ? formatDate(expires_at) : "No expiration";

  const text = `Welcome to the tribe, ${holder_name} —

Your Tribe Card is active.
Discount: ${discount_percent}% off food & drinks
${durationLabel(duration_type)}
${expires_at ? `Valid until: ${formatDate(expires_at)}` : ""}
${walletPassUrl ? `\nAdd to Apple Wallet:\n${walletPassUrl}\n` : ""}
See your card:
${publicCardUrl}

Or view it in your profile:
${profileUrl}

How to use it:
- When you pay, show your Tribe Card to the team — your discount is applied on the spot.
- Add the card to Apple Wallet so it's always one tap away on your iPhone.
- Or sign in at mama.is and your card lives in your profile, ready whenever you visit.

With love,
Mama Reykjavík`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <style>
    :root { color-scheme: light only; supported-color-schemes: light only; }
    /* Force light-mode colors even in dark-mode clients that auto-invert.
       Gmail/iOS Mail/Outlook dark-mode flip dark text on light bg to light
       text, which makes the card holder name disappear. These rules lock
       the warm earthy palette in place. */
    .tribe-card-name    { color:#2c1810 !important; }
    .tribe-card-discount{ color:#8a3a14 !important; }
    .tribe-card-expiry  { color:#2c1810 !important; }
    .tribe-card-label   { color:#8a7261 !important; }
    .tribe-card-eyebrow { color:#8a4a20 !important; }
    .tribe-card-sub     { color:#6a5040 !important; }
    @media (prefers-color-scheme: dark) {
      .tribe-card-name    { color:#2c1810 !important; }
      .tribe-card-discount{ color:#8a3a14 !important; }
      .tribe-card-expiry  { color:#2c1810 !important; }
      .tribe-card-label   { color:#8a7261 !important; }
      .tribe-card-eyebrow { color:#8a4a20 !important; }
      .tribe-card-sub     { color:#6a5040 !important; }
    }
    /* Gmail-specific dark-mode override */
    u + .body .tribe-card-name    { color:#2c1810 !important; }
    u + .body .tribe-card-discount{ color:#8a3a14 !important; }
    u + .body .tribe-card-expiry  { color:#2c1810 !important; }
  </style>
</head>
<body class="body" style="margin:0;padding:24px;background:#f5efe6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2c1810;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border-radius:22px;overflow:hidden;border:1px solid #eadfd2;">

        <!-- Header / warm welcome -->
        <tr>
          <td style="padding:34px 32px 22px;background:linear-gradient(135deg,#c76a2b 0%,#8a3a14 60%,#1f5c4b 140%);background-color:#8a3a14;color:#ffffff;">
            <p style="margin:0 0 10px;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#ffffff;opacity:.85;">Mama · Tribe</p>
            <h1 style="margin:0;font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:34px;line-height:1.18;color:#ffffff;">Welcome to the tribe</h1>
            <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#ffffff;opacity:.95;">Dear ${escapeHtml(holder_name)}, your Tribe Card is active. Thank you for being part of Mama — your presence is what makes this place warm.</p>
          </td>
        </tr>

        <!-- Card visual (inlined) -->
        <tr>
          <td style="padding:28px 32px 10px;" bgcolor="#ffffff">
            <div style="border-radius:18px;padding:24px 22px;background:linear-gradient(135deg,#fff6ea 0%,#fbe3cb 55%,#f1c9a0 100%);background-color:#fbe3cb;border:1px solid #eacfb0;position:relative;">
              <p class="tribe-card-eyebrow" style="margin:0 0 2px;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#8a4a20;">Tribe Card</p>
              <p class="tribe-card-name" style="margin:0 0 22px;font-family:Georgia,serif;font-style:italic;font-size:26px;font-weight:600;color:#2c1810;">${escapeHtml(holder_name)}</p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:bottom;">
                    <p class="tribe-card-label" style="margin:0;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#8a7261;">Your discount</p>
                    <p class="tribe-card-discount" style="margin:2px 0 0;font-family:Georgia,serif;font-weight:600;font-size:54px;line-height:1;color:#8a3a14;">${discount_percent}<span style="font-size:26px;vertical-align:top;margin-left:2px;">%</span></p>
                    <p class="tribe-card-sub" style="margin:4px 0 0;font-size:12px;color:#6a5040;">off food &amp; drinks</p>
                  </td>
                  <td style="vertical-align:bottom;text-align:right;">
                    <p class="tribe-card-label" style="margin:0;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#8a7261;">Valid until</p>
                    <p class="tribe-card-expiry" style="margin:2px 0 0;font-size:14px;color:#2c1810;font-weight:600;">${escapeHtml(expiryLabel)}</p>
                    <p class="tribe-card-label" style="margin:4px 0 0;font-size:11px;color:#8a7261;">${escapeHtml(durationLabel(duration_type))}</p>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        ${
          walletPassUrl && walletBadgeUrl
            ? `
        <!-- Apple Wallet -->
        <tr>
          <td style="padding:18px 32px 4px;">
            <div style="text-align:center;">
              <a href="${escapeHtml(walletPassUrl)}" style="display:inline-block;text-decoration:none;line-height:0;">
                <img src="${escapeHtml(walletBadgeUrl)}" alt="Add to Apple Wallet" width="165" height="50" style="display:inline-block;border:0;width:165px;height:50px;" />
              </a>
              <p style="margin:10px 0 0;font-size:12px;color:#6a5040;line-height:1.5;">Tap to add your card to Apple Wallet — always one tap away on your iPhone.</p>
            </div>
          </td>
        </tr>`
            : ""
        }

        <!-- Actions -->
        <tr>
          <td style="padding:14px 32px 6px;">
            <div style="text-align:center;">
              <a href="${escapeHtml(publicCardUrl)}" style="display:inline-block;margin:6px 6px;background:#c76a2b;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:999px;">Open your card</a>
              <a href="${escapeHtml(profileUrl)}" style="display:inline-block;margin:6px 6px;background:transparent;color:#2c1810;text-decoration:none;font-weight:600;font-size:15px;padding:12px 25px;border-radius:999px;border:1.5px solid #c76a2b;">View in profile</a>
            </div>
          </td>
        </tr>

        <!-- How to use -->
        <tr>
          <td style="padding:22px 32px 30px;">
            <div style="padding:18px 20px;background:#f7f4ef;border:1px solid #eadfd2;border-radius:14px;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8a4a20;">How to use it</p>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#2f241d;">When you pay, open your card on your profile at mama.is and show it to the team — your discount is applied on the spot.</p>
              <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#2f241d;">Your card lives in your Mama profile, ready whenever you visit.</p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#2f241d;">You can also bookmark your card link, or keep this email handy as a backup.</p>
            </div>
            <p style="margin:22px 0 0;font-size:14px;line-height:1.7;color:#2f241d;">With love,<br/><em style="font-family:Georgia,serif;">Mama Reykjavík</em></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { text, html };
}

// ─── Rejection (soft, optional) ────────────────────────────────────────────
export function buildRejectionEmail({ holder_name, reviewNotes }) {
  const text = `Hi ${holder_name},

Thank you so much for reaching out about a Tribe Card. After a careful look, we aren't able to issue one to you at this time.

${reviewNotes ? `A note from us: ${reviewNotes}\n\n` : ""}If you think there's been a mix-up, please reply to this email and we'll take another look.

With love,
Mama Reykjavík`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f7f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2c1810;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #eadfd2;">
        <tr><td style="padding:28px 30px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#8a4a20;">Mama · Tribe</p>
          <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:26px;color:#2c1810;">Thank you for writing</h1>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">Dear ${escapeHtml(holder_name)}, thank you so much for reaching out about a Tribe Card.</p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">After a careful look, we aren&#39;t able to issue one to you at this time.</p>
          ${
            reviewNotes
              ? `<div style="margin:14px 0;padding:14px 16px;background:#f7f4ef;border-radius:12px;border:1px solid #eadfd2;font-size:14px;line-height:1.7;">${escapeHtml(reviewNotes)}</div>`
              : ""
          }
          <p style="margin:14px 0 0;font-size:15px;line-height:1.7;">If you think there&#39;s been a mix-up, please just reply to this email and we&#39;ll take another look.</p>
          <p style="margin:20px 0 0;font-size:15px;line-height:1.7;">With love,<br/><em style="font-family:Georgia,serif;">Mama Reykjavík</em></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { text, html };
}
