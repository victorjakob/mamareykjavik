import Image from "next/image";
import BookButton from "./BookButton";

export default function Hero({ tour }) {
  return (
    <section
      data-navbar-theme="light"
      className="relative h-screen min-h-[600px] w-full flex items-center justify-center overflow-hidden"
    >
      <Image
        src={tour.image_url}
        alt={`${tour.name} — Mama Tours`}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/25 to-[#110f0d]" />

      <div className="relative z-10 text-center px-6 flex flex-col items-center max-w-4xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/70" />
          <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
            Mama Tours
          </span>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/70" />
        </div>

        <h1
          className="font-cormorant font-light italic text-white leading-tight mb-5"
          style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
        >
          {tour.name}
        </h1>

        {tour.subtitle && (
          <p className="text-sm text-white/70 max-w-md font-light tracking-[0.22em] uppercase mb-9">
            {tour.subtitle}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 text-xs sm:text-sm">
          {tour.schedule_note && (
            <span className="px-5 py-2 rounded-full border border-white/30 text-white/85 backdrop-blur-sm">
              {tour.schedule_note}
            </span>
          )}
          <span className="px-5 py-2 rounded-full border border-white/30 text-white/85 backdrop-blur-sm">
            {Math.round((tour.duration_minutes / 60) * 10) / 10} hour experience
          </span>
          <span className="px-5 py-2 rounded-full border border-white/30 text-white/85 backdrop-blur-sm">
            Max {tour.max_capacity} guests
          </span>
          <span className="px-5 py-2 rounded-full border border-white/30 text-white/85 backdrop-blur-sm">
            {tour.price.toLocaleString()} ISK per person
          </span>
        </div>

        <BookButton tourPath={tour.slug} />
      </div>
    </section>
  );
}
