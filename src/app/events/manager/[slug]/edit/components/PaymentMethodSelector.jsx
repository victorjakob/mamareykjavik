export default function PaymentMethodSelector({ register, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Payment Option
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["online", "door", "free"].map((option) => (
          <label
            key={option}
            className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          >
            <input
              {...register("payment")}
              type="radio"
              value={option}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
              {option === "door"
                ? "Pay at the Door"
                : option === "online"
                ? "Pay Online"
                : "Free Event"}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
