import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function PUT(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { eventId, facebookLink } = await req.json();

    if (!eventId) {
      return new Response(JSON.stringify({ message: "Event ID is required" }), {
        status: 400,
      });
    }

    const supabaseClient = createServerSupabase();

    // Check if user has permission to edit this event
    const { data: event, error: eventError } = await supabaseClient
      .from("events")
      .select("host, created_by")
      .eq("id", eventId)
      .single();

    if (eventError) {
      return new Response(JSON.stringify({ message: "Event not found" }), {
        status: 404,
      });
    }

    // Only allow event host, creator, or admin to edit
    const isHost = event.host === session.user.email;
    const isCreator = event.created_by === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isHost && !isCreator && !isAdmin) {
      return new Response(
        JSON.stringify({
          message: "You don't have permission to edit this event",
        }),
        { status: 403 }
      );
    }

    // Update the Facebook link
    const { error: updateError } = await supabaseClient
      .from("events")
      .update({
        facebook_link: facebookLink || null,
      })
      .eq("id", eventId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        message: "Facebook link updated successfully",
        facebook_link: facebookLink,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating Facebook link:", error);
    return new Response(
      JSON.stringify({
        message: `Failed to update Facebook link: ${error.message}`,
      }),
      { status: 500 }
    );
  }
}
