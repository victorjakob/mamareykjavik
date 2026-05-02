import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdmin, badRequest, serverError } from "../../_helpers";

/**
 * POST /api/admin/store/categories/reorder
 *
 * Body: { items: [{ id, order }, …] }
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

    const results = await Promise.all(
      items.map(({ id, order }) =>
        supabase
          .from("categories")
          .update({
            order: parseInt(order),
            updated_at: new Date().toISOString(),
          })
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
