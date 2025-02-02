"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PropagateLoader } from "react-spinners";
import BuyTicket from "@/app/components/events/BuyTicket";
import { supabase } from "@/lib/supabase";

export default function TicketPage() {
  const params = useParams();
  const { slug } = params;
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">
          Error loading event details
        </h1>
      </div>
    );
  }

  return (
    <div className="pt-40 container mx-auto px-4 py-8">
      <BuyTicket event={event} />
    </div>
  );
}
