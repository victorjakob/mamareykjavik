// /private-session/admin/practitioners — clean, card-based list.
// Visual language follows the public practitioner page: centered container,
// Cormorant italic title, rounded panels with thin borders, generous space.

import Link from "next/link";
import Image from "next/image";
import { listPractitioners } from "../../_lib/admin-data";

export const dynamic = "force-dynamic";

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function residencyLabel(start, end) {
  const a = fmtDate(start);
  const b = fmtDate(end);
  if (a && b) return `${a} – ${b}`;
  return a || b || null;
}

function PractitionerRow({ practitioner }) {
  const residency = residencyLabel(practitioner.residency_start, practitioner.residency_end);
  const muted = !practitioner.is_active;
  return (
    <article
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 md:p-6 ${
        muted ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-5">
        {practitioner.photo_url ? (
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 bg-[#160f0a] ring-1 ring-white/[0.06]">
            <Image
              src={practitioner.photo_url}
              alt={practitioner.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex-shrink-0 bg-gradient-to-b from-[#231916] to-[#160f0a] ring-1 ring-white/[0.06]" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#7a6d5e] mb-1">
                {practitioner.country_of_origin || "—"}
              </div>
              <Link
                href={`/private-session/admin/practitioners/${practitioner.id}/edit`}
                className="font-cormorant text-2xl md:text-3xl italic text-[#f0ebe3] hover:text-[#ff914d] transition leading-tight"
              >
                {practitioner.name}
              </Link>
              <div className="text-xs text-[#a09488] mt-1 font-mono">/{practitioner.slug}</div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border ${
                practitioner.is_active
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-white/[0.04] text-white/40 border-white/10"
              }`}
            >
              {practitioner.is_active ? "Active" : "Archived"}
            </span>
          </div>

          {residency && (
            <div className="mt-3 text-xs uppercase tracking-[0.22em] text-[#a09488]">
              In residence · {residency}
            </div>
          )}
        </div>
      </div>

      {/* Manage links — keep them subtle, not table-like */}
      <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
        <Link
          href={`/private-session/admin/practitioners/${practitioner.id}/edit`}
          className="px-3 py-1.5 rounded-full text-[#d8cfc1] hover:text-[#f0ebe3] hover:bg-white/[0.04] transition"
        >
          Edit
        </Link>
        <span className="text-[#3a342e]">·</span>
        <Link
          href={`/private-session/admin/practitioners/${practitioner.id}/offerings`}
          className="px-3 py-1.5 rounded-full text-[#d8cfc1] hover:text-[#f0ebe3] hover:bg-white/[0.04] transition"
        >
          Offerings
        </Link>
        <Link
          href={`/private-session/admin/practitioners/${practitioner.id}/slots`}
          className="px-3 py-1.5 rounded-full text-[#d8cfc1] hover:text-[#f0ebe3] hover:bg-white/[0.04] transition"
        >
          Slots
        </Link>
        <Link
          href={`/private-session/admin/practitioners/${practitioner.id}/waitlist`}
          className="px-3 py-1.5 rounded-full text-[#d8cfc1] hover:text-[#f0ebe3] hover:bg-white/[0.04] transition"
        >
          Waitlist
        </Link>
        <span className="ml-auto" />
        <Link
          href={`/private-session/${practitioner.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-full text-[#7a6d5e] hover:text-[#ff914d] transition"
        >
          View public →
        </Link>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-8 md:p-12 text-center max-w-2xl mx-auto">
      <h3 className="font-cormorant text-2xl md:text-3xl italic text-[#f0ebe3] mb-3">
        No practitioners yet.
      </h3>
      <p className="text-[#a09488] text-sm md:text-base leading-relaxed max-w-md mx-auto mb-6">
        Setting up your first one takes about a minute. Add the practitioner,
        then their offerings, then their availability for the residency.
      </p>
      <Link
        href="/private-session/admin/practitioners/new"
        className="inline-flex px-6 py-3 rounded-full bg-[#ff914d] text-[#160f0a] text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition"
      >
        Add the first practitioner
      </Link>
    </div>
  );
}

export default async function Page() {
  const practitioners = await listPractitioners();
  const empty = practitioners.length === 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header — centered, light */}
      <div className="text-center mb-10 md:mb-12">
        <h2
          className="font-cormorant font-light italic text-[#f0ebe3]"
          style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
        >
          Practitioners
        </h2>
        <p className="text-[#a09488] text-sm md:text-base leading-relaxed mt-2 max-w-md mx-auto">
          One row per visiting practitioner. Each carries their own offerings,
          slots, and waitlist.
        </p>

        {!empty && (
          <div className="mt-7">
            <Link
              href="/private-session/admin/practitioners/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#ff914d] text-[#160f0a] text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#ffa566] transition"
            >
              + Add practitioner
            </Link>
          </div>
        )}
      </div>

      {empty ? (
        <EmptyState />
      ) : (
        <div className="space-y-4 md:space-y-5">
          {practitioners.map((p) => (
            <PractitionerRow key={p.id} practitioner={p} />
          ))}
        </div>
      )}
    </div>
  );
}
