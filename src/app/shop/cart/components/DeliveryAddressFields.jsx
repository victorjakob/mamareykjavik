import { motion, AnimatePresence } from "framer-motion";

export default function DeliveryAddressFields({
  register,
  errors,
  deliveryMethod,
}) {
  return (
    <AnimatePresence>
      {deliveryMethod === "delivery" && (
        <motion.div
          key="delivery-fields"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="pt-6 mt-6 border-t border-gray-200"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-gray-700 font-medium mb-1"
              >
                Address
              </label>
              <input
                id="address"
                {...register("address", {
                  required:
                    deliveryMethod === "delivery"
                      ? "Address is required"
                      : false,
                })}
                placeholder="Address"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? "address-error" : undefined}
              />
              {errors.address && (
                <p
                  id="address-error"
                  className="mt-1 text-sm text-red-500"
                  role="alert"
                >
                  {errors.address.message}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label
                  htmlFor="zip"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Zip/Postal Code
                </label>
                <input
                  id="zip"
                  {...register("zip", {
                    required:
                      deliveryMethod === "delivery"
                        ? "Zip/Postal code is required"
                        : false,
                  })}
                  placeholder="Zip/Postal Code"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  aria-invalid={!!errors.zip}
                  aria-describedby={errors.zip ? "zip-error" : undefined}
                />
                {errors.zip && (
                  <p
                    id="zip-error"
                    className="mt-1 text-sm text-red-500"
                    role="alert"
                  >
                    {errors.zip.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="city"
                  className="block text-gray-700 font-medium mb-1"
                >
                  City/Town
                </label>
                <input
                  id="city"
                  {...register("city", {
                    required:
                      deliveryMethod === "delivery"
                        ? "City/Town is required"
                        : false,
                  })}
                  placeholder="City/Town"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? "city-error" : undefined}
                />
                {errors.city && (
                  <p
                    id="city-error"
                    className="mt-1 text-sm text-red-500"
                    role="alert"
                  >
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="country"
                className="block text-gray-700 font-medium mb-1"
              >
                Country
              </label>
              <input
                id="country"
                value="Iceland"
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                aria-disabled="true"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
