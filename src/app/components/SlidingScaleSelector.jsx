"use client";

import { useState, useEffect } from "react";

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

  const fillPercent =
    maxPrice > minPrice
      ? ((selectedPrice - minPrice) / (maxPrice - minPrice)) * 100
      : 0;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Heading */}
      <div className="text-center">
        <label className="block text-xs uppercase tracking-[0.2em] text-[#7a6a5a] mb-2">
          Choose Your Price
        </label>
        <p className="text-sm text-[#a09488]">
          Pay what you can afford between {minPrice} and {maxPrice} ISK
        </p>
      </div>

      {/* Selected Price Highlight */}
      <div className="rounded-xl border border-[#ff914d]/30 bg-[#ff914d]/[0.06] p-5 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#7a6a5a] mb-1">
          Your selected price
        </p>
        <p className="text-3xl font-light text-[#ff914d]">{selectedPrice} ISK</p>
        <p className="mt-1 text-xs text-[#7a6a5a]">This is what you&apos;ll pay</p>
      </div>

      {/* Price Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-[0.18em] text-[#7a6a5a]">
            Drag to adjust
          </label>
          <span className="text-sm text-[#a09488]">
            Suggested:{" "}
            <span className="font-medium text-[#ff914d]">
              {suggestedPrice} ISK
            </span>
          </span>
        </div>
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={selectedPrice}
          onChange={(e) => handlePriceChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #ff914d 0%, #ff914d ${fillPercent}%, rgba(240,235,227,0.10) ${fillPercent}%, rgba(240,235,227,0.10) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-[#7a6a5a]">
          <span>{minPrice} ISK</span>
          <span>{maxPrice} ISK</span>
        </div>
      </div>

      {/* Custom Price Input */}
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-[0.18em] text-[#7a6a5a]">
          Or enter a custom amount
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={minPrice}
            max={maxPrice}
            value={customPrice}
            onChange={handleCustomPriceChange}
            onBlur={handleCustomPriceBlur}
            className="flex-1 p-3 rounded-lg border border-[#f0ebe3]/[0.12] bg-[#f0ebe3]/[0.04] text-[#f0ebe3] placeholder-[#7a6a5a] focus:ring-2 focus:ring-[#ff914d]/50 focus:border-[#ff914d]/50 transition-colors"
            placeholder="Enter amount"
          />
          <span className="text-sm text-[#7a6a5a]">ISK</span>
        </div>
        {customPrice < minPrice && (
          <p className="text-xs text-red-400">Minimum price is {minPrice} ISK</p>
        )}
        {customPrice > maxPrice && (
          <p className="text-xs text-red-400">Maximum price is {maxPrice} ISK</p>
        )}
      </div>

      {/* Price Context */}
      <div className="rounded-lg border border-[#f0ebe3]/[0.07] bg-[#f0ebe3]/[0.04] p-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#a09488]">Your selected price</span>
          <span className="font-medium text-[#f0ebe3]">{selectedPrice} ISK</span>
        </div>
        <div className="mt-2 text-xs leading-relaxed">
          {selectedPrice < suggestedPrice && (
            <p className="text-amber-400/90">
              You&apos;re paying below the suggested price. Thank you for making
              this event accessible.
            </p>
          )}
          {selectedPrice === suggestedPrice && (
            <p className="text-emerald-400/90">
              Perfect — this helps cover our costs and keeps events sustainable.
            </p>
          )}
          {selectedPrice > suggestedPrice && (
            <p className="text-[#ff914d]/90">
              Thank you for your generosity — it genuinely supports the work.
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: #ff914d;
          cursor: pointer;
          border: 2px solid #1a1208;
          box-shadow: 0 2px 8px rgba(255, 145, 77, 0.4);
        }

        .slider::-moz-range-thumb {
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: #ff914d;
          cursor: pointer;
          border: 2px solid #1a1208;
          box-shadow: 0 2px 8px rgba(255, 145, 77, 0.4);
        }
      `}</style>
    </div>
  );
}
