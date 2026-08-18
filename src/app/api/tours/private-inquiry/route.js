// app/api/tours/private-inquiry/route.js
//
// Private-tour enquiry: emails the team with the request details and
// reply-to set to the customer. No payment — private departures are
// arranged by hand.

import { NextResponse } from "next/server";
import { createResend } from "@/lib/resend";

const resend = createResend();

const TEAM_EMAIL = "team@mama.is";

export async function POST(request) {
  try {
    const body = await request.json();
    const { tour_name, name, email, phone, preferred_date, group_size, message } =
      body;

    if (!name || !email || !group_size) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const esc = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const rows = [
      ["Tour", tour_name || "Private tour"],
      ["Name", name],
      ["Email", email],
      ["Phone", phone || "—"],
      ["Preferred date", preferred_date || "—"],
      ["Group size", group_size],
      ["Message", message || "—"],
    ]
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">${k}</td><td style="padding:6px 0">${esc(
            v
          )}</td></tr>`
      )
      .join("");

    await resend.emails.send({
      from: "Mama Tours <team@mama.is>",
      to: [TEAM_EMAIL],
      replyTo: email,
      subject: `Private tour enquiry — ${tour_name || "tour"} (${group_size} guests)`,
      html: `<h2 style="font-family:sans-serif">New private tour enquiry</h2><table style="font-family:sans-serif;font-size:14px">${rows}</table><p style="font-family:sans-serif;font-size:13px;color:#888">Reply to this email to answer ${esc(
        name
      )} directly.</p>`,
      text: `New private tour enquiry\n\nTour: ${tour_name || "Private tour"}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nPreferred date: ${preferred_date || "—"}\nGroup size: ${group_size}\nMessage: ${message || "—"}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending private tour enquiry:", error);
    return NextResponse.json(
      { error: "Failed to send enquiry" },
      { status: 500 }
    );
  }
}
