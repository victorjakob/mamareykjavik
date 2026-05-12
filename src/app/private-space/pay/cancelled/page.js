import Link from "next/link";

export const metadata = {
  title: "Payment cancelled · The Private Space",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0d0b09] flex items-center justify-center px-6 py-24 text-[#f0ebe3]">
      <div className="max-w-xl text-center">
        <h1 className="font-cormorant font-light italic mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
          Payment cancelled.
        </h1>
        <p className="text-[#a09488] mb-10">
          No charge was made. Your booking is still pending — the original payment link in your email is still valid.
        </p>
        <Link href="/private-space" className="inline-block px-8 py-3.5 border border-white/25 rounded-full text-xs tracking-[0.25em] uppercase hover:bg-white/10 transition">
          Back to The Private Space
        </Link>
      </div>
    </main>
  );
}
