import { NextResponse } from "next/server";
import crypto from "crypto";
import { createResend } from "@/lib/resend";
import { createServerSupabase } from "@/util/supabase/server";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

export async function POST(req) {
  try {
    const { email } = await req.json();
    const supabase = createServerSupabase();

    // Check if user exists
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate token + 24h expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await supabase
      .from("password_reset_tokens")
      .insert([{ email, token, expires_at: expiresAt }]);

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;

    const { html, text, subject } = await renderEmail("password-reset-request", {
      resetLink,
      expiresInHours: 24,
    });

    await resend.emails.send({
      from: "Mama.is <noreply@mama.is>",
      to: [email],
      subject: subject || "Reset your Mama password",
      html,
      text,
    });

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
