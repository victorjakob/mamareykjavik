import Link from "next/link";

export const metadata = {
  title: "Payment received · The Private Space",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0d0b09] flex items-center justify-center px-6 py-24 text-[#f0ebe3]">
      <div className="max-w-xl text-center">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
          <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">Confirmed</span>
          <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
        </div>
        <h1 className="font-cormorant font-light italic mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
          You&rsquo;re booked.
        </h1>
        <p className="text-[#a09488] text-base md:text-lg mb-10 leading-relaxed">
          Thank you. The room is held for you. A confirmation with arrival details is on its way to your inbox.
        </p>
        <Link
          href="/private-space"
          className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/25 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/10 transition"
        >
          Back to The Private Space
        </Link>
      </div>
    </main>
  );
}
