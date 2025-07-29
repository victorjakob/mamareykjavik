export default function EarlyBirdPricing({
  register,
  showEarlyBird,
  setShowEarlyBird,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <input
          id="early-bird-toggle"
          type="checkbox"
          checked={showEarlyBird}
          onChange={(e) => setShowEarlyBird(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label
          htmlFor="early-bird-toggle"
          className="ml-2 block text-sm font-medium text-gray-700"
        >
          Enable Early Bird Pricing
        </label>
      </div>

      {showEarlyBird && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Early Bird Price (ISK)
            </label>
            <input
              type="number"
              {...register("early_bird_price")}
              min="0"
              step="1"
              placeholder="4000"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Early Bird End Date
            </label>
            <input
              type="datetime-local"
              {...register("early_bird_date")}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
