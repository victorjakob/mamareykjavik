import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdmin, badRequest, serverError } from "../../_helpers";

/**
 * POST /api/admin/store/products/duplicate
 *
 * Body: { id }
 *
 * Clones the source product (same image, same fields) but with a unique
 * slug ("-copy") and a name suffixed with "(copy)". The clone starts
 * hidden so admins finish it in the edit drawer before publishing.
 */
export async function POST(request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const { id } = await request.json();
    if (!id) return badRequest("Missing product id");

    const supabase = createServerSupabase();

    const { data: src, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    // Strip the PK + bookkeeping columns so the clone gets a fresh row.
    const {
      id: _omit,
      created_at: _ca,
      updated_at: _ua,
      ...rest
    } = src;

    // Make slug unique. We append a numeric suffix until it's free.
    const baseSlug = `${src.slug || "product"}-copy`;
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    const insertPayload = {
      ...rest,
      name: `${src.name} (copy)`,
      slug,
      is_hidden: true, // start hidden so admin can finish editing first
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: clone, error: insertError } = await supabase
      .from("products")
      .insert(insertPayload)
      .select()
      .single();
    if (insertError) throw insertError;

    return NextResponse.json({ success: true, product: clone });
  } catch (error) {
    return serverError(error);
  }
}
