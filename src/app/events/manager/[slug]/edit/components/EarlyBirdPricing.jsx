export default function EarlyBirdPricing({
  register,
  showEarlyBird,
  setShowEarlyBird,
}) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 sm:p-6 border border-amber-200">
      <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3 sm:mb-4 flex items-center gap-2">
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM10 12a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        Early Bird Pricing
      </h3>
      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register("hasEarlyBird")}
            checked={showEarlyBird}
            onChange={(e) => setShowEarlyBird(e.target.checked)}
            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Enable early bird pricing
          </span>
        </label>

        {showEarlyBird && (
          <div className="space-y-4 pl-6 border-l-2 border-amber-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Early Bird Price (ISK)
                </label>
                <input
                  {...register("early_bird_price")}
                  type="number"
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  placeholder="4000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Early Bird End Date
                </label>
                <input
                  {...register("early_bird_date")}
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
              ⏰ Early bird pricing encourages early registrations by offering a
              discounted rate before the specified end date. This helps you
              gauge interest and secure commitments early.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
