"use client";

import { useState, useEffect } from "react";

const GetLocationByStore = ({ postalCode }) => {
  const [mounted, setMounted] = useState(false);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredLocations, setFilteredLocations] = useState([]);

  const STORE_ID = "730b2d45-f3e1-4ea0-b44b-ebd91c1539bc";
  const API_URL = `https://stage.dropp.is/dropp/api/v1/dropp/locations?store=${STORE_ID}`;

  useEffect(() => {
    setMounted(true);
    const fetchLocations = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }
        const data = await response.json();
        console.log("Raw API Response:", data);
        console.log("Codes array:", data.codes);
        console.log("Flytjandicodes array:", data.flytjandicodes);

        // Combine both codes and flytjandicodes arrays
        const locationsList = [
          ...(Array.isArray(data.codes) ? data.codes : []),
          ...(Array.isArray(data.flytjandicodes) ? data.flytjandicodes : []),
        ];
        console.log("Combined locations list:", locationsList);
        setLocations(locationsList);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    console.log("Current postal code:", postalCode);
    console.log("All locations:", locations);
    if (postalCode && locations.length > 0) {
      // Filter locations based on postal code
      const filtered = locations.filter((location) =>
        location.zip_codes?.some((zip) => zip === postalCode)
      );
      console.log("Filtered locations:", filtered);
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  }, [postalCode, locations]);

  // Prevent hydration issues by not rendering until client-side
  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error loading locations: {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-4">Pickup Locations</h2>
      {filteredLocations.length > 0 ? (
        <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all">
          <option value="">Select a pickup location</option>
          {filteredLocations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} - {location.address}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-gray-500">
          {postalCode
            ? "No pickup locations available for this postal code"
            : "Please enter a postal code to see available pickup locations"}
        </p>
      )}
    </div>
  );
};

export default GetLocationByStore;
