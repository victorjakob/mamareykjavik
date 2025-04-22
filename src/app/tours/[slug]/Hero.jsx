import Image from "next/image";
import BookButton from "./BookButton";

export default function Hero({ tour }) {
  return (
    <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] w-full">
      {/* Hero Image */}
      <Image
        src={tour.image_url}
        alt={`${tour.name} Tour in Reykjavik`}
        fill
        priority
        className="object-cover brightness-[0.85]"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-black/30">
        <div className="h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
          <div className="text-white">
            <h1 className="pt-16 sm:pt-20 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-3 sm:mb-4">
              {tour.name}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mb-6 sm:mb-8">
              {tour.description}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8">
              <span className="bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base">
                {tour.duration_minutes / 60} Hour Experience
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base">
                {tour.price.toLocaleString()} ISK per person
              </span>
            </div>
            <div className="animate-fade-in-up">
              <BookButton tourPath={tour.slug} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
