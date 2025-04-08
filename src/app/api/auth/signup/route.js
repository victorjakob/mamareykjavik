import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST(req) {
  const supabase = createServerSupabase();
  try {
    const { email, password, name } = await req.json();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Check if email exists as a host in any event
    const { data: hostEvents } = await supabase
      .from("events")
      .select("id")
      .eq("host", email)
      .limit(1);

    // Determine the role based on whether they're a host
    const userRole = hostEvents && hostEvents.length > 0 ? "host" : "user";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with the determined role
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password: hashedPassword,
          name,
          role: userRole, // Set the role based on our check
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        role: userRole, // Optionally return the role in the response
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
