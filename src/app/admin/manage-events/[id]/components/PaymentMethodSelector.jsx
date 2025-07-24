export default function PaymentMethodSelector({ register, error }) {
  const paymentOptions = [
    { value: "online", label: "Pay Online" },
    { value: "door", label: "Pay at the Door" },
    { value: "free", label: "Free Event" },
  ];

  return (
    <div>
      <label
        htmlFor="payment"
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        Payment Method
      </label>
      <div className="space-y-2">
        {paymentOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-amber-300 transition-colors cursor-pointer"
          >
            <input
              {...register("payment")}
              type="radio"
              value={option.value}
              defaultChecked={option.value === "online"}
              className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}
