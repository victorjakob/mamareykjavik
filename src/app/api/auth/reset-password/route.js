import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
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
}
