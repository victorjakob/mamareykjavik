// Public claim page for a product credit: /claim/<id>. Reads the credit
// (public columns only) and hands it to the client view, which redeems it
// through POST /api/claim/<id>.
import { createServerSupabase } from "@/util/supabase/server";
import { isCreditId, effectiveStatus, PUBLIC_CREDIT_COLUMNS } from "@/lib/productCredits";
import ClaimView from "./ClaimView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your credit · Mama Reykjavík", robots: { index: false } };

export default async function ClaimPage({ params }) {
  const { id } = await params;
  let credit = null;
  if (isCreditId(id)) {
    try {
      const { data } = await createServerSupabase()
        .from("product_credits")
        .select(PUBLIC_CREDIT_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      credit = data || null;
    } catch (err) {
      console.error("[credits] claim page load failed", err);
    }
  }
  return <ClaimView id={id} initialCredit={credit} initialStatus={effectiveStatus(credit)} />;
}
