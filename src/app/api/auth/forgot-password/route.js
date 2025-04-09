import { NextResponse } from "next/server";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
import { createServerSupabase } from "@/util/supabase/server";

const supabase = createServerSupabase();

// Set SendGrid API key
if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable is not set");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req) {
  try {
    const { email } = await req.json();

    // ✅ Check if user exists
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Generate a unique token
    const token = crypto.randomBytes(32).toString("hex");

    // ✅ Save token in Supabase (expires in 1 hour)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await supabase
      .from("password_reset_tokens")
      .insert([{ email, token, expires_at: expiresAt }]);

    // ✅ Send email with reset link using SendGrid
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;

    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_MAMA_EMAIL,
        name: "Support", // This will appear as the sender name
      },
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ff914d; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Request</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="color: #333333; font-size: 16px; line-height: 1.6;">
              <p>You requested to reset your password. Click the button below to reset it:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #ff914d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #666666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; color: #666666; font-size: 14px;">
              <p style="margin: 0;">Best regards,</p>
              <p style="margin: 5px 0;">Mama & The White Lotus Team</p>
            </div>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);

    return NextResponse.json(
      { message: "Reset link sent! Check your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error: " + error.message },
      { status: 500 }
    );
  }
}
