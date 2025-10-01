import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function GET(req) {
  const supabase = createServerSupabase();
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is admin
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return Response.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  try {
    // Fetch all auto-credit subscriptions
    const { data, error } = await supabase
      .from("auto_credit_subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ subscriptions: data || [] }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  const supabase = createServerSupabase();
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is admin
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return Response.json(
      { error: "Forbidden - Admin access required" },
      { status: 403 }
    );
  }

  try {
    const { email, monthlyAmount, description } = await req.json();

    // Validate inputs
    if (!email || !monthlyAmount || typeof monthlyAmount !== "number") {
      return Response.json(
        { error: "Email and monthly amount are required" },
        { status: 400 }
      );
    }

    // Check if subscription already exists for this email
    const { data: existing, error: checkError } = await supabase
      .from("auto_credit_subscriptions")
      .select("id")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return Response.json({ error: checkError.message }, { status: 500 });
    }

    if (existing) {
      return Response.json(
        { error: "Auto-credit subscription already exists for this email" },
        { status: 400 }
      );
    }

    // Create new subscription
    const { data, error } = await supabase
      .from("auto_credit_subscriptions")
      .insert([
        {
          email,
          monthly_amount: monthlyAmount,
          description: description || null,
          is_active: true,
          next_payment_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days from now
        },
      ])
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ subscription: data }, { status: 201 });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
