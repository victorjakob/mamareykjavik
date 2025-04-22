import Link from "next/link";

export default function Success() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-8">
          Thank you for your booking. You will receive a confirmation email
          shortly with all the details.
        </p>

        <Link
          href="/tours"
          className="inline-block bg-[#ff914d] text-white font-medium rounded-lg px-6 py-3 hover:bg-[#ff5733] transition-colors"
        >
          Return to Tours
        </Link>
      </div>
    </div>
  );
}
