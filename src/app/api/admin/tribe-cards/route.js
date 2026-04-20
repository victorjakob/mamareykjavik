// GET  /api/admin/tribe-cards        — list all cards
// POST /api/admin/tribe-cards        — create card manually (admin)

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { buildWelcomeCardEmail } from "@/lib/tribeCardEmail";
import {
  DURATION_TYPES,
  SOURCES,
  durationToExpiry,
  findUserIdByEmail,
  isValidEmail,
  normalizeEmail,
} from "@/lib/tribeCardHelpers";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mama.is";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "admin") {
    return { ok: false, session: null };
  }
  return { ok: true, session };
}

// ─── GET: list all cards ───────────────────────────────────────────────────
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const { data: cards, error } = await supabase
    .from("tribe_cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin tribe-cards list error:", error);
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }

  return NextResponse.json({ cards });
}

// ─── POST: create card manually ────────────────────────────────────────────
// Body: { holder_name, holder_email, holder_phone?, discount_percent,
//         duration_type, source?, notes?, sendEmail? }
// Upserts by holder_email — if a card already exists for this email we
// refresh its fields and (on admin request) reissue the welcome email.
export async function POST(req) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const holder_name = String(body.holder_name || "").trim();
  const holder_email = normalizeEmail(body.holder_email);
  const holder_phone = body.holder_phone?.toString().trim() || null;
  const discount_percent = Number(body.discount_percent);
  const duration_type = String(body.duration_type || "");
  const source = SOURCES.includes(body.source) ? body.source : "legacy";
  const notes = body.notes?.toString() || null;
  const sendEmail = body.sendEmail !== false; // default true

  if (!holder_name || holder_name.length < 2) {
    return NextResponse.json({ error: "Holder name is required." }, { status: 400 });
  }
  if (!isValidEmail(holder_email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }
  if (!Number.isFinite(discount_percent) || discount_percent <= 0 || discount_percent > 100) {
    return NextResponse.json({ error: "Discount must be 1–100." }, { status: 400 });
  }
  if (!DURATION_TYPES.includes(duration_type)) {
    return NextResponse.json({ error: "Invalid duration." }, { status: 400 });
  }

  const supabase = createServerSupabase();

  const issued_at = new Date().toISOString();
  const expires_at = durationToExpiry(duration_type, issued_at);
  const user_id = await findUserIdByEmail(supabase, holder_email);

  // Upsert by holder_email (unique). On conflict, update in place.
  const { data: card, error } = await supabase
    .from("tribe_cards")
    .upsert(
      {
        holder_name,
        holder_email,
        holder_phone,
        discount_percent,
        duration_type,
        issued_at,
        expires_at,
        status: "active",
        source,
        notes,
        user_id,
      },
      { onConflict: "holder_email" },
    )
    .select("*")
    .single();

  if (error) {
    console.error("admin create card error:", error);
    return NextResponse.json({ error: "Failed to create card." }, { status: 500 });
  }

  if (sendEmail) {
    try {
      const publicCardUrl = `${SITE_URL}/tribe-card/${card.access_token}`;
      const profileUrl = `${SITE_URL}/profile/my-tribe-card`;
      const { text, html } = buildWelcomeCardEmail({ card, publicCardUrl, profileUrl });
      await resend.emails.send({
        from: "Mama.is <team@mama.is>",
        to: card.holder_email,
        subject: "Welcome to the tribe — your card is ready",
        text,
        html,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }
  }

  return NextResponse.json({ card });
}
