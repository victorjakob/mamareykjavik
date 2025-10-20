export default function PriceVariants({
  ticketVariants,
  addTicketVariant,
  removeTicketVariant,
  updateTicketVariant,
  showVariants,
  setShowVariants,
}) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-purple-200">
      <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-3 sm:mb-4 flex items-center gap-2">
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          />
        </svg>
        Add Price Variants
      </h3>
      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showVariants}
            onChange={(e) => {
              setShowVariants(e.target.checked);
              // If unchecking, we could optionally clear variants
              // but keeping them allows toggling without data loss
            }}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Create different ticket types with varying prices
          </span>
        </label>

        {showVariants && (
          <div className="space-y-4 pl-6 border-l-2 border-purple-200">
            {ticketVariants.length > 0 ? (
              <div className="space-y-4">
                {ticketVariants.map((variant, index) => (
                  <div
                    key={index}
                    className="p-4 border-2 border-purple-100 rounded-xl space-y-4 bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-md font-semibold text-purple-800">
                        Variant {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeTicketVariant(index)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) =>
                          updateTicketVariant(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white text-sm"
                        placeholder="e.g., VIP, General Admission"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">
                        Price (ISK)
                      </label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          updateTicketVariant(
                            index,
                            "price",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="0"
                        className="w-full px-3 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-2">
                        Capacity (optional)
                      </label>
                      <input
                        type="number"
                        value={variant.capacity || ""}
                        onChange={(e) =>
                          updateTicketVariant(
                            index,
                            "capacity",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        min="1"
                        className="w-full px-3 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white text-sm"
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTicketVariant}
                  className="w-full p-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:text-purple-800 hover:border-purple-400 transition-all duration-200 bg-white hover:bg-purple-25 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Another Variant
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={addTicketVariant}
                className="w-full p-6 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:text-purple-800 hover:border-purple-400 transition-all duration-200 bg-white hover:bg-purple-25"
              >
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="font-medium">Create First Variant</span>
                  <span className="text-sm text-purple-500">
                    e.g., VIP, Student, General Admission
                  </span>
                </div>
              </button>
            )}

            <p className="text-xs text-purple-600 bg-purple-50 p-3 rounded-lg">
              🎟️ Price variants let you offer different ticket types (VIP,
              Student, Early Access, etc.) at different prices. Each variant can
              have its own capacity limit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
