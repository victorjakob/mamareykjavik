import Link from "next/link";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/policies/hosting-wl";
  const alternates = alternatesFor({ locale: language, pathname, translated: false });

  const title = "Event Host Policy | White Lotus";
  const description =
    "Hosting guidelines for White Lotus at Mama Reykjavik, including capacity, sound system use, cleaning, damages, safety, and payments.";

  const formatted = formatMetadata({ title, description });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default function HostingWhiteLotusPolicyPage() {
  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30" />
      <article className="space-y-10 rounded-3xl border border-emerald-100/70 bg-white/90 p-8 shadow-xl shadow-emerald-100/40 backdrop-blur">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
            White Lotus
          </p>
          <h1 className="font-serif text-4xl font-semibold text-emerald-900 sm:text-5xl">
            Event Host Policy
          </h1>
          <p className="max-w-2xl text-sm text-emerald-900/70">
            Thank you for hosting with us. We welcome celebration, music, and
            meaningful gatherings — and we also need the space to be respected
            and ready for the next group.
          </p>
        </header>

        <section className="space-y-8 text-emerald-950">
          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-emerald-900">
              1) Guests &amp; capacity
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-emerald-900/80">
              <li>Maximum capacity is 150 guests.</li>
              <li>
                The host is responsible for keeping guest count within capacity
                and maintaining a safe flow in the space.
              </li>
              <li>
                If you expect a larger turnout than originally planned, please
                tell us in advance.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-emerald-900">
              2) Sound, music &amp; atmosphere
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-emerald-900/80">
              <li>
                The venue includes a professional sound system. In most cases,
                outside sound equipment is not needed and should not be brought
                in unless agreed beforehand.
              </li>
              <li>
                We welcome loud music and high energy — with care for the space,
                the sound system, and our neighbors.
              </li>
              <li>
                Sound must stay within safe limits for the speakers. If our
                staff asks to reduce volume to protect equipment or the
                surroundings, it must be followed.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-emerald-900">
              3) Cleaning &amp; closing
            </h2>
            <p className="text-sm leading-relaxed text-emerald-900/80">
              All hosts are required to follow our cleaning and closing
              instructions here:
            </p>
            <p className="text-sm">
              <a
                href="https://mama.is/cleaning-list"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-600"
              >
                https://mama.is/cleaning-list
              </a>
              <span className="text-emerald-900/60"> (opens in new tab)</span>
            </p>
            <p className="text-sm leading-relaxed text-emerald-900/80">
              Extra cleaning fees may apply if the space is left unusually messy
              (e.g., spills not addressed, confetti/glitter, stains, broken
              glass, bathrooms left in poor condition, etc.).
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-emerald-900">
              4) Damages &amp; lost items
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-emerald-900/80">
              <li>
                The host is responsible for any damage caused by guests, vendors,
                or anyone connected to the event.
              </li>
              <li>Repair/replacement costs will be invoiced accordingly.</li>
              <li>
                Lost items: we can hold found items for a limited time, but we
                can’t guarantee recovery.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-emerald-900">
              5) Safety &amp; respectful conduct
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-emerald-900/80">
              <li>
                The host is responsible for ensuring the gathering is safe and
                respectful.
              </li>
              <li>
                No illegal substances, violence, harassment, or behavior that
                puts people or the space at risk.
              </li>
              <li>No nudity.</li>
              <li>
                We reserve the right to pause or end an event if safety, consent,
                or the venue is at risk.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-emerald-900">
              6) Payments &amp; card processing fees
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-emerald-900/80">
              <li>
                If you choose to use our online card payment system, the 5% card
                processing cost is passed through and will be clearly itemized.
              </li>
              <li>
                For tickets sold at the entrance using our card machine, a 2.5%
                processing cost applies (also itemized).
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-emerald-900">
              7) Attendee emails (optional)
            </h2>
            <p className="text-sm leading-relaxed text-emerald-900/80">
              If you use our system to collect RSVPs/tickets, we can share the
              attendee email list with the host upon request, provided the
              attendees have been informed that their details may be shared with
              the event organizer.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-emerald-900">
              8) Liability
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-emerald-900/80">
              <li>
                Guests attend and participate at their own responsibility.
              </li>
              <li>
                The venue is not liable for injuries, allergic reactions,
                personal belongings, or third-party issues connected to the
                event.
              </li>
            </ul>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100/70 bg-emerald-50/50 px-5 py-4">
          <p className="text-xs text-emerald-900/70">
            Questions? Reach out at{" "}
            <a
              href="mailto:team@mama.is"
              className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-600"
            >
              team@mama.is
            </a>
          </p>
          <Link
            href="/policies"
            className="text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-600"
          >
            Back to policies
          </Link>
        </footer>
      </article>
    </div>
  );
}

