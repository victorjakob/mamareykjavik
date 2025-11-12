import Link from "next/link";

const policies = [
  {
    title: "General Terms of Service",
    description:
      "How we handle reservations, events, online purchases, and community experiences.",
    href: "/policies/terms",
    cta: "Read the terms",
  },
  {
    title: "Privacy Policy",
    description:
      "Details on the personal information we collect, how we use it, and your rights.",
    href: "/policies/privacy",
    cta: "Review privacy details",
  },
  {
    title: "Mama Store Terms & Conditions",
    description:
      "All about shipping, returns, product care, and payments for our online store.",
    href: "/policies/store",
    cta: "Explore store policy",
  },
  {
    title: "Ticketing & Event Terms",
    description:
      "Guidelines for event tickets, attendance, and cancellations across our experiences.",
    href: "/policies/tickets",
    cta: "View ticket terms",
  },
];

export const metadata = {
  title: "Policies & Legal | Mama Reykjavik",
  description:
    "Browse all of Mama Reykjavik & White Lotus policies in one place, including privacy, terms of service, and store guidelines.",
  alternates: {
    canonical: "https://mama.is/policies",
  },
};

export default function PoliciesIndexPage() {
  return (
    <div className="relative mx-auto w-full max-w-5xl px-6 py-20">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30" />
      <div className="flex flex-col items-center gap-12">
        <header className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
            Mama Reykjavik & White Lotus
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-emerald-900 sm:text-5xl">
            Policies & Legal
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-emerald-900/70">
            Everything you need to know about how we operate — from safeguarding
            your data to shipping your cacao and welcoming you into our spaces.
          </p>
        </header>

        <div className="grid w-full gap-6 md:grid-cols-2">
          {policies.map((policy) => (
            <Link
              key={policy.href}
              href={policy.href}
              className="group rounded-3xl border border-emerald-100/80 bg-white/90 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-emerald-200/50"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-emerald-900">
                    {policy.title}
                  </h2>
                  <p className="mt-2 text-sm text-emerald-900/70">
                    {policy.description}
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-600">
                  {policy.cta} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

