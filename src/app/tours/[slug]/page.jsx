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
    .eq("is_active", true)
    .single();

  if (error || !tour) {
    return null;
  }

  return tour;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tour = await getTourData(slug);
  if (!tour) return {};
  return {
    title: `${tour.name} | Mama Tours`,
    description: tour.short_description || tour.description,
    openGraph: {
      title: `${tour.name} | Mama Tours`,
      description: tour.short_description || tour.description,
      images: tour.image_url ? [tour.image_url] : undefined,
    },
  };
}

export default async function TourPage({ params }) {
  const { slug } = await params;
  const tourData = await getTourData(slug);
  if (!tourData) notFound();

  return (
    <div className="w-full bg-[#110f0d]">
      <Hero tour={tourData} />
      <Info tour={tourData} />
    </div>
  );
}
