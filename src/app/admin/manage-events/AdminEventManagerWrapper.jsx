"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ManageEvents from "./ManageEvents";
import PromoCodeManager from "@/app/components/admin/PromoCodeManager";
import {
  AdminShell,
  AdminHeader,
} from "@/app/admin/components/AdminShell";

export default function AdminEventManagerWrapper({ initialEvents, serverLoadError }) {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <AdminShell maxWidth="max-w-6xl">
      <AdminHeader
        eyebrow="Admin"
        title="Manage Events"
        subtitle="Edit events, track tickets, and manage promo codes"
      />

      {serverLoadError ? (
        <div
          className="mb-6 rounded-2xl px-5 py-4 text-sm"
          style={{
            background: "rgba(255,145,77,0.06)",
            border: "1px solid rgba(255,145,77,0.2)",
            color: "#c05a1a",
          }}
          role="alert"
        >
          <p className="font-semibold mb-0.5 text-[#2c1810]">Events could not be loaded</p>
          <p className="text-[#9a7a62]">{serverLoadError}</p>
        </div>
      ) : null}

      {/* Tab navigation */}
      <div
        className="flex items-center gap-2 pb-5 mb-6"
        style={{ borderBottom: "1px solid #e8ddd3" }}
      >
        {[
          { key: "events", label: "Events" },
          { key: "promoCodes", label: "Promo Codes" },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={
              activeTab === tab.key
                ? {
                    background: "#ff914d",
                    color: "#ffffff",
                    boxShadow: "0 2px 10px rgba(255,145,77,0.28)",
                  }
                : {
                    background: "#faf6f2",
                    color: "#9a7a62",
                    border: "1px solid #e8ddd3",
                  }
            }
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {activeTab === "events" ? (
          <ManageEvents initialEvents={initialEvents} />
        ) : (
          <PromoCodeManager user={{ role: "admin" }} events={initialEvents} />
        )}
      </motion.div>
    </AdminShell>
  );
}
