import { createServerSupabaseComponent } from "@/util/supabase/serverComponent";
import ManageSeries from "./ManageSeries";

export const dynamic = "force-dynamic";

/**
 * /admin/manage-series — series listing + backfill ("Group into series") tool.
 *
 * Loads two datasets server-side:
 *   1. existing event_series with their bound instance counts + next session
 *   2. all events for the picker (so admin can backfill an existing recurring
 *      group like Qi Gong by ticking the rows that belong together)
 */
export default async function ManageSeriesPage() {
  let series = [];
  let events = [];
  let serverLoadError = null;

  try {
    const supabase = await createServerSupabaseComponent();

    const { data: seriesData, error: seriesError } = await supabase
      .from("event_series")
      .select("*")
      .order("created_at", { ascending: false });
    if (seriesError) throw seriesError;
    series = seriesData || [];

    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("id, name, slug, date, image, series_id, host")
      .order("date", { ascending: true });
    if (eventsError) throw eventsError;
    events = eventsData || [];
  } catch (e) {
    console.error("[ManageSeriesPage]", e);
    serverLoadError = e instanceof Error ? e.message : String(e);
  }

  return (
    <ManageSeries
      initialSeries={series}
      initialEvents={events}
      serverLoadError={serverLoadError}
    />
  );
}
