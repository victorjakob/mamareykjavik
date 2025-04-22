import BookButton from "./BookButton";

export default function Info({ tour }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      {/* Main Info Section */}
      <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            Tour Details
          </h2>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#ff914d]">
                Duration
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                {tour.duration_minutes / 60} hours
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#ff914d]">
                Meeting Point
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Mama Reykjavik Restaurant
              </p>
              <p className="text-gray-600 text-sm sm:text-base">
                Bankastræti 2, 101 Reykjavík
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#ff914d]">
                Group Size
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                Small groups (max {tour.max_capacity} people)
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#ff914d]">
                Price
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                {tour.price.toLocaleString()} ISK per person
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            What to Expect
          </h2>
          <div className="space-y-4 text-gray-700">
            <p className="text-sm sm:text-base">{tour.description}</p>

            <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 text-[#ff914d]">
              Highlights
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              {tour.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 text-[#ff914d]">
              What to Bring
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              <li>Comfortable walking shoes</li>
              <li>Weather-appropriate clothing</li>
              <li>Camera (optional)</li>
              <li>Water bottle</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8 sm:mt-12 bg-gray-50 p-4 sm:p-6 rounded-lg">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#ff914d]">
          Important Information
        </h3>
        <ul className="space-y-2 text-sm sm:text-base text-gray-700">
          <li>
            • Tour runs in all weather conditions (except extreme weather)
          </li>
          <li>• All fitness levels welcomed, not hard walking</li>
          <li>• Tours can be customized for private groups</li>
          <li>• 24-hour cancellation notice required</li>
          <li>• Children must be accompanied by an adult</li>
        </ul>
      </div>

      {/* Booking Button */}
      <div className="mt-8 sm:mt-12 text-center">
        <BookButton tourPath={tour.slug} />
      </div>
    </div>
  );
}
