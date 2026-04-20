"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ManageEvents from "./ManageEvents";
import PromoCodeManager from "@/app/components/admin/PromoCodeManager";

export default function EventManagerWrapper({ initialData }) {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-6 pt-8 pb-20">

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 pb-5" style={{ borderBottom: "1.5px solid #e8ddd3" }}>
        {[
          { key: "events",     label: "Events" },
          { key: "promoCodes", label: "Promo Codes" },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={
              activeTab === tab.key
                ? { background: "#ff914d", color: "#fff", boxShadow: "0 2px 10px rgba(255,145,77,0.3)" }
                : { background: "#ffffff", color: "#9a7a62", border: "1.5px solid #e8ddd3" }
            }
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {activeTab === "events" ? (
          <ManageEvents initialData={initialData} />
        ) : (
          <PromoCodeManager user={initialData.user} events={initialData.events} />
        )}
      </motion.div>
    </div>
  );
}
