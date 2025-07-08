import { NextResponse } from "next/server";
import sendgrid from "@sendgrid/mail";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const email = session.user.email;

    const adminEmail = process.env.SENDGRID_FROM_MAMA_EMAIL;
    if (!adminEmail) {
      return NextResponse.json(
        { error: "Admin email is not configured" },
        { status: 500 }
      );
    }
    const msg = {
      to: adminEmail,
      from: adminEmail,
      subject: "Access Request: Mama.is Event Manager",
      text: `User ${email} has requested access to the Event Manager.\n\nTo approve, update their role in Supabase to 'host' or 'admin'.\n\nReply to this email to communicate with the user.`,
      html: `<p>User <strong>${email}</strong> has requested access to the Event Manager.</p>
             <p>To approve, update their role in Supabase to <code>host</code> or <code>admin</code>.</p>
             <p><a href="mailto:${email}?subject=Regarding your access request">Reply to user</a></p>`,
    };

    await sendgrid.send(msg);

    return NextResponse.json({ message: "Request sent" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
