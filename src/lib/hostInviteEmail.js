function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CLEANING_LIST_URL = "https://mama.is/cleaning-list";

export function buildHostInviteEmailText({
  inviteUrl,
  createEventUrl,
  manageEventsUrl,
}) {
  return `White Lotus

You are invited to host your event with us
We are excited to welcome you into the White Lotus event hosting flow.

Hi,

A warm welcome, and thank you for choosing to host your event with White Lotus. We're happy to have you with us.

You can use the links below to log in or register, and from there you can go directly to creating your event.

Create event
${inviteUrl}

Direct create event page
${createEventUrl}

Manage your events
${manageEventsUrl}

Cleaning checklist
${CLEANING_LIST_URL}

If you have any questions before publishing your event, simply reply to this email and our team will help you.

Warmly,
White Lotus
`;
}

export function buildHostInviteEmailHtml({
  inviteUrl,
  createEventUrl,
  manageEventsUrl,
}) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f7f4ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#20150f;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #eadfd2;">
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#1f5c4b,#12362d);color:#fff;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8;">White Lotus</p>
              <h1 style="margin:0;font-size:28px;font-weight:600;line-height:1.2;">You are invited to host your event with us</h1>
              <p style="margin:12px 0 0;font-size:15px;line-height:1.6;opacity:.92;">
                We are excited to welcome you into the White Lotus event hosting flow.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 32px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#2f241d;">
                Hi,
              </p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.75;color:#2f241d;">
                A warm welcome, and thank you for choosing to host your event with White Lotus. We&apos;re happy to have you with us.
              </p>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.75;color:#2f241d;">
                You can use the links below to log in or register, and from there you can go directly to creating your event.
              </p>

              <div style="margin:20px 0;padding:18px 20px;background:#f5faf8;border:1px solid #dbe7e2;border-radius:16px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#1f5c4b;">Create event</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#335248;">
                  Start here to log in or register and move directly into creating your event.
                </p>
                <div style="text-align:center;">
                <a href="${escapeHtml(
                  inviteUrl
                )}" style="display:inline-block;background:#1f5c4b;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 26px;border-radius:999px;">
                  Create Event
                </a>
                </div>
              </div>

              <div style="margin:20px 0;padding:18px 20px;background:#fbf7f1;border:1px solid #eadfd2;border-radius:16px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9a724d;">Manage your events</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4e4038;">
                  Once your event is live, use this page to review, edit, and keep track of your events in one place.
                </p>
                <div style="text-align:center;">
                  <a href="${escapeHtml(
                    manageEventsUrl
                  )}" style="display:inline-block;background:#1f5c4b;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 26px;border-radius:999px;">
                    Manage Events
                  </a>
                </div>
              </div>

              <div style="margin:20px 0;padding:18px 20px;background:#fff8f1;border:1px solid #e9d7c3;border-radius:16px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9a724d;">Cleaning checklist</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#4e4038;">
                  Before or after hosting, you can use this guide to understand the closing routine and how to leave the space ready for the next group.
                </p>
                <div style="text-align:center;">
                  <a href="${escapeHtml(
                    CLEANING_LIST_URL
                  )}" style="display:inline-block;background:#9a724d;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 26px;border-radius:999px;">
                    View Cleaning Checklist
                  </a>
                </div>
              </div>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#2f241d;">
                If you have any questions before publishing your event, simply reply to this email and our team will help you.
              </p>

              <p style="margin:0;font-size:15px;line-height:1.7;color:#2f241d;">
                Warmly,<br/>White Lotus
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
