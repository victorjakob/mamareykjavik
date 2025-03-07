"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "../../../../../lib/SupabaseProvider";
import GetLocationByStore from "./GetLocationByStore";

export default function ShippingInfo({ register, errors, setShippingCost }) {
  const { user } = useSupabase();
  const [locations, setLocations] = useState([]);
  const [flytjandiLocations, setFlytjandiLocations] = useState([]);
  const [locationType, setLocationType] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Iceland",
  });
  const [showDeliveryInstructions, setShowDeliveryInstructions] =
    useState(false);

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

  useEffect(() => {
    // Fetch locations when component mounts
    const fetchLocations = async () => {
      try {
        const response = await fetch(
          "https://stage.dropp.is/dropp/api/v1/dropp/location/deliveryzips"
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch locations. Status: ${response.status}`
          );
        }
        const data = await response.json();
        setLocations(data.codes || []);
        setFlytjandiLocations(data.flytjandicodes || []);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  // Update validatePostalCode to handle shipping cost
  const validatePostalCode = (postalCode) => {
    const postalCodeStr = String(postalCode);

    const regularLocation = locations.find(
      (loc) => String(loc.code) === postalCodeStr
    );
    const flytjandiLocation = flytjandiLocations.find(
      (loc) => String(loc.code) === postalCodeStr
    );

    if (regularLocation) {
      setLocationType("regular");
      setShippingCost(890);
      return true;
    } else if (flytjandiLocation) {
      setLocationType("flytjandi");
      setShippingCost(1290);
      return true;
    }
    setLocationType(null);
    setShippingCost(0);
    return false;
  };

  // Add this new function to handle immediate validation
  const handlePostalCodeChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      postalCode: value,
    }));
    validatePostalCode(value);
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
            {...register("postalCode", {
              required: "Postal code is required",
              validate: (value) =>
                validatePostalCode(value) || "Invalid postal code",
            })}
            placeholder="Postal Code"
            onChange={handlePostalCodeChange}
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all ${
              errors.postalCode || (!locationType && formData.postalCode)
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-200"
            }`}
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-500">
              {errors.postalCode.message}
            </p>
          )}
          {locationType && (
            <div className="mt-1">
              <p className="text-sm text-emerald-600">
                {locationType === "flytjandi" && ""}
              </p>
              <p className="text-sm font-medium text-gray-700">
                {locationType === "flytjandi" && ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pb-4">
        <button
          type="button"
          onClick={() => setShowDeliveryInstructions(!showDeliveryInstructions)}
          className="text-sm text-gray-600 hover:text-emerald-600 transition-colors"
        >
          {showDeliveryInstructions ? "- Hide" : "+ Add"} delivery instructions
        </button>

        {showDeliveryInstructions && (
          <textarea
            {...register("deliveryInstructions")}
            placeholder="Delivery Instructions (Optional)"
            rows="3"
            className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
          />
        )}
      </div>
    </div>
  );
}
