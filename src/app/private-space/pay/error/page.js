import Link from "next/link";

export const metadata = {
  title: "Payment error · The Private Space",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0d0b09] flex items-center justify-center px-6 py-24 text-[#f0ebe3]">
      <div className="max-w-xl text-center">
        <h1 className="font-cormorant font-light italic mb-6 text-red-400" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
          Something went wrong.
        </h1>
        <p className="text-[#a09488] mb-2">
          The payment did not go through. No charge was made to your card.
        </p>
        <p className="text-[#a09488] mb-10">
          Try the payment link again, or call us at <a href="tel:+3546167722" className="text-[#ff914d]">616 7722</a>.
        </p>
        <Link href="/private-space" className="inline-block px-8 py-3.5 border border-white/25 rounded-full text-xs tracking-[0.25em] uppercase hover:bg-white/10 transition">
          Back to The Private Space
        </Link>
      </div>
    </main>
  );
}
