export default function SlidingScalePricing({
  register,
  showSlidingScale,
  setShowSlidingScale,
  watch,
  errors,
}) {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-6 border border-emerald-200">
      <h3 className="text-base sm:text-lg font-semibold text-emerald-800 mb-3 sm:mb-4 flex items-center gap-2">
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
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
              // Also update the form value to keep them in sync
              e.target.checked = e.target.checked;
            }}
            className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
          />
          <span className="text-sm font-medium text-emerald-700">
            Enable Sliding Scale Pricing
          </span>
        </label>

        {showSlidingScale && (
          <div className="space-y-4 pl-6 border-l-2 border-emerald-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Price (ISK)
                </label>
                <input
                  {...register("sliding_scale_min")}
                  type="number"
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="2000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Price (ISK)
                </label>
                <input
                  {...register("sliding_scale_max")}
                  type="number"
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="8000"
                />
              </div>
            </div>
            <p className="text-xs text-emerald-600 bg-emerald-50 p-3 rounded-lg">
              💡 The main price field above will be used as the suggested price
              for sliding scale. Attendees can choose any amount between the
              minimum and maximum, with your main price highlighted as the
              recommended option.
            </p>

            {/* Price Range Validation */}
            {showSlidingScale && watch && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
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

                {/* Min/Max Validation */}
                {watch("sliding_scale_min") &&
                  watch("sliding_scale_max") &&
                  (() => {
                    const minPrice =
                      parseInt(watch("sliding_scale_min"), 10) || 0;
                    const maxPrice =
                      parseInt(watch("sliding_scale_max"), 10) || 0;

                    if (minPrice >= maxPrice && minPrice > 0 && maxPrice > 0) {
                      return (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Minimum price must be less than maximum price
                        </p>
                      );
                    }
                    return null;
                  })()}

                {/* Main Price Range Validation */}
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
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Main price ({mainPrice} ISK) is below the minimum (
                          {minPrice} ISK)
                        </p>
                      );
                    } else if (mainPrice > maxPrice) {
                      return (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Main price ({mainPrice} ISK) is above the maximum (
                          {maxPrice} ISK)
                        </p>
                      );
                    } else {
                      return (
                        <p className="text-xs text-green-600 mt-1">
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
