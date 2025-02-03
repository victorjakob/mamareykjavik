import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    // Parse the body as URL-encoded data
    const bodyText = await req.text();
    console.log("Raw Cancel Request Body:", bodyText);

    const params = new URLSearchParams(bodyText);
    const body = Object.fromEntries(params);
    console.log("Parsed Cancel Request Body:", body);

    const { orderid } = body;

    // Update ticket status to cancelled in the database
    console.log("Updating ticket status to cancelled...");
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ status: "cancelled" })
      .eq("order_id", orderid);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log("Ticket status updated to cancelled");

    // Redirect to cancelled page
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancelled`,
      },
    });
  } catch (error) {
    console.error("Error in cancel callback:", error);

    // Redirect to error page with the error message
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/error?message=${encodeURIComponent(
          "An error occurred while cancelling"
        )}`,
      },
    });
  }
}
