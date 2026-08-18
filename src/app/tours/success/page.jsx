import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div
      data-navbar-theme="dark"
      className="min-h-screen bg-[#110f0d] flex flex-col items-center justify-center p-10 text-center"
    >
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#ff914d]/50" />
        <span className="text-xs uppercase tracking-[0.35em] text-[#ff914d]">
          Mama Tours
        </span>
        <div className="w-10 h-px bg-gradient-to-l from-transparent to-[#ff914d]/50" />
      </div>
      <h1
        className="font-cormorant font-light italic text-[#f0ebe3] leading-tight mb-6"
        style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
      >
        Your spot is reserved ✦
      </h1>
      <p className="text-[#c4b8aa] text-lg max-w-md">
        Thank you for your booking — we&apos;ve received your payment.
      </p>
      <p className="mt-4 text-sm text-[#8a7e72] max-w-md">
        A confirmation email is on its way. We look forward to walking with
        you.
      </p>
      <Link
        href="/tours"
        className="mt-10 inline-flex items-center gap-2 px-6 py-2.5 border border-white/20 text-[#f0ebe3] text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/10 hover:border-white/40 transition-all duration-200"
      >
        Back to Mama Tours →
      </Link>
    </div>
  );
}
