import { supabase } from "@/util/supabase/client";

export async function POST(req) {
  try {
    // Parse the body as URL-encoded data
    const bodyText = await req.text();

    const params = new URLSearchParams(bodyText);
    const body = Object.fromEntries(params);

    const { orderid, message } = body;

    // Update ticket status to error in the database
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ status: "error" })
      .eq("order_id", orderid);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    // Redirect to error page with the error message
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/payment-error?message=${encodeURIComponent(
          message || "Payment failed"
        )}`,
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
