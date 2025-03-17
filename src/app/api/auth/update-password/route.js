import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST(req) {
  const supabase = createServerSupabase();

  try {
    const { email, currentPassword, newPassword } = await req.json();

    // ✅ Fetch the user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("password")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Incorrect current password" },
        { status: 400 }
      );
    }

    // ✅ Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update password in Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", email);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json(
      { message: "Password updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Password update error:", error.message);
    return NextResponse.json(
      { message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
