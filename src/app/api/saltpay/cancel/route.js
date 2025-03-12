import { supabase } from "@/util/supabase/client";

export async function GET(req) {
  try {
    // Extract query parameters from the URL
    const { searchParams } = new URL(req.url);
    const orderid = searchParams.get("orderid");

    if (!orderid) {
      throw new Error("Missing order ID");
    }

    // Update ticket status to cancelled in the database
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ status: "cancelled" })
      .eq("order_id", orderid);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

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

// Keep POST handler for other cases
export async function POST(req) {
  try {
    const bodyText = await req.text();

    const params = new URLSearchParams(bodyText);
    const body = Object.fromEntries(params);

    const { orderid } = body;

    if (!orderid) {
      throw new Error("Missing order ID");
    }

    // Update ticket status to cancelled in the database
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ status: "cancelled" })
      .eq("order_id", orderid);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancelled`,
      },
    });
  } catch (error) {
    console.error("Error in cancel callback:", error);

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
