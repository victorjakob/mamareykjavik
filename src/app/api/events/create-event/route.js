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

    const { data, error } = await supabase
      .from("events")
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Failed to create event: ${error.message}` }),
      { status: 500 }
    );
  }
}
