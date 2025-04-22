import { createServerSupabase } from "@/util/supabase/server";
import Hero from "./Hero";
import Info from "./Info";
import { notFound } from "next/navigation";

async function getTourData(slug) {
  const supabase = createServerSupabase();
  const { data: tour, error } = await supabase
    .from("tours")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !tour) {
    return notFound();
  }

  return tour;
}

export default async function TourPage({ params }) {
  const tourData = await getTourData(params.slug);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Hero tour={tourData} />
      <Info tour={tourData} />
    </div>
  );
}
