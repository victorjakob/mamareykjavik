import Image from "next/image";
import Link from "next/link";

export default function TourCards() {
  return (
    <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-2 gap-8">
      {/* Ocean Path Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <div className="relative h-64">
          <Image
            src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1745168491/relic2_c15dsg.jpg"
            alt="Ocean Path Tour"
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-3 text-gray-800">
            The Ocean Path
          </h3>
          <p className="text-gray-600 mb-4">
            Discover the breathtaking coastal views and hidden beaches along
            Reykjaviks stunning shoreline. Experience the raw beauty of the
            North Atlantic Ocean while learning about local marine life and
            culture.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[#ff914d] font-semibold">
              Duration: 2 hours
            </span>
            <Link
              href="/tours/ocean-path"
              className="bg-[#ff914d] text-white px-6 py-2 rounded-full hover:bg-[#e67f3d] transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* City Path Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <div className="relative h-64">
          <Image
            src="https://res.cloudinary.com/dy8q4hf0k/image/upload/v1745168522/swans-tjornin_g4zypc.jpg"
            alt="City Path Tour"
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-2xl font-bold mb-3 text-gray-800">
            The City Path
          </h3>
          <p className="text-gray-600 mb-4">
            Journey through Reykjaviks charming streets and discover its vibrant
            culture, historic landmarks, and local secrets. Experience the citys
            unique blend of modern life and rich heritage.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[#ff914d] font-semibold">
              Duration: 2.5 hours
            </span>
            <Link
              href="/tours/city-path"
              className="bg-[#ff914d] text-white px-6 py-2 rounded-full hover:bg-[#e67f3d] transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
