import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function POST(req) {
  const supabase = createServerSupabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const { eventId, slug } = await req.json();
    if (!eventId && !slug) {
      return new Response(
        JSON.stringify({ message: "Missing eventId or slug" }),
        {
          status: 400,
        }
      );
    }
    let query = supabase.from("events").update({ sold_out: true });
    if (eventId) {
      query = query.eq("id", eventId);
    } else {
      query = query.eq("slug", slug);
    }
    const { data, error } = await query.select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ event: data }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: `Failed to mark event as sold out: ${error.message}`,
      }),
      { status: 500 }
    );
  }
}
