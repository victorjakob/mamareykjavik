// /private-session/admin/practitioners/[id]/offerings — list + inline CRUD.

import { notFound } from "next/navigation";
import Link from "next/link";

import {
  getPractitioner,
  listOfferings,
} from "@/app/private-session/_lib/admin-data";
import OfferingsClient from "./OfferingsClient";

export const dynamic = "force-dynamic";

export default async function Page({ params }) {
  const { id } = await params;
  const practitioner = await getPractitioner(id);
  if (!practitioner) notFound();
  const offerings = await listOfferings(id);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Link
            href={`/private-session/admin/practitioners/${id}/edit`}
            className="text-[10px] uppercase tracking-[0.25em] text-[#ff914d] hover:underline"
          >
            ← {practitioner.name}
          </Link>
          <h2 className="font-cormorant text-3xl italic text-[#f0ebe3] mt-1">Offerings</h2>
          <p className="text-[#a09488] text-sm mt-1">
            What this practitioner is offering during their residency.
          </p>
        </div>
      </div>

      <OfferingsClient practitionerId={id} initialOfferings={offerings} />
    </div>
  );
}
