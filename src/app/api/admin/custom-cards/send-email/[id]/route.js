import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST - Resend email for a custom card
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createServerSupabase();

    // Get the card
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

    // Send email
    const cardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/custom-card/${card.access_token}`;
    
    await resend.emails.send({
      from: "Mama Reykjavik <team@mama.is>",
      to: [card.recipient_email],
      subject: `Your ${card.card_name} from Mama Reykjavik`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ff914d; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Your Mama Card</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="color: #333333; font-size: 16px; line-height: 1.6;">
              <p>Hello ${card.recipient_name || "there"},</p>
              <p>You have received a Mama Card: <strong>${card.card_name}</strong></p>
              ${card.company_person ? `<p>For: <strong>${card.company_person}</strong></p>` : ""}
              <p>Card Value: <strong>${new Intl.NumberFormat("is-IS").format(card.amount).replace(/,/g, ".")} kr.</strong></p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${cardUrl}" style="background-color: #ff914d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Your Card</a>
              </div>
              
              <p style="color: #666666; font-size: 14px;">Click the button above to access your card and view the balance.</p>
              
              ${card.expiration_type === "date" && card.expiration_date ? `<p style="color: #666666; font-size: 14px;">Expires: ${new Date(card.expiration_date).toLocaleDateString()}</p>` : ""}
              ${card.expiration_type === "monthly_reset" ? `<p style="color: #666666; font-size: 14px;">This card resets to the original amount monthly.</p>` : ""}
              ${card.expiration_type === "monthly_add" ? `<p style="color: #666666; font-size: 14px;">This card receives ${new Intl.NumberFormat("is-IS").format(card.monthly_amount).replace(/,/g, ".")} kr. added monthly.</p>` : ""}
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

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

