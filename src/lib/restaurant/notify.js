import "server-only";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

/**
 * Telling people about a table booking.
 *
 * Both callers — the public form and the till's API — go through here, so a
 * booking taken over the counter is confirmed to the guest in exactly the same
 * words as one taken on the website.
 *
 * Nothing in here is allowed to fail a booking. The booking is already in the
 * database by the time this runs; an email that does not send is a thing to
 * fix, not a reason to tell a guest their table was not taken. So every path
 * catches, logs and returns.
 */

const FROM = "Mama Reykjavík <team@mama.is>";
const TEAM = process.env.RESTAURANT_TEAM_EMAIL || "team@mama.is";

const baseUrl = () =>
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "https://mama.is";

/**
 * @param {object} booking     The row as the database returned it.
 * @param {boolean} notifyTeam Website bookings tell the restaurant; till ones
 *                             do not, because somebody there already knows.
 */
export async function notifyBooking(booking, { notifyTeam = false } = {}) {
  const resend = createResend();
  const language = booking.language === "is" ? "is" : "en";
  const time = String(booking.booking_time).slice(0, 5);
  const tables = booking.table_ids ?? [];

  const results = { guest: "skipped", team: "skipped" };

  if (booking.contact_email) {
    try {
      const props = {
        name: booking.contact_name,
        date: booking.booking_date,
        time,
        party: booking.party,
        reference: booking.reference_id,
        request: booking.request,
        // No account, no password: the token in the link is the whole key.
        manageUrl: booking.access_token
          ? `${baseUrl()}/booking/${booking.access_token}`
          : null,
        language,
      };
      const { html, text, subject } = await renderEmail(
        "table-booking-confirmation",
        props,
      );
      await resend.emails.send({
        from: FROM,
        to: [booking.contact_email],
        subject:
          subject ||
          (language === "is"
            ? `Borðið þitt á Mama — ${booking.booking_date}, ${time}`
            : `Your table at Mama — ${booking.booking_date}, ${time}`),
        html,
        text,
      });
      results.guest = "sent";
    } catch (err) {
      console.error("booking confirmation failed", booking.reference_id, err);
      results.guest = "failed";
    }
  } else {
    // Booked by telephone with no email. Nothing to send, and that is fine.
    results.guest = "no email";
  }

  if (notifyTeam) {
    try {
      const { html, text, subject } = await renderEmail("table-booking-team", {
        name: booking.contact_name,
        date: booking.booking_date,
        time,
        party: booking.party,
        reference: booking.reference_id,
        email: booking.contact_email,
        phone: booking.contact_phone,
        request: booking.request,
        tables,
        language,
      });
      await resend.emails.send({
        from: FROM,
        to: [TEAM],
        subject: subject || `New booking — ${booking.party} on ${booking.booking_date} at ${time}`,
        html,
        text,
      });
      results.team = "sent";
    } catch (err) {
      console.error("booking team notification failed", booking.reference_id, err);
      results.team = "failed";
    }
  }

  return results;
}
