export default function SubmitButton({
  isSubmitting,
  imageProcessing,
  isDisabled = false,
}) {
  const disabled = isSubmitting || imageProcessing || isDisabled;
  const showAgreementLabel = isDisabled && !isSubmitting && !imageProcessing;

  return (
    <div className="pt-6 sm:pt-8">
      <button
        type="submit"
        disabled={disabled}
        className="w-full px-6 sm:px-8 py-2 sm:py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating Event...
          </div>
        ) : showAgreementLabel ? (
          "Agree to policy to continue"
        ) : (
          "Create Event"
        )}
      </button>
    </div>
  );
}
