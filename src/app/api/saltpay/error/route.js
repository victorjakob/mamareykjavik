import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    // Parse the body as URL-encoded data
    const bodyText = await req.text();
    console.log("Raw Error Request Body:", bodyText);

    const params = new URLSearchParams(bodyText);
    const body = Object.fromEntries(params);
    console.log("Parsed Error Request Body:", body);

    const { orderid, message } = body;

    // Update ticket status to error in the database
    console.log("Updating ticket status to error...");
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ status: "error" })
      .eq("order_id", orderid);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log("Ticket status updated to error");

    // Redirect to error page with the error message
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/error?message=${encodeURIComponent(message || "Payment failed")}`,
      },
    });
  } catch (error) {
    console.error("Error in error callback:", error);

    // Redirect to error page with a generic error message
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/error?message=${encodeURIComponent("An unexpected error occurred")}`,
      },
    });
  }
}
