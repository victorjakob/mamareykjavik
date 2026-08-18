export default function WelcomeText() {
  return (
    <div className="max-w-3xl mx-auto text-center px-6">
      <div className="flex items-center justify-center gap-3 mb-5">
        <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
        <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
          Mama Tours
        </span>
        <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
      </div>
      <h1
        className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-6"
        style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)" }}
      >
        Travel with the
        <br />
        Icelandic locals
      </h1>
      <p className="text-[#a09488] text-base md:text-lg leading-relaxed max-w-xl mx-auto">
        Small-group journeys into Iceland&apos;s living landscapes — steaming
        valleys, warm rivers and old stories — always ending around the table
        at Mama with a nourishing plant-based meal.
      </p>
    </div>
  );
}
