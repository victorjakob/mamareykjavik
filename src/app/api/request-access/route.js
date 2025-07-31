import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const email = session.user.email;

    await resend.emails.send({
      from: "White Lotus <team@mama.is>",
      to: "team@mama.is",
      reply_to: email,
      subject: "Access Request: Event Manager",
      text: `User ${email} has requested access to the Event Manager.\n\nTo approve, update their role in Supabase to 'host' or 'admin'.\n\nReply to this email to communicate with the user.`,
      html: `<p>User <strong>${email}</strong> has requested access to the Event Manager.</p>
             <p>To approve, update their role in Supabase to <code>host</code> or <code>admin</code>.</p>
             <p><a href="mailto:${email}?subject=Regarding your access request">Reply to user</a></p>`,
    });

    return NextResponse.json({ message: "Request sent" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
