import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdmin, badRequest, serverError } from "../../_helpers";

/**
 * POST /api/admin/store/products/reorder
 *
 * Body: { items: [{ id, order }, …] }
 *
 * Writes the new sort order in one shot after a drag-and-drop. We update
 * each row individually rather than using upsert because Supabase upsert
 * needs the full PK row; a small loop is fine here (a category usually
 * has <50 products).
 */
export async function POST(request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const { items } = await request.json();
    if (!Array.isArray(items) || items.length === 0) {
      return badRequest("items[] required");
    }

    const supabase = createServerSupabase();

    // Run all updates in parallel; fail fast on first error.
    const results = await Promise.all(
      items.map(({ id, order }) =>
        supabase
          .from("products")
          .update({ order: parseInt(order), updated_at: new Date().toISOString() })
          .eq("id", id)
      )
    );

    const firstError = results.find((r) => r.error);
    if (firstError) throw firstError.error;

    return NextResponse.json({ success: true, count: items.length });
  } catch (error) {
    return serverError(error);
  }
}
