"use client";
import { useState, useEffect } from "react";

export default function GetLocations() {
  const [locations, setLocations] = useState([]);
  const [flytjandiLocations, setFlytjandiLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

        // Extract regular and flytjandi locations
        const regularLocations = Array.isArray(data.codes) ? data.codes : [];
        const flytjandiLocs = Array.isArray(data.flytjandicodes)
          ? data.flytjandicodes
          : [];

        setLocations(regularLocations);
        setFlytjandiLocations(flytjandiLocs);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

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
    <div className="space-y-4">
      <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all">
        <option value="">Select a location</option>
        <optgroup label="Regular Locations">
          {locations.map((location) => (
            <option key={location.code} value={location.code}>
              {location.town} ({location.code})
            </option>
          ))}
        </optgroup>
        <optgroup label="Flytjandi Locations">
          {flytjandiLocations.map((location) => (
            <option key={location.code} value={location.code}>
              {location.town} ({location.code})
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}
