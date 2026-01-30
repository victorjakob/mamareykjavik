import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function DELETE(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return new Response(JSON.stringify({ message: "Event ID is required" }), {
        status: 400,
      });
    }

    const supabaseClient = createServerSupabase();

    // Check if user has permission to delete this event
    const { data: event, error: eventError } = await supabaseClient
      .from("events")
      .select("id, host, created_by")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return new Response(JSON.stringify({ message: "Event not found" }), {
        status: 404,
      });
    }

    // Only allow event host, creator, or admin to delete
    const isHost = event.host === session.user.email;
    const isCreator = event.created_by === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isHost && !isCreator && !isAdmin) {
      return new Response(
        JSON.stringify({
          message: "You don't have permission to delete this event",
        }),
        { status: 403 },
      );
    }

    // Delete associated tickets first
    const { error: ticketsError } = await supabaseClient
      .from("tickets")
      .delete()
      .eq("event_id", eventId);

    if (ticketsError) {
      console.error("Error deleting tickets:", ticketsError);
      throw ticketsError;
    }

    // Then delete the event
    const { error: deleteError } = await supabaseClient
      .from("events")
      .delete()
      .eq("id", eventId);

    if (deleteError) {
      console.error("Error deleting event:", deleteError);
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ message: "Event deleted successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return new Response(
      JSON.stringify({
        message: error.message || "Failed to delete event",
      }),
      { status: 500 },
    );
  }
}
