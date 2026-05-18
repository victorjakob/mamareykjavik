// /private-session/admin/practitioners/[id]/edit — edit form.
// Centered layout matching the new-practitioner page. Quick-access pills
// to Offerings / Slots / Waitlist sit under the title.

import { notFound } from "next/navigation";
import Link from "next/link";

import { getPractitioner } from "@/app/private-session/_lib/admin-data";
import PractitionerForm from "../../PractitionerForm";

export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const { id } = await params;
  const practitioner = await getPractitioner(id);
  if (!practitioner) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8 md:mb-10">
        <Link
          href="/private-session/admin/practitioners"
          className="inline-block text-[10px] uppercase tracking-[0.25em] text-[#ff914d] hover:underline mb-3"
        >
          ← Practitioners
        </Link>
        <h2
          className="font-cormorant font-light italic text-[#f0ebe3]"
          style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
        >
          {practitioner.name}
        </h2>
        <p className="text-[#a09488] text-sm leading-relaxed mt-2">
          /{practitioner.slug}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em]">
          <Link
            href={`/private-session/admin/practitioners/${id}/offerings`}
            className="px-4 py-2 rounded-full border border-white/10 text-[#d8cfc1] hover:text-[#f0ebe3] hover:bg-white/[0.05] transition"
          >
            Offerings →
          </Link>
          <Link
            href={`/private-session/admin/practitioners/${id}/slots`}
            className="px-4 py-2 rounded-full border border-white/10 text-[#d8cfc1] hover:text-[#f0ebe3] hover:bg-white/[0.05] transition"
          >
            Slots →
          </Link>
          <Link
            href={`/private-session/admin/practitioners/${id}/waitlist`}
            className="px-4 py-2 rounded-full border border-white/10 text-[#d8cfc1] hover:text-[#f0ebe3] hover:bg-white/[0.05] transition"
          >
            Waitlist →
          </Link>
          <Link
            href={`/private-session/${practitioner.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full text-[#7a6d5e] hover:text-[#ff914d] transition"
          >
            View public →
          </Link>
        </div>
      </div>

      <PractitionerForm mode="edit" initial={practitioner} practitionerId={id} />
    </div>
  );
}
