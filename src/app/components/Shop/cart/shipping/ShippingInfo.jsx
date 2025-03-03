"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "../../../../../lib/SupabaseProvider";

export default function ShippingInfo({ register, errors }) {
  const { user } = useSupabase();
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Iceland",
    droppLocationId: "",
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/javascript";
    script.src = "//app.dropp.is/dropp-locations.min.js";
    script.dataset.storeId = "730b2d45-f3e1-4ea0-b44b-ebd91c1539bc";
    script.dataset.env = "stage";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleDroppLocation = async () => {
    try {
      const location = await window.chooseDroppLocation();
      if (location) {
        setFormData((prev) => ({
          ...prev,
          droppLocationId: location.id,
        }));
      }
    } catch (error) {
      console.error("Error selecting Dropp location:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <select
        {...register("country")}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
      >
        <option value="Iceland">Iceland</option>
      </select>

      <button
        type="button"
        onClick={handleDroppLocation}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
      >
        {formData.droppLocationId
          ? "Change Pickup Location"
          : "Select Pickup Location"}
      </button>

      <input
        {...register("address", { required: "Address is required" })}
        placeholder="Street Address"
        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
      />
      {errors.address && (
        <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            {...register("city", { required: "City is required" })}
            placeholder="City"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("postalCode", { required: "Postal code is required" })}
            placeholder="Postal Code"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-500">
              {errors.postalCode.message}
            </p>
          )}
        </div>
      </div>

      <textarea
        {...register("deliveryInstructions")}
        placeholder="Delivery Instructions (Optional)"
        rows="3"
        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
      />
    </div>
  );
}
