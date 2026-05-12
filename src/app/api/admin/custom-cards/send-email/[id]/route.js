import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { Resend } from "resend";
import { renderEmail } from "@/emails/render.server";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST - Re-send the welcome email for a custom card
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createServerSupabase();

    const { data: card, error: cardError } = await supabase
      .from("custom_cards")
      .select("*")
      .eq("id", id)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: "Custom card not found" },
        { status: 404 }
      );
    }

    if (!card.recipient_email) {
      return NextResponse.json(
        { error: "Card has no recipient email" },
        { status: 400 }
      );
    }

    const cardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/custom-card/${card.access_token}`;

    const { html, text } = await renderEmail("custom-card-issued", {
      recipientName: card.recipient_name || "there",
      cardName: card.card_name,
      companyPerson: card.company_person,
      amount: card.amount,
      expirationType: card.expiration_type,
      expirationDate: card.expiration_date,
      monthlyAmount: card.monthly_amount,
      cardUrl,
    });

    await resend.emails.send({
      from: "Mama Reykjavik <team@mama.is>",
      to: [card.recipient_email],
      subject: `Your ${card.card_name} from Mama Reykjavik`,
      html,
      text,
    });

    await supabase
      .from("custom_cards")
      .update({
        email_sent: true,
        sent_at: new Date().toISOString(),
      })
      .eq("id", card.id);

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
