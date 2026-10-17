// Landing page after Teya's SecurePay for payment links.
// Display only — the payment itself is recorded by /api/pay/callback.
// Optional `reference` (or `ref`) and `amount` query params are shown on the success state
// when present (they're just echoed for the customer, never trusted).
import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Payment · Mama Reykjavík", robots: { index: false } };

const COPY = {
  success: {
    eyebrow: "Payment received",
    title: "Takk fyrir!",
    body: "Thank you, your payment is safely with us. Teya will email you a receipt.",
    tone: "ok",
  },
  unverified: {
    eyebrow: "Almost there",
    title: "Thank you",
    body: "We're confirming your payment. If anything looks wrong, write to team@mama.is.",
    tone: "ok",
  },
  cancel: {
    eyebrow: "Payment cancelled",
    title: "No worries",
    body: "No money was taken. You can open the link again whenever you're ready.",
    tone: "neutral",
  },
  error: {
    eyebrow: "Payment not completed",
    title: "Something went wrong",
    body: "No payment was completed. Please try the link again or write to team@mama.is.",
    tone: "neutral",
  },
};

// 6080 → "6.080 kr." (Icelandic thousands separator)
function formatKr(value) {
  const n = Math.round(Number(String(value).replace(/[^\d.]/g, "")));
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} kr.`;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export default async function PayResultPage({ searchParams }) {
  const sp = await searchParams;
  const status = COPY[sp?.status] ? sp.status : "error";
  const c = COPY[status];
  const isOk = c.tone === "ok";
  const rawRef = sp?.reference ?? sp?.ref;
  const reference = typeof rawRef === "string" && rawRef.trim() ? rawRef.slice(0, 80) : null;
  const amount = sp?.amount ? formatKr(sp.amount) : null;
  const showReceipt = status === "success" && (reference || amount);

  return (
    <div className="min-h-screen bg-[#fbf5ec]">
      {/* Dark espresso band keeps the site navbar legible, like the rest of mama.is */}
      <section
        data-navbar-theme="dark"
        className="relative overflow-hidden bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12] pt-24 sm:pt-28 pb-16 px-5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,145,77,0.35) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(31,92,75,0.3) 0%, transparent 55%)",
          }}
        />
      </section>

      <main className="relative -mt-14 px-5 pb-16">
        <div className="max-w-md mx-auto rounded-3xl bg-white shadow-[0_10px_40px_-12px_rgba(44,24,16,0.25)] border border-[#f0e3d2] px-6 pt-0 pb-8 text-center">
          <div
            className={`mx-auto -mt-8 mb-5 w-16 h-16 rounded-full flex items-center justify-center ring-8 ring-white ${
              isOk ? "bg-[#ff914d] text-white" : "bg-[#f3e7d9] text-[#8a5a3a]"
            }`}
          >
            {isOk ? (
              <CheckIcon />
            ) : (
              <span className="text-2xl leading-none" aria-hidden>
                ·
              </span>
            )}
          </div>

          <p className="text-[11px] tracking-[0.3em] uppercase text-[#c76a2b] font-semibold mb-2">{c.eyebrow}</p>
          <h1
            className="font-cormorant italic font-light text-[#2c1810] text-[2.4rem] leading-tight mb-3"
            style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
          >
            {c.title}
          </h1>
          <p className="text-[15px] text-[#5e4636] leading-relaxed mb-6">{c.body}</p>

          {showReceipt && (
            <dl className="mb-6 rounded-2xl bg-[#fbf5ec] border border-dashed border-[#e6cfb3] px-5 py-4 text-left">
              {reference && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-[12px] uppercase tracking-[0.15em] text-[#9a7a62]">Reference</dt>
                  <dd className="text-[14px] font-medium text-[#2c1810] text-right break-all">{reference}</dd>
                </div>
              )}
              {amount && (
                <div className={`flex items-baseline justify-between gap-4 ${reference ? "mt-3 pt-3 border-t border-[#efe0cc]" : ""}`}>
                  <dt className="text-[12px] uppercase tracking-[0.15em] text-[#9a7a62]">Paid</dt>
                  <dd className="text-[22px] font-semibold text-[#2c1810]">{amount}</dd>
                </div>
              )}
            </dl>
          )}

          {status === "success" && (
            <p className="text-[14px] text-[#7a5d49] italic mb-7">
              From all of us in the kitchen, we can&apos;t wait to feed you again. 🌿
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-[#ff914d] hover:bg-[#ff7a2e] text-[#1a0f08] rounded-full text-[14px] font-semibold tracking-[0.06em] transition-colors"
            >
              Back to mama.is
            </Link>
            {status === "success" && (
              <Link
                href="/restaurant"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-[#e6cfb3] text-[#5c2e12] rounded-full text-[14px] font-medium hover:bg-[#fbf5ec] transition-colors"
              >
                See what&apos;s cooking
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 text-[#9a7a62]">
          <Image src="/mamaimg/mamalogo.png" alt="Mama" width={44} height={48} className="opacity-80" />
          <p className="text-[12px]">Bankastræti 2 · 101 Reykjavík · team@mama.is</p>
        </div>
      </main>
    </div>
  );
}
