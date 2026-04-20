export default function PriceVariants({
  ticketVariants,
  addTicketVariant,
  removeTicketVariant,
  updateTicketVariant,
  showVariants,
  setShowVariants,
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
            }}
            className="w-4 h-4 accent-[#ff914d] rounded"
          />
          <span className="text-sm font-medium text-[#2c1810]">
            Create different ticket types with varying prices
          </span>
        </label>

        {showVariants && (
          <div
            className="space-y-4 pl-6"
            style={{ borderLeft: "2px solid #e8ddd3" }}
          >
            {ticketVariants.length > 0 ? (
              <div className="space-y-4">
                {ticketVariants.map((variant, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl space-y-4 bg-white"
                    style={{ border: "1px solid #e8ddd3" }}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-md font-semibold text-[#2c1810]">
                        Variant {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeTicketVariant(index)}
                        className="text-[#c05a1a] hover:text-[#8a3f10] p-1 rounded-full hover:bg-[#faf6f2] transition-colors"
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
                      <label className="block text-sm font-medium text-[#9a7a62] mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) =>
                          updateTicketVariant(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff914d]/30 focus:border-[#ff914d]/60 transition-all duration-200 bg-white text-sm"
                        style={{ border: "1px solid #e8ddd3", color: "#2c1810" }}
                        placeholder="e.g., VIP, General Admission"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#9a7a62] mb-2">
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
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff914d]/30 focus:border-[#ff914d]/60 transition-all duration-200 bg-white text-sm"
                        style={{ border: "1px solid #e8ddd3", color: "#2c1810" }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#9a7a62] mb-2">
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
                        className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff914d]/30 focus:border-[#ff914d]/60 transition-all duration-200 bg-white text-sm"
                        style={{ border: "1px solid #e8ddd3", color: "#2c1810" }}
                        placeholder="Leave empty for unlimited"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTicketVariant}
                  className="w-full p-3 rounded-xl text-[#ff914d] hover:text-[#c76a2b] transition-all duration-200 bg-white text-sm font-medium flex items-center justify-center gap-2"
                  style={{ border: "2px dashed #e8ddd3" }}
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
                className="w-full p-6 rounded-xl text-[#ff914d] hover:text-[#c76a2b] transition-all duration-200 bg-white"
                style={{ border: "2px dashed #e8ddd3" }}
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
                  <span className="text-sm text-[#9a7a62]">
                    e.g., VIP, Student, General Admission
                  </span>
                </div>
              </button>
            )}

            <p
              className="text-xs text-[#9a7a62] p-3 rounded-lg"
              style={{ background: "#ffffff", border: "1px solid #e8ddd3" }}
            >
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
