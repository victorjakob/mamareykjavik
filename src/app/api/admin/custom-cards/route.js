import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createServerSupabase } from "@/util/supabase/server";
import { createResend } from "@/lib/resend";
import { renderEmail } from "@/emails/render.server";

const resend = createResend();

// GET - List all custom cards
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = createServerSupabase();
    const { data: cards, error } = await supabase
      .from("custom_cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching custom cards:", error);
      return NextResponse.json(
        { error: "Failed to fetch custom cards" },
        { status: 500 }
      );
    }

    return NextResponse.json({ cards: cards || [] });
  } catch (error) {
    console.error("Error in GET /api/admin/custom-cards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new custom card
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      card_name,
      company_person,
      amount,
      recipient_email,
      recipient_name,
      expiration_type = "none",
      expiration_date,
      monthly_amount,
      admin_description,
      send_email = true,
    } = body;

    // Validate required fields
    if (!card_name || !amount || !recipient_email) {
      return NextResponse.json(
        { error: "Missing required fields: card_name, amount, recipient_email" },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: "Amount must be a positive integer" },
        { status: 400 }
      );
    }

    // Validate expiration type
    if (!["none", "date", "monthly_reset", "monthly_add"].includes(expiration_type)) {
      return NextResponse.json(
        { error: "Invalid expiration_type" },
        { status: 400 }
      );
    }

    // Validate expiration_date if type is 'date'
    if (expiration_type === "date" && !expiration_date) {
      return NextResponse.json(
        { error: "expiration_date is required when expiration_type is 'date'" },
        { status: 400 }
      );
    }

    // Validate monthly_amount if type is 'monthly_add'
    if (expiration_type === "monthly_add" && (!monthly_amount || monthly_amount <= 0)) {
      return NextResponse.json(
        { error: "monthly_amount is required and must be positive when expiration_type is 'monthly_add'" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();

    // Create the custom card
    const { data: card, error: cardError } = await supabase
      .from("custom_cards")
      .insert({
        card_name,
        company_person: company_person || null,
        amount,
        remaining_balance: amount,
        recipient_email,
        recipient_name: recipient_name || null,
        expiration_type,
        expiration_date: expiration_date || null,
        monthly_amount: monthly_amount || null,
        admin_description: admin_description || null,
        created_by: session.user.email,
        status: "active",
      })
      .select()
      .single();

    if (cardError) {
      console.error("Error creating custom card:", cardError);
      return NextResponse.json(
        { error: "Failed to create custom card" },
        { status: 500 }
      );
    }

    // Send email if requested
    if (send_email) {
      try {
        const cardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/custom-card/${card.access_token}`;

        const { html, text } = await renderEmail("custom-card-issued", {
          recipientName: recipient_name || "there",
          cardName: card_name,
          companyPerson: company_person,
          amount,
          expirationType: expiration_type,
          expirationDate: expiration_date,
          monthlyAmount: monthly_amount,
          cardUrl,
        });

        await resend.emails.send({
          from: "Mama Reykjavik <team@mama.is>",
          to: [recipient_email],
          subject: `Your ${card_name} from Mama Reykjavik`,
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
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Payment / card creation already succeeded — don't fail the request.
      }
    }

    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/custom-cards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

