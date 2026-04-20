"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  Cog6ToothIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import MenuItems from "@/app/admin/manage-menu/MenuItems";
import CreateMenuItem from "@/app/admin/manage-menu/CreateMenuItem";
import AdminGuard from "../AdminGuard";
import {
  AdminShell,
  AdminHeader,
  AdminPanel,
} from "@/app/admin/components/AdminShell";

export default function ManageMenu() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("items");

  const newItemBtn = (
    <motion.button
      onClick={() => setShowCreateForm(!showCreateForm)}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all"
      style={{
        background: "#ff914d",
        color: "#ffffff",
        boxShadow: "0 2px 10px rgba(255,145,77,0.28)",
      }}
    >
      <PlusIcon className="h-3.5 w-3.5" />
      {showCreateForm ? "Hide form" : "New item"}
    </motion.button>
  );

  return (
    <AdminGuard>
      <AdminShell maxWidth="max-w-7xl">
        <AdminHeader
          eyebrow="Admin"
          title="Menu Management"
          subtitle="Manage your restaurant's categories and menu items"
          action={newItemBtn}
        />

        {/* Tab navigation */}
        <div
          className="flex items-center gap-2 pb-5 mb-6"
          style={{ borderBottom: "1px solid #e8ddd3" }}
        >
          {[
            { key: "items", label: "Menu Items", icon: Bars3Icon },
            { key: "settings", label: "Settings", icon: Cog6ToothIcon },
          ].map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
                style={
                  active
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
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mb-8"
            >
              <AdminPanel
                title="Create new menu item"
                subtitle="Add a new item to your restaurant menu"
                icon={PlusIcon}
              >
                <CreateMenuItem onSuccess={() => setShowCreateForm(false)} />
              </AdminPanel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "items" && <MenuItems />}
          {activeTab === "settings" && (
            <AdminPanel padded>
              <div className="text-center py-8">
                <Cog6ToothIcon className="h-10 w-10 text-[#e8ddd3] mx-auto mb-3" />
                <p className="font-cormorant italic text-[#2c1810] text-xl font-light">
                  Settings coming soon
                </p>
                <p className="text-[#9a7a62] text-sm mt-1">
                  Additional menu management settings will appear here.
                </p>
              </div>
            </AdminPanel>
          )}
        </motion.div>
      </AdminShell>
    </AdminGuard>
  );
}
