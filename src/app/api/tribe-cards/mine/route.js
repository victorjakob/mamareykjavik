// GET /api/tribe-cards/mine
// Returns the authenticated user's tribe card (if any).
//
// Linking rule:
//   1. If there is a card with user_id = session.user.id, return it.
//   2. Else look up by email (session.user.email). If found and user_id
//      is null, patch it with the current user_id (auto-link), then return.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();
  const userId = session.user.id || session.user.sub || null;

  const supabase = createServerSupabase();

  if (userId) {
    const { data: byUser } = await supabase
      .from("tribe_cards")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (byUser) {
      return NextResponse.json({ card: deriveSoftExpiry(byUser) });
    }
  }

  const { data: byEmail } = await supabase
    .from("tribe_cards")
    .select("*")
    .eq("holder_email", email)
    .maybeSingle();

  if (!byEmail) {
    return NextResponse.json({ card: null });
  }

  // Auto-link if possible.
  if (userId && !byEmail.user_id) {
    const { data: linked } = await supabase
      .from("tribe_cards")
      .update({ user_id: userId })
      .eq("id", byEmail.id)
      .select("*")
      .single();
    return NextResponse.json({ card: deriveSoftExpiry(linked || byEmail) });
  }

  return NextResponse.json({ card: deriveSoftExpiry(byEmail) });
}

function deriveSoftExpiry(card) {
  if (!card) return card;
  if (
    card.status === "active" &&
    card.expires_at &&
    new Date(card.expires_at) < new Date()
  ) {
    return { ...card, status: "expired" };
  }
  return card;
}
