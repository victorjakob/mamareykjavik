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
      location,
      preferredDate,
      additionalNotes,
    } = body;

    // Email to team
    await resend.emails.send({
      from: "Mama Cacao <team@mama.is>",
      to: "team@mama.is",
      replyTo: email,
      subject: `Private Cacao Ceremony Booking Request from ${name}`,
      html: `
        <h2>New Private Cacao Ceremony Booking Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Number of Participants:</strong> ${participants}</p>
        <p><strong>Location:</strong> ${location}</p>
        ${
          preferredDate
            ? `<p><strong>Preferred Date & Time:</strong> ${preferredDate}</p>`
            : ""
        }
        ${
          additionalNotes
            ? `<p><strong>Additional Notes:</strong> ${additionalNotes}</p>`
            : ""
        }
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
      subject: "Your Private Cacao Ceremony Booking Request - Mama Reykjavik",
      html: `
        <h2>Thank you for your booking request!</h2>
        <p>Dear ${name},</p>
        <p>We have received your request for a private cacao ceremony with the following details:</p>
        <ul>
          <li><strong>Number of Participants:</strong> ${participants}</li>
          <li><strong>Location:</strong> ${location}</li>
          ${
            preferredDate
              ? `<li><strong>Preferred Date & Time:</strong> ${preferredDate}</li>`
              : ""
          }
          ${
            additionalNotes
              ? `<li><strong>Additional Notes:</strong> ${additionalNotes}</li>`
              : ""
          }
        </ul>
        <p>We'll review your request and get back to you soon to confirm the details.</p>
        <p>If you have any questions in the meantime, feel free to reach out to us at team@mama.is</p>
        <br><br>
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
