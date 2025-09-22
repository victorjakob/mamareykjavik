import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { validateField } from "../utils/validation";

export default function ContactQuestion({ formData, updateFormData, t }) {
  const [errors, setErrors] = useState({});

  const contact = formData.contact || {};

  const handleFieldChange = (field, value) => {
    const newContact = { ...contact, [field]: value };
    updateFormData({ contact: newContact });

    // Validate field
    const error = validateField(field, value);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-extralight text-[#fefff5] mb-8 text-center">
        Tengiliður
      </h2>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-light text-[#fefff5] mb-2">
            Fullt nafn *
          </label>
          <motion.input
            type="text"
            value={contact.name || ""}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            placeholder="Anna Jónsdóttir"
            className={`
              w-full p-4 bg-slate-900/50 border rounded-xl text-[#fefff5] placeholder-slate-400 
              focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all
              ${errors.name ? "border-red-400/50 bg-red-900/10" : "border-slate-600/30"}
            `}
            whileFocus={{ scale: 1.01 }}
          />
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400/80 text-sm mt-1 font-light"
            >
              {errors.name}
            </motion.p>
          )}
        </div>

        <div>
          <label className="block text-sm font-light text-[#fefff5] mb-2">
            Netfang *
          </label>
          <motion.input
            type="email"
            value={contact.email || ""}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            placeholder="anna@example.com"
            className={`
              w-full p-4 bg-slate-900/50 border rounded-xl text-[#fefff5] placeholder-slate-400
              focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all
              ${errors.email ? "border-red-400/50 bg-red-900/10" : "border-slate-600/30"}
            `}
            whileFocus={{ scale: 1.01 }}
          />
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400/80 text-sm mt-1 font-light"
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        <div>
          <label className="block text-sm font-light text-[#fefff5] mb-2">
            Símanúmer *
          </label>
          <motion.input
            type="tel"
            value={contact.phone || ""}
            onChange={(e) => handleFieldChange("phone", e.target.value)}
            placeholder="581-2345"
            className={`
              w-full p-4 bg-slate-900/50 border rounded-xl text-[#fefff5] placeholder-slate-400
              focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all
              ${errors.phone ? "border-red-400/50 bg-red-900/10" : "border-slate-600/30"}
            `}
            whileFocus={{ scale: 1.01 }}
          />
          {errors.phone && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400/80 text-sm mt-1 font-light"
            >
              {errors.phone}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
