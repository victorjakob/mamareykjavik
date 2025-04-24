import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabase } from "@/util/supabase/client";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const eventData = await req.json();
    const { ticket_variants, ...eventDetails } = eventData;

    // Start a transaction
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert([eventDetails])
      .select()
      .single();

    if (eventError) throw eventError;

    // Create ticket variants
    if (ticket_variants && ticket_variants.length > 0) {
      const variantsWithEventId = ticket_variants.map((variant) => ({
        ...variant,
        event_id: event.id,
        created_at: new Date().toISOString(),
      }));

      const { error: variantsError } = await supabase
        .from("ticket_variants")
        .insert(variantsWithEventId);

      if (variantsError) throw variantsError;
    }

    return new Response(JSON.stringify(event), {
      status: 200,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return new Response(
      JSON.stringify({ message: `Failed to create event: ${error.message}` }),
      { status: 500 }
    );
  }
}
