import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST(req) {
  const supabase = createServerSupabase();

  try {
    const { token, newPassword } = await req.json();

    const { data: resetToken } = await supabase
      .from("password_reset_tokens")
      .select("email, expires_at")
      .eq("token", token)
      .single();

    if (!resetToken || new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", resetToken.email);
    await supabase.from("password_reset_tokens").delete().eq("token", token);

    return NextResponse.json(
      { message: "Password reset successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error resetting password: " + error.message },
      { status: 500 }
    );
  }
}
