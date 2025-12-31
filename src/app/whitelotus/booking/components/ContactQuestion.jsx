import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { validateField } from "../utils/validation";

export default function ContactQuestion({ formData, updateFormData, t }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const contact = formData.contact || {};

  const handleFieldChange = (field, value) => {
    const newContact = { ...contact, [field]: value };
    updateFormData({ contact: newContact });

    // Only show error if field has been touched and has an error
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = contact[field];
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
        {t("contactTitle")}
      </h2>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-light text-[#fefff5] mb-2">
            {t("fullName")} {t("required")}
          </label>
          <motion.input
            type="text"
            value={contact.name || ""}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            onBlur={() => handleFieldBlur("name")}
            placeholder=""
            autoComplete="name"
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
            {t("email")} {t("required")}
          </label>
          <motion.input
            type="email"
            value={contact.email || ""}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            onBlur={() => handleFieldBlur("email")}
            placeholder=""
            autoComplete="email"
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
            {t("phone")} {t("required")}
          </label>
          <motion.input
            type="tel"
            value={contact.phone || ""}
            onChange={(e) => handleFieldChange("phone", e.target.value)}
            onBlur={() => handleFieldBlur("phone")}
            placeholder=""
            autoComplete="tel"
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

        <div>
          <label className="block text-sm font-light text-[#fefff5] mb-2">
            {t("company")}
          </label>
          <motion.input
            type="text"
            value={contact.company || ""}
            onChange={(e) => handleFieldChange("company", e.target.value)}
            placeholder=""
            autoComplete="organization"
            className={`
              w-full p-4 bg-slate-900/50 border rounded-xl text-[#fefff5] placeholder-slate-400
              focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all
              border-slate-600/30
            `}
            whileFocus={{ scale: 1.01 }}
          />
        </div>

        <div>
          <label className="block text-sm font-light text-[#fefff5] mb-2">
            {t("kennitala")}
          </label>
          <motion.input
            type="text"
            value={contact.kennitala || ""}
            onChange={(e) => handleFieldChange("kennitala", e.target.value)}
            placeholder=""
            className={`
              w-full p-4 bg-slate-900/50 border rounded-xl text-[#fefff5] placeholder-slate-400
              focus:ring-2 focus:ring-[#a77d3b]/50 focus:border-transparent transition-all
              border-slate-600/30
            `}
            whileFocus={{ scale: 1.01 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
