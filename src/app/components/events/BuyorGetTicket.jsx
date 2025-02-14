"use client";

import { PropagateLoader } from "react-spinners";
import BuyTicket from "./BuyTicket";

export default function BuyOrGetTicket({ event }) {
  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PropagateLoader color="#4F46E5" size={12} />
      </div>
    );
  }

  return <BuyTicket event={event} />;
}
