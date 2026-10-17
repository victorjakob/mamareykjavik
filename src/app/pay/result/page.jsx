// Landing page after Teya's SecurePay for payment links.
export const metadata = { title: "Payment · Mama Reykjavík", robots: { index: false } };

const COPY = {
  success: ["Thank you — payment received", "We've got it. You'll get a receipt from Teya by email."],
  unverified: ["Thanks — we're confirming your payment", "If anything looks wrong, write to team@mama.is."],
  cancel: ["Payment cancelled", "No money was taken. You can open the link again whenever you're ready."],
  error: ["Something went wrong", "No payment was completed. Please try the link again or write to team@mama.is."],
};

export default async function PayResultPage({ searchParams }) {
  const { status } = await searchParams;
  const [title, body] = COPY[status] || COPY.error;
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff6ea] via-white to-[#f5efe6]">
      <section
        data-navbar-theme="dark"
        className="bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12] pt-28 sm:pt-32 pb-12 px-5"
      />
      <div className="px-5 pt-10 pb-20">
        <div className="max-w-md mx-auto bg-white/85 border border-[#eadfd2] rounded-2xl p-8 text-center">
          <p className="font-cormorant italic text-[#2c1810] text-2xl mb-2">{title}</p>
          <p className="text-[14px] text-[#6a5040]">{body}</p>
        </div>
      </div>
    </div>
  );
}
