export default function SlidingScalePricing({
  register,
  showSlidingScale,
  setShowSlidingScale,
  watch,
  errors,
}) {
  return (
    <div
      className="rounded-xl p-4 sm:p-6"
      style={{
        background: "#faf6f2",
        border: "1px solid #e8ddd3",
      }}
    >
      <h3 className="text-base sm:text-lg font-semibold text-[#2c1810] mb-3 sm:mb-4 flex items-center gap-2">
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff914d]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Sliding Scale Pricing
      </h3>
      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register("hasSlidingScale")}
            checked={showSlidingScale}
            onChange={(e) => {
              setShowSlidingScale(e.target.checked);
              e.target.checked = e.target.checked;
            }}
            className="w-4 h-4 accent-[#ff914d] rounded"
          />
          <span className="text-sm font-medium text-[#2c1810]">
            Enable Sliding Scale Pricing
          </span>
        </label>

        {showSlidingScale && (
          <div
            className="space-y-4 pl-6"
            style={{ borderLeft: "2px solid #e8ddd3" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#9a7a62] mb-1">
                  Minimum Price (ISK)
                </label>
                <input
                  {...register("sliding_scale_min")}
                  type="number"
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff914d]/30 focus:border-[#ff914d]/60 transition-colors bg-white"
                  style={{ border: "1px solid #e8ddd3", color: "#2c1810" }}
                  placeholder="2000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9a7a62] mb-1">
                  Maximum Price (ISK)
                </label>
                <input
                  {...register("sliding_scale_max")}
                  type="number"
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff914d]/30 focus:border-[#ff914d]/60 transition-colors bg-white"
                  style={{ border: "1px solid #e8ddd3", color: "#2c1810" }}
                  placeholder="8000"
                />
              </div>
            </div>
            <p
              className="text-xs text-[#9a7a62] p-3 rounded-lg"
              style={{ background: "#ffffff", border: "1px solid #e8ddd3" }}
            >
              💡 The main price field above will be used as the suggested price
              for sliding scale. Attendees can choose any amount between the
              minimum and maximum, with your main price highlighted as the
              recommended option.
            </p>

            {showSlidingScale && watch && (
              <div
                className="rounded-lg p-3"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e8ddd3",
                }}
              >
                <p className="text-xs text-[#2c1810]">
                  <strong>Price Range Check:</strong> Your main price should be
                  between{" "}
                  <span className="font-mono">
                    {watch("sliding_scale_min") || "0"}
                  </span>{" "}
                  and{" "}
                  <span className="font-mono">
                    {watch("sliding_scale_max") || "0"}
                  </span>{" "}
                  ISK.
                </p>

                {watch("sliding_scale_min") &&
                  watch("sliding_scale_max") &&
                  (() => {
                    const minPrice =
                      parseInt(watch("sliding_scale_min"), 10) || 0;
                    const maxPrice =
                      parseInt(watch("sliding_scale_max"), 10) || 0;

                    if (minPrice >= maxPrice && minPrice > 0 && maxPrice > 0) {
                      return (
                        <p className="text-xs text-[#c05a1a] mt-1">
                          ⚠️ Minimum price must be less than maximum price
                        </p>
                      );
                    }
                    return null;
                  })()}

                {watch("price") &&
                  watch("sliding_scale_min") &&
                  watch("sliding_scale_max") &&
                  (() => {
                    const mainPrice = parseInt(watch("price"), 10) || 0;
                    const minPrice =
                      parseInt(watch("sliding_scale_min"), 10) || 0;
                    const maxPrice =
                      parseInt(watch("sliding_scale_max"), 10) || 0;

                    if (mainPrice < minPrice) {
                      return (
                        <p className="text-xs text-[#c05a1a] mt-1">
                          ⚠️ Main price ({mainPrice} ISK) is below the minimum (
                          {minPrice} ISK)
                        </p>
                      );
                    } else if (mainPrice > maxPrice) {
                      return (
                        <p className="text-xs text-[#c05a1a] mt-1">
                          ⚠️ Main price ({mainPrice} ISK) is above the maximum (
                          {maxPrice} ISK)
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-xs text-[#5a8a5a] mt-1">
                          ✅ Main price ({mainPrice} ISK) is within the valid
                          range
                        </p>
                      );
                    }
                  })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
