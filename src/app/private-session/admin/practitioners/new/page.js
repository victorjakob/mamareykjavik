// /private-session/admin/practitioners/new — create form.
// Centered, simple, in the same visual language as the public booking page.

import Link from "next/link";
import PractitionerForm from "../PractitionerForm";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10 md:mb-12">
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
          Add a practitioner
        </h2>
        <p className="text-[#a09488] text-sm md:text-base leading-relaxed mt-2 max-w-md mx-auto">
          Fill this out, then add their offerings and availability.
        </p>
      </div>

      <PractitionerForm mode="create" />
    </div>
  );
}
