"use client";
import { useState, useEffect } from "react";

export default function GetCountries() {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://apitest.mappan.is/wscm/v1/countries",
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_POSTURINN_API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch countries. Status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Fetched countries:", data); // Debugging step

        // Ensure we extract the correct array
        const countryList = Array.isArray(data.countries) ? data.countries : [];
        setCountries(countryList);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
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
        Error loading countries: {error}
      </div>
    );
  }

  return (
    <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all">
      <option value="">Select a country</option>
      {countries.map((country) => (
        <option key={country.countryCode} value={country.countryCode}>
          {country.nameLong}
        </option>
      ))}
    </select>
  );
}
