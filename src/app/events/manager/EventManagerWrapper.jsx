"use client";

import { useState } from "react";
import ManageEvents from "./ManageEvents";
import PromoCodeManager from "@/app/components/admin/PromoCodeManager";

export default function EventManagerWrapper({ initialData }) {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  ">
      {/* Tab Navigation */}
      <div className="flex flex-row justify-end sm:justify-center items-center gap-3 sm:gap-4 mb-8 border-b-2 pb-10 border-gray-200 ">
        <button
          onClick={() => setActiveTab("events")}
          className={`w-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm font-normal transition-all duration-200 ${
            activeTab === "events"
              ? "bg-[#ff914d] text-white shadow-sm hover:bg-orange-600"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab("promoCodes")}
          className={`w-auto px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-sm font-normal transition-all duration-200 ${
            activeTab === "promoCodes"
              ? "bg-[#ff914d] text-white shadow-sm hover:bg-orange-600"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          Promo Codes
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "events" ? (
        <ManageEvents initialData={initialData} />
      ) : (
        <PromoCodeManager user={initialData.user} events={initialData.events} />
      )}
    </div>
  );
}
