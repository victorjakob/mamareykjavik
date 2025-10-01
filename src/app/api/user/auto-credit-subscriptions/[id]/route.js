import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function PUT(req, { params }) {
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
    const { id } = params;
    const { monthlyAmount, description, isActive } = await req.json();

    // Validate inputs
    if (!id) {
      return Response.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (monthlyAmount !== undefined) updateData.monthly_amount = monthlyAmount;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.is_active = isActive;

    // Update subscription
    const { data, error } = await supabase
      .from("auto_credit_subscriptions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ subscription: data }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
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
    const { id } = params;

    if (!id) {
      return Response.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Delete subscription
    const { error } = await supabase
      .from("auto_credit_subscriptions")
      .delete()
      .eq("id", id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(
      { message: "Subscription deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
