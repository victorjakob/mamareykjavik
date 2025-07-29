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
            <h2 className="text-lg font-semibold text-gray-800">
              Price Variants
            </h2>
            <button
              type="button"
              onClick={addTicketVariant}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Variant
            </button>
          </div>

          <div className="grid gap-4">
            {ticketVariants.map((variant, index) => (
              <div
                key={index}
                className="p-6 border rounded-lg space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <h3 className="text-md font-medium text-gray-800">
                      Variant {index + 1}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTicketVariant(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) =>
                        updateTicketVariant(index, "name", e.target.value)
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="e.g., VIP, General Admission"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (ISK)
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">kr</span>
                      </div>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          updateTicketVariant(
                            index,
                            "price",
                            parseInt(e.target.value)
                          )
                        }
                        min="0"
                        className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {ticketVariants.length === 0 && (
        <button
          type="button"
          onClick={addTicketVariant}
          className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors duration-200 flex flex-col items-center justify-center space-y-2"
        >
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-lg font-medium">Add Price Variants</span>
          <span className="text-sm text-gray-500">
            Click to add different ticket types and prices
          </span>
        </button>
      )}
    </div>
  );
}
