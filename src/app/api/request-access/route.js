import { NextResponse } from "next/server";
import { createResend } from "@/lib/resend";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

export async function POST(req) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const email = session.user.email;

    const { html, text, subject } = await renderEmail("access-request-notification", {
      userEmail: email,
    });

    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: "team@mama.is",
      replyTo: email,
      subject: subject || "Access Request: Event Manager",
      html,
      text,
    });

    return NextResponse.json({ message: "Request sent" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
