import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdmin, badRequest, serverError } from "../../_helpers";

/**
 * PATCH /api/admin/store/products/[id]
 *
 * Body: any subset of { is_hidden, sold_out, is_featured, name, price }
 *
 * The shop-page inline overlay calls this for the toggle icons. We accept
 * a small allow-list of fields rather than the whole row to keep the
 * surface tight — full edits go through /api/store/edit-product (the
 * existing route) which handles image uploads.
 */
export async function PATCH(request, { params }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const { id } = await params;
    if (!id) return badRequest("Missing product id");

    const body = await request.json();
    const allowed = ["is_hidden", "sold_out", "is_featured", "name", "price"];
    const updates = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }
    if (Object.keys(updates).length === 0) {
      return badRequest("No updatable fields provided");
    }
    updates.updated_at = new Date().toISOString();

    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    return serverError(error);
  }
}

/**
 * DELETE /api/admin/store/products/[id]
 *
 * Removes the product row. Image cleanup is handled by the existing
 * /api/store/delete-product endpoint — we proxy by replicating its logic
 * so the inline UI doesn't need a second round-trip.
 */
export async function DELETE(_request, { params }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const { id } = await params;
    if (!id) return badRequest("Missing product id");

    const supabase = createServerSupabase();

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("image, images")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const allImages = [product?.image]
      .concat(product?.images || [])
      .filter(Boolean);

    for (const imgUrl of allImages) {
      if (
        imgUrl &&
        imgUrl.includes("supabase.co/storage/v1/object/public/Store/")
      ) {
        const path = imgUrl.split("/Store/")[1];
        if (path) {
          await supabase.storage.from("Store").remove([path]);
        }
      }
    }

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
