export default function EarlyBirdPricing({
  register,
  showEarlyBird,
  setShowEarlyBird,
}) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-amber-200">
      <h3 className="text-base sm:text-lg font-semibold text-amber-800 mb-3 sm:mb-4 flex items-center gap-2">
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        Early Bird Special
      </h3>
      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register("hasEarlyBird")}
            checked={showEarlyBird}
            onChange={(e) => {
              setShowEarlyBird(e.target.checked);
              // Also update the form value to keep them in sync
              e.target.checked = e.target.checked;
            }}
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
                  placeholder="3500"
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
