// Shared early-bird pricing block, used by BOTH the admin create flow and the
// host edit flow (re-exported from each flow's components/index.js).
//
// Two mutually exclusive end conditions ("modes"), picked per event:
//   • "date"    — early bird runs until a deadline (the original behaviour)
//   • "tickets" — early bird applies to the first N tickets sold
// The mode is stored implicitly in the DB: early_bird_ticket_limit set ⇒
// tickets mode, otherwise early_bird_date ⇒ date mode. The form keeps an
// explicit early_bird_mode field so the UI stays unambiguous while editing.
export default function EarlyBirdPricing({
  register,
  watch,
  showEarlyBird,
  setShowEarlyBird,
}) {
  const mode = watch ? watch("early_bird_mode") || "date" : "date";

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

            {/* End-condition picker: deadline vs. first N tickets */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Early bird ends
              </span>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="date"
                    {...register("early_bird_mode")}
                    className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">On a date</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="tickets"
                    {...register("early_bird_mode")}
                    className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-700">
                    After N tickets are sold
                  </span>
                </label>
              </div>
            </div>

            {mode === "tickets" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Early Bird Tickets
                </label>
                <input
                  {...register("early_bird_ticket_limit")}
                  type="number"
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  placeholder="10"
                />
                <p className="mt-1 text-xs text-gray-500">
                  The first N tickets sell at the early bird price; everyone
                  after pays full price. An order placed while early bird is
                  still active gets the discounted price for its whole order.
                </p>
              </div>
            ) : (
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
            )}

            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
              ⏰ Early bird pricing encourages early registrations by offering a
              discounted rate — either until a deadline or for the first
              tickets sold. This helps you gauge interest and secure
              commitments early.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
