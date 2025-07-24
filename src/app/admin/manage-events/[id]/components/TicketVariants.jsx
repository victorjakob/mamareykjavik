export default function TicketVariants({
  ticketVariants,
  addTicketVariant,
  removeTicketVariant,
  updateTicketVariant,
}) {
  return (
    <div className="space-y-4">
      {ticketVariants.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-amber-600"
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
              Price Variants
            </h3>
            <button
              type="button"
              onClick={addTicketVariant}
              className="text-amber-600 hover:text-amber-800 font-medium text-sm flex items-center gap-1"
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
              Add Variant
            </button>
          </div>

          {ticketVariants.map((variant, index) => (
            <div
              key={index}
              className="p-4 border-2 border-amber-100 rounded-xl space-y-4 bg-gradient-to-r from-amber-25 to-orange-25"
            >
              <div className="flex justify-between items-start">
                <h4 className="text-md font-semibold text-amber-800">
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
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) =>
                    updateTicketVariant(index, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 bg-white/70 text-sm"
                  placeholder="e.g., VIP, General Admission"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-700 mb-2">
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
                  className="w-full px-3 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 bg-white/70 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-700 mb-2">
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
                  className="w-full px-3 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 bg-white/70 text-sm"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {ticketVariants.length === 0 && (
        <button
          type="button"
          onClick={addTicketVariant}
          className="w-full p-6 border-2 border-dashed border-amber-300 rounded-xl text-amber-600 hover:text-amber-800 hover:border-amber-400 transition-all duration-200 bg-gradient-to-r from-amber-25 to-orange-25 hover:from-amber-50 hover:to-orange-50"
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
            <span className="font-medium">Add Price Variants</span>
            <span className="text-sm text-amber-500">
              Create different ticket types with varying prices
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
