// Public payment-link page: /pay/<payment_links.id>. Shows what's being paid
// and a Pay button that goes to Teya's SecurePay page. See lib/paymentLinks.js.
import { createServerSupabase } from "@/util/supabase/server";
import { isPaymentLinkId, isExpired, formatIsk } from "@/lib/paymentLinks";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment · Mama Reykjavík", robots: { index: false } };

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff6ea] via-white to-[#f5efe6]">
      <section
        data-navbar-theme="dark"
        className="bg-gradient-to-br from-[#1a0f08] via-[#2c1810] to-[#5c2e12] pt-28 sm:pt-32 pb-12 px-5 text-center"
      >
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#f1c9a0] mb-2">Mama Reykjavík</p>
        <h1
          className="font-cormorant italic text-white text-3xl sm:text-[44px] font-light"
          style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
        >
          Payment
        </h1>
      </section>
      <div className="px-5 pt-10 pb-20">
        <div className="max-w-md mx-auto bg-white/85 border border-[#eadfd2] rounded-2xl p-8 text-center">
          {children}
        </div>
      </div>
    </div>
  );
}

function Notice({ title, body }) {
  return (
    <Shell>
      <p className="font-cormorant italic text-[#2c1810] text-2xl mb-2">{title}</p>
      <p className="text-[14px] text-[#6a5040]">{body}</p>
    </Shell>
  );
}

export default async function PayPage({ params }) {
  const { id } = await params;
  let link = null;
  if (isPaymentLinkId(id)) {
    const { data } = await createServerSupabase()
      .from("payment_links")
      .select("id, amount_isk, reference, customer_name, status, expires_at")
      .eq("id", id)
      .maybeSingle();
    link = data;
  }

  if (!link) {
    return <Notice title="Payment link not valid" body="Please contact us at team@mama.is and we'll send you a new one." />;
  }
  if (link.status === "paid") {
    return <Notice title="Already paid — thank you" body={`Mama Reykjavík: ${link.reference}, ${formatIsk(link.amount_isk)} kr.`} />;
  }
  if (isExpired(link)) {
    return <Notice title="This payment link has expired" body="Please contact us at team@mama.is and we'll send you a new one." />;
  }

  return (
    <Shell>
      <p className="text-[13px] text-[#8a7261] mb-1">Mama Reykjavík: {link.reference}</p>
      <p className="text-4xl font-semibold text-[#2c1810] mb-1">
        {formatIsk(link.amount_isk)} <span className="text-lg font-normal text-[#8a7261]">kr</span>
      </p>
      <p className="text-[14px] text-[#6a5040] mb-7">For {link.customer_name}</p>
      <a
        href={`/api/pay/${link.id}/start`}
        className="inline-block w-full px-6 py-3.5 bg-[#c76a2b] hover:bg-[#a5551f] text-white rounded-full text-[15px] font-semibold transition-colors"
      >
        Pay {formatIsk(link.amount_isk)} kr by card
      </a>
      <p className="mt-4 text-[12px] text-[#8a7261] leading-relaxed">
        You&apos;ll be taken to Teya&apos;s secure payment page.
        {link.expires_at
          ? ` Link valid until ${new Date(link.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Atlantic/Reykjavik" })}.`
          : ""}
      </p>
    </Shell>
  );
}
