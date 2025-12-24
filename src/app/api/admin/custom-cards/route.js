import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
        
        await resend.emails.send({
          from: "Mama Reykjavik <team@mama.is>",
          to: [recipient_email],
          subject: `Your ${card_name} from Mama Reykjavik`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #ff914d; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Your Mama Card</h1>
              </div>
              
              <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="color: #333333; font-size: 16px; line-height: 1.6;">
                  <p>Hello ${recipient_name || "there"},</p>
                  <p>You have received a Mama Card: <strong>${card_name}</strong></p>
                  ${company_person ? `<p>For: <strong>${company_person}</strong></p>` : ""}
                  <p>Card Value: <strong>${new Intl.NumberFormat("is-IS").format(amount).replace(/,/g, ".")} kr.</strong></p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${cardUrl}" style="background-color: #ff914d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Your Card</a>
                  </div>
                  
                  <p style="color: #666666; font-size: 14px;">Click the button above to access your card and view the balance.</p>
                  
                  ${expiration_type === "date" && expiration_date ? `<p style="color: #666666; font-size: 14px;">Expires: ${new Date(expiration_date).toLocaleDateString()}</p>` : ""}
                  ${expiration_type === "monthly_reset" ? `<p style="color: #666666; font-size: 14px;">This card resets to the original amount monthly.</p>` : ""}
                  ${expiration_type === "monthly_add" ? `<p style="color: #666666; font-size: 14px;">This card receives ${new Intl.NumberFormat("is-IS").format(monthly_amount).replace(/,/g, ".")} kr. added monthly.</p>` : ""}
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; color: #666666; font-size: 14px;">
                  <p style="margin: 0;">Best regards,</p>
                  <p style="margin: 5px 0;">Mama & The White Lotus Team</p>
                </div>
              </div>
            </div>
          `,
        });

        // Update card to mark email as sent
        await supabase
          .from("custom_cards")
          .update({
            email_sent: true,
            sent_at: new Date().toISOString(),
          })
          .eq("id", card.id);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails
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

