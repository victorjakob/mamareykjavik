import Image from "next/image";
import BookButton from "./BookButton";
import PrivateTourSection from "./PrivateTourSection";
import { formatPrice } from "@/util/IskFormat";

function Eyebrow({ children }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
      <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
        {children}
      </span>
      <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
    </div>
  );
}

function DetailBlock({ label, children }) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#ff914d] mb-2">
        {label}
      </h3>
      <div className="text-[#c4b8aa] text-sm sm:text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function ListCard({ title, items }) {
  return (
    <div className="p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06] h-full">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#ff914d] mb-4">
        {title}
      </h3>
      <ul className="space-y-2.5 text-sm text-[#c4b8aa] leading-relaxed">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3">
            <span className="text-[#ff914d]/60 mt-0.5">✦</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Info({ tour }) {
  const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];
  const included = tour.included || [];
  const whatToBring = tour.what_to_bring || [];
  const importantInfo = tour.important_info || [];

  return (
    <div
      data-navbar-theme="dark"
      className="w-full bg-[#110f0d] text-[#f0ebe3]"
    >
      {/* ── The journey ── */}
      {tour.long_description && (
        <section className="py-20 sm:py-24 px-6 bg-[#160f0a] border-b border-white/[0.06]">
          <div className="max-w-3xl mx-auto text-center">
            <Eyebrow>The journey</Eyebrow>
            <div className="space-y-6 text-left sm:text-center">
              {tour.long_description.split("\n\n").map((paragraph, i) =>
                i === 0 ? (
                  <p
                    key={i}
                    className="font-cormorant font-light italic text-[#f0ebe3] leading-snug"
                    style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}
                  >
                    {paragraph}
                  </p>
                ) : (
                  <p
                    key={i}
                    className="text-[#a09488] text-base md:text-lg leading-relaxed"
                  >
                    {paragraph}
                  </p>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Gallery ── */}
      {Array.isArray(tour.gallery) && tour.gallery.length > 0 && (
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {tour.gallery.map((src, index) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl bg-[#1e1812] border border-white/[0.06] ${
                    index === 0 ? "col-span-2 row-span-2 md:col-span-1" : ""
                  }`}
                  style={{ aspectRatio: index === 0 ? "1/1" : "4/3" }}
                >
                  <Image
                    src={src}
                    alt={`${tour.name} — impression ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Details + itinerary ── */}
      <section className="py-20 sm:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 sm:gap-20">
            {/* Details */}
            <div>
              <h2
                className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-10"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                The details
              </h2>
              <div className="space-y-8">
                {tour.schedule_note && (
                  <DetailBlock label="When">{tour.schedule_note}</DetailBlock>
                )}
                <DetailBlock label="Meeting point">
                  {(tour.meeting_point ||
                    "Mama Reykjavík\nBankastræti 2, 101 Reykjavík")
                    .split("\n")
                    .map((line, i) => (
                      <p key={i} className={i > 0 ? "text-[#8a7e72]" : ""}>
                        {line}
                      </p>
                    ))}
                </DetailBlock>
                <DetailBlock label="Group size">
                  Small groups — maximum {tour.max_capacity} guests
                </DetailBlock>
                {tour.difficulty && (
                  <DetailBlock label="The hike">{tour.difficulty}</DetailBlock>
                )}
                {tour.min_age && (
                  <DetailBlock label="Minimum age">
                    {tour.min_age} years
                  </DetailBlock>
                )}
                <DetailBlock label="Price">
                  {formatPrice(tour.price)} per person
                </DetailBlock>
              </div>
            </div>

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <div>
                <h2
                  className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-10"
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                >
                  Your day
                </h2>
                <div>
                  {itinerary.map((step, index) => (
                    <div key={index} className="flex gap-5">
                      <span className="text-sm font-semibold text-[#ff914d] w-12 text-right pt-0.5 tabular-nums">
                        {step.time}
                      </span>
                      <div className="flex flex-col items-center">
                        <span className="w-2 h-2 rounded-full bg-[#ff914d] mt-1.5" />
                        {index !== itinerary.length - 1 && (
                          <span className="w-px flex-1 bg-[#ff914d]/20" />
                        )}
                      </div>
                      <p className="text-[#c4b8aa] text-sm sm:text-base pb-7 leading-relaxed">
                        {step.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Included / bring */}
          {(included.length > 0 || whatToBring.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-5 mt-16">
              {included.length > 0 && (
                <ListCard title="Included" items={included} />
              )}
              {whatToBring.length > 0 && (
                <ListCard title="What to bring" items={whatToBring} />
              )}
            </div>
          )}

          {/* Weather & safety */}
          {importantInfo.length > 0 && (
            <div className="mt-5 p-7 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#ff914d] mb-4">
                Weather, safety &amp; good to know
              </h3>
              <ul className="space-y-2.5 text-sm text-[#b0a498] leading-relaxed">
                {importantInfo.map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-[#ff914d]/60 mt-0.5">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center">
            <BookButton tourPath={tour.slug} />
          </div>
        </div>
      </section>

      {/* ── Private journey ── */}
      {tour.private_base_price && <PrivateTourSection tour={tour} />}
    </div>
  );
}
