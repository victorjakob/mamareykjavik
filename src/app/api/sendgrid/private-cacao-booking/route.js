import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      participants,
      intention,
      location,
      preferredDate,
      additionalNotes,
    } = body;

    const optionalRow = (label, value) =>
      value ? `<p><strong>${label}:</strong> ${value}</p>` : "";
    const optionalListItem = (label, value) =>
      value ? `<li><strong>${label}:</strong> ${value}</li>` : "";

    // Email to team
    await resend.emails.send({
      from: "Mama Cacao <team@mama.is>",
      to: "team@mama.is",
      replyTo: email,
      subject: `Private Cacao Ceremony Inquiry from ${name}`,
      html: `
        <h2>New Private Cacao Ceremony Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Group size:</strong> ${participants}</p>
        ${optionalRow("Intention or occasion", intention)}
        <p><strong>Location:</strong> ${location}</p>
        ${optionalRow("Approximate window", preferredDate)}
        ${optionalRow("Notes", additionalNotes)}
        <br><br>
        <p>Best regards,</p>
        <p>Mama Reykjavík</p>
        <p>team@mama.is</p>
        <p><a href="https://mama.is">https://mama.is</a></p>
      `,
    });

    // Confirmation email to user
    await resend.emails.send({
      from: "Mama Cacao <team@mama.is>",
      to: [email],
      replyTo: "team@mama.is",
      subject: "We received your private cacao ceremony request",
      html: `
        <h2>Thank you, ${name}.</h2>
        <p>Your private cacao ceremony request is in. We read every inquiry personally and will reply within a few days.</p>
        <p>Here is a summary of what you shared:</p>
        <ul>
          <li><strong>Group size:</strong> ${participants}</li>
          ${optionalListItem("Intention or occasion", intention)}
          <li><strong>Location:</strong> ${location}</li>
          ${optionalListItem("Approximate window", preferredDate)}
          ${optionalListItem("Notes", additionalNotes)}
        </ul>
        <p>If anything changes, simply reply to this email and we’ll update your request.</p>
        <br>
        <p>With gratitude,</p>
        <p>The Mama Team</p>
        <p>team@mama.is</p>
        <p><a href="https://mama.is">https://mama.is</a></p>
      `,
    });

    return NextResponse.json(
      { message: "Booking request sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending booking request:", error);
    return NextResponse.json(
      { error: "Failed to send booking request" },
      { status: 500 }
    );
  }
}
