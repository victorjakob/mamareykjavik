// /private-session/admin/practitioners/[id]/waitlist — list grouped by offering.

import { notFound } from "next/navigation";
import Link from "next/link";

import {
  getPractitioner,
  listWaitlist,
} from "@/app/private-session/_lib/admin-data";
import WaitlistClient from "./WaitlistClient";

export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const { id } = await params;
  const practitioner = await getPractitioner(id);
  if (!practitioner) notFound();
  const { offerings, byOffering } = await listWaitlist(id);

  // Map -> plain object for the client component.
  const groups = offerings.map((o) => ({
    offering: o,
    entries: byOffering.get(o.id) || [],
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/private-session/admin/practitioners/${id}/edit`}
          className="text-[10px] uppercase tracking-[0.25em] text-[#ff914d] hover:underline"
        >
          ← {practitioner.name}
        </Link>
        <h2 className="font-cormorant text-3xl italic text-[#f0ebe3] mt-1">Waitlist</h2>
        <p className="text-[#a09488] text-sm mt-1">
          People waiting per offering. Offer a slot to send a 6-hour claim link (email wiring lands with stage 6).
        </p>
      </div>

      <WaitlistClient groups={groups} />
    </div>
  );
}
