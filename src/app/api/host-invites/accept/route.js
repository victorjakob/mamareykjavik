import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { verifyHostInviteToken } from "@/lib/hostInvites";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const token = body?.token;
    const invite = verifyHostInviteToken(token);
    const sessionEmail = String(session.user.email).trim().toLowerCase();

    if (invite.email !== sessionEmail) {
      return NextResponse.json(
        {
          error: `This invite is for ${invite.email}. Please log in or sign up with that email.`,
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, role, email")
      .eq("email", sessionEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User record not found." },
        { status: 404 }
      );
    }

    if (user.role !== "admin" && user.role !== "host") {
      const { error: updateError } = await supabase
        .from("users")
        .update({ role: "host" })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }
    }

    return NextResponse.json({
      success: true,
      role: user.role === "admin" ? "admin" : "host",
      redirectTo: "/admin/create-event",
    });
  } catch (error) {
    console.error("Error accepting host invite:", error);
    return NextResponse.json(
      { error: error.message || "Failed to accept host invite." },
      { status: 500 }
    );
  }
}
