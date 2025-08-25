"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

export default function SlidingScaleSelector({
  minPrice,
  maxPrice,
  suggestedPrice,
  onPriceChange,
  className = "",
}) {
  const [selectedPrice, setSelectedPrice] = useState(suggestedPrice);
  const [customPrice, setCustomPrice] = useState(suggestedPrice);

  // Update custom price when selected price changes
  useEffect(() => {
    setCustomPrice(selectedPrice);
  }, [selectedPrice]);

  const handlePriceChange = (price) => {
    setSelectedPrice(price);
    onPriceChange(price);
  };

  const handleCustomPriceChange = (e) => {
    const price = parseInt(e.target.value) || 0;
    setCustomPrice(price);

    // Validate custom price is within range
    if (price >= minPrice && price <= maxPrice) {
      setSelectedPrice(price);
      onPriceChange(price);
    }
  };

  const handleCustomPriceBlur = () => {
    // Ensure custom price is within bounds
    let finalPrice = customPrice;
    if (finalPrice < minPrice) finalPrice = minPrice;
    if (finalPrice > maxPrice) finalPrice = maxPrice;

    setCustomPrice(finalPrice);
    setSelectedPrice(finalPrice);
    onPriceChange(finalPrice);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your Price
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Pay what you can afford between {minPrice} and {maxPrice} ISK
        </p>
      </div>

      {/* Selected Price Highlight */}
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 text-center">
        <p className="text-sm text-emerald-700 mb-1">Your Selected Price</p>
        <p className="text-2xl font-bold text-emerald-800">
          {selectedPrice} ISK
        </p>
        <p className="text-xs text-emerald-600">This is what you&apos;ll pay</p>
      </div>

      {/* Suggested Price Above Slider */}
      <div className="text-center mb-2">
        <p className="text-sm text-gray-600">
          Suggested:{" "}
          <span className="font-semibold text-emerald-700">
            {suggestedPrice} ISK
          </span>
        </p>
      </div>

      {/* Price Slider */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Select a price: {selectedPrice} ISK
        </label>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={selectedPrice}
          onChange={(e) => handlePriceChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${((selectedPrice - minPrice) / (maxPrice - minPrice)) * 100}%, #e5e7eb ${((selectedPrice - minPrice) / (maxPrice - minPrice)) * 100}%, #e5e7eb 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{minPrice} ISK</span>
          <span>{maxPrice} ISK</span>
        </div>
      </div>

      {/* Custom Price Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Or enter custom amount:
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min={minPrice}
            max={maxPrice}
            value={customPrice}
            onChange={handleCustomPriceChange}
            onBlur={handleCustomPriceBlur}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder="Enter amount"
          />
          <span className="text-sm text-gray-500">ISK</span>
        </div>
        {customPrice < minPrice && (
          <p className="text-xs text-red-600">
            Minimum price is {minPrice} ISK
          </p>
        )}
        {customPrice > maxPrice && (
          <p className="text-xs text-red-600">
            Maximum price is {maxPrice} ISK
          </p>
        )}
      </div>

      {/* Price Context */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Your selected price:</span>
          <span className="font-semibold text-gray-900">
            {selectedPrice} ISK
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {selectedPrice < suggestedPrice && (
            <p className="text-amber-600">
              💡 You&apos;re paying below the suggested price. Thank you for
              making this event accessible!
            </p>
          )}
          {selectedPrice === suggestedPrice && (
            <p className="text-emerald-600">
              ✅ Perfect! This helps cover our costs and keeps events
              sustainable.
            </p>
          )}
          {selectedPrice > suggestedPrice && (
            <p className="text-purple-600">
              🌟 Thank you for your generosity! This helps and supports the work
              alot.
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
