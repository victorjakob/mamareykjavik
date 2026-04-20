"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const inputBase =
  "w-full px-4 py-3 rounded-xl bg-[#0e0b08] border border-white/10 text-[#f0ebe3] placeholder-[#8a7e72] focus:border-[#ff914d] focus:ring-2 focus:ring-[#ff914d]/20 focus:outline-none transition-all duration-300";

const inputDisabled =
  "w-full px-4 py-3 rounded-xl bg-[#0e0b08]/60 border border-white/10 text-[#8a7e72] cursor-not-allowed";

const labelBase =
  "block text-[10px] uppercase tracking-[0.3em] text-[#a09488] font-light mb-2";

export default function DeliveryAddressFields({
  register,
  errors,
  deliveryMethod,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { language } = useLanguage();

  const t =
    language === "is"
      ? {
          address: "Heimilisfang",
          zip: "Póstnúmer",
          city: "Bær / sveitarfélag",
          country: "Land",
          addressRequired: "Heimilisfang krafist",
          zipRequired: "Póstnúmer krafist",
          cityRequired: "Bær krafist",
          tooltip1: "Sending aðeins í boði á Íslandi.",
          tooltip2: "Sendu póst fyrir sendingu erlendis.",
        }
      : {
          address: "Address",
          zip: "Zip / Postal code",
          city: "City / Town",
          country: "Country",
          addressRequired: "Address is required",
          zipRequired: "Zip/Postal code is required",
          cityRequired: "City/Town is required",
          tooltip1: "Only available shipping in Iceland.",
          tooltip2: "Send email for outside Iceland shipping.",
        };

  return (
    <AnimatePresence>
      {deliveryMethod === "delivery" && (
        <motion.div
          key="delivery-fields"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.4 }}
          className="pt-6 mt-6 border-t border-white/10"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="address" className={labelBase}>
                {t.address}
              </label>
              <input
                id="address"
                {...register("address", {
                  required:
                    deliveryMethod === "delivery" ? t.addressRequired : false,
                })}
                placeholder={t.address}
                className={inputBase}
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? "address-error" : undefined}
              />
              {errors.address && (
                <p
                  id="address-error"
                  className="mt-1 text-sm text-[#ff914d]"
                  role="alert"
                >
                  {errors.address.message}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="zip" className={labelBase}>
                  {t.zip}
                </label>
                <input
                  id="zip"
                  {...register("zip", {
                    required:
                      deliveryMethod === "delivery" ? t.zipRequired : false,
                  })}
                  placeholder={t.zip}
                  className={inputBase}
                  aria-invalid={!!errors.zip}
                  aria-describedby={errors.zip ? "zip-error" : undefined}
                />
                {errors.zip && (
                  <p
                    id="zip-error"
                    className="mt-1 text-sm text-[#ff914d]"
                    role="alert"
                  >
                    {errors.zip.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label htmlFor="city" className={labelBase}>
                  {t.city}
                </label>
                <input
                  id="city"
                  {...register("city", {
                    required:
                      deliveryMethod === "delivery" ? t.cityRequired : false,
                  })}
                  placeholder={t.city}
                  className={inputBase}
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? "city-error" : undefined}
                />
                {errors.city && (
                  <p
                    id="city-error"
                    className="mt-1 text-sm text-[#ff914d]"
                    role="alert"
                  >
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>
            <div className="relative">
              <label htmlFor="country" className={labelBase}>
                {t.country}
              </label>
              <div
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <input
                  id="country"
                  value="Iceland"
                  disabled
                  className={inputDisabled}
                  aria-disabled="true"
                />
                <AnimatePresence>
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full left-0 mb-2 p-3 bg-[#1a1510] border border-white/10 text-[#f0ebe3] text-xs font-light rounded-xl shadow-lg max-w-xs z-10 pointer-events-none leading-relaxed"
                    >
                      {t.tooltip1}
                      <br />
                      {t.tooltip2}
                      <div className="absolute top-full left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1a1510]"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
