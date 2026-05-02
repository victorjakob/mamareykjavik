import { NextResponse } from "next/server";
import { createServerSupabase } from "@/util/supabase/server";
import { requireAdmin, badRequest, serverError } from "../../_helpers";

/**
 * PATCH /api/admin/store/categories/[id]
 *
 * Body: any subset of { is_hidden, name, description }
 *
 * Inline rename / hide-toggle from the chapter tabs.
 */
export async function PATCH(request, { params }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const { id } = await params;
    if (!id) return badRequest("Missing category id");

    const body = await request.json();
    const allowed = ["is_hidden", "name", "description"];
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
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, category: data });
  } catch (error) {
    return serverError(error);
  }
}

/**
 * DELETE /api/admin/store/categories/[id]
 *
 * Re-parents all products in this category to the hidden "Uncategorized"
 * fallback row, then deletes the category. This avoids orphaning rows
 * (FKs would block) and matches the user-confirmed UX: "deleted category
 * should reassign to Uncategorized".
 *
 * The Uncategorized row is created by the migration; we look it up by
 * slug and lazily create one if it's somehow missing.
 */
export async function DELETE(_request, { params }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const { id } = await params;
    if (!id) return badRequest("Missing category id");

    const supabase = createServerSupabase();

    // Find or create "Uncategorized"
    let uncategorizedId;
    {
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", "uncategorized")
        .maybeSingle();

      if (existing) {
        uncategorizedId = existing.id;
      } else {
        const { data: created, error: createError } = await supabase
          .from("categories")
          .insert({
            name: "Uncategorized",
            slug: "uncategorized",
            description:
              "Internal fallback. Products land here when their category is deleted.",
            image: "/mamaimg/mamalogo.png",
            order: 9999,
            is_hidden: true,
          })
          .select("id")
          .single();
        if (createError) throw createError;
        uncategorizedId = created.id;
      }
    }

    if (parseInt(id) === parseInt(uncategorizedId)) {
      return badRequest("The Uncategorized fallback cannot be deleted.");
    }

    // Re-parent products
    const { error: reassignError } = await supabase
      .from("products")
      .update({
        category_id: uncategorizedId,
        is_hidden: true, // hide them on the public shop until admin re-categorizes
        updated_at: new Date().toISOString(),
      })
      .eq("category_id", id);
    if (reassignError) throw reassignError;

    // Delete the category
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      reassignedTo: uncategorizedId,
    });
  } catch (error) {
    return serverError(error);
  }
}
