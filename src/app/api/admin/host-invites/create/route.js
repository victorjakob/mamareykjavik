import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createHostInviteToken } from "@/lib/hostInvites";
import {
  buildHostInviteEmailHtml,
  buildHostInviteEmailText,
} from "@/lib/hostInviteEmail";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const sendEmail = body?.sendEmail !== false;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const token = createHostInviteToken({
      email,
      invitedBy: session.user.email || null,
    });

    const inviteUrl = `${request.nextUrl.origin}/host-invite?token=${encodeURIComponent(
      token
    )}`;
    const createEventUrl = `${request.nextUrl.origin}/admin/create-event`;
    const manageEventsUrl = `${request.nextUrl.origin}/events/manager`;

    let emailSent = false;
    let emailError = null;
    let emailId = null;

    if (sendEmail) {
      try {
        if (!resend) {
          throw new Error("RESEND_API_KEY is not configured.");
        }

        const { data, error } = await resend.emails.send({
          from: "White Lotus <team@mama.is>",
          replyTo: "team@mama.is",
          to: [email],
          subject: "You're invited to create your event at White Lotus",
          text: buildHostInviteEmailText({
            inviteUrl,
            createEventUrl,
            manageEventsUrl,
          }),
          html: buildHostInviteEmailHtml({
            inviteUrl,
            createEventUrl,
            manageEventsUrl,
          }),
        });

        if (error) {
          throw new Error(error.message || "Resend rejected the email.");
        }

        emailSent = true;
        emailId = data?.id || null;
      } catch (sendError) {
        console.error("Error sending host invite email:", sendError);
        emailError =
          sendError?.message || "Invite email could not be sent automatically.";
      }
    }

    return NextResponse.json({
      success: true,
      email,
      inviteUrl,
      token,
      emailSent,
      emailError,
      emailId,
    });
  } catch (error) {
    console.error("Error creating host invite:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create host invite." },
      { status: 500 }
    );
  }
}
