import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Admin or host access
    if (!session || (session.user.role !== "admin" && session.user.role !== "host")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = createServerSupabase();

    const { data, error } = await supabase
      .from("whitelotus_event_feedback")
      .select(
        [
          "id",
          "created_at",
          "updated_at",
          "locale",
          "segment",
          "overall_stars",
          "recommend_score",
          "booking_communication_stars",
          "staff_service_stars",
          "space_cleanliness_stars",
          "improve_one_thing",
          "low_satisfaction_details",
          "follow_up_ok",
          "follow_up_name",
          "follow_up_contact",
          "ambience_vibe_stars",
          "tech_equipment_stars",
          "flow_on_the_day_stars",
          "value_for_money_stars",
          "best_part",
        ].join(",")
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("Error fetching reviews:", error);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (error) {
    console.error("Error in reviews API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

