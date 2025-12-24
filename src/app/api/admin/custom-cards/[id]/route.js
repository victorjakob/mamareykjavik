import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createServerSupabase } from "@/util/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// PATCH - Update a custom card
export async function PATCH(req, { params }) {
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
    const body = await req.json();
    const {
      card_name,
      company_person,
      amount,
      remaining_balance,
      recipient_email,
      recipient_name,
      expiration_type,
      expiration_date,
      monthly_amount,
      admin_description,
      status,
      send_email = false,
    } = body;

    const supabase = createServerSupabase();

    // Build update object
    const updateData = {};
    if (card_name !== undefined) updateData.card_name = card_name;
    if (company_person !== undefined) updateData.company_person = company_person;
    if (amount !== undefined) {
      if (amount <= 0 || !Number.isInteger(amount)) {
        return NextResponse.json(
          { error: "Amount must be a positive integer" },
          { status: 400 }
        );
      }
      updateData.amount = amount;
    }
    if (remaining_balance !== undefined) {
      if (remaining_balance < 0 || !Number.isInteger(remaining_balance)) {
        return NextResponse.json(
          { error: "Remaining balance must be a non-negative integer" },
          { status: 400 }
        );
      }
      updateData.remaining_balance = remaining_balance;
    }
    if (recipient_email !== undefined) updateData.recipient_email = recipient_email;
    if (recipient_name !== undefined) updateData.recipient_name = recipient_name;
    if (expiration_type !== undefined) {
      if (!["none", "date", "monthly_reset", "monthly_add"].includes(expiration_type)) {
        return NextResponse.json(
          { error: "Invalid expiration_type" },
          { status: 400 }
        );
      }
      updateData.expiration_type = expiration_type;
    }
    if (expiration_date !== undefined) updateData.expiration_date = expiration_date;
    if (monthly_amount !== undefined) updateData.monthly_amount = monthly_amount;
    if (admin_description !== undefined) updateData.admin_description = admin_description;
    if (status !== undefined) {
      if (!["active", "used", "expired", "cancelled"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Update the card
    const { data: card, error: updateError } = await supabase
      .from("custom_cards")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating custom card:", updateError);
      return NextResponse.json(
        { error: "Failed to update custom card" },
        { status: 500 }
      );
    }

    if (!card) {
      return NextResponse.json(
        { error: "Custom card not found" },
        { status: 404 }
      );
    }

    // Send email if requested
    if (send_email && card.recipient_email) {
      try {
        const cardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/custom-card/${card.access_token}`;
        
        await resend.emails.send({
          from: "Mama Reykjavik <team@mama.is>",
          to: [card.recipient_email],
          subject: `Update: Your ${card.card_name} from Mama Reykjavik`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #ff914d; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Card Update</h1>
              </div>
              
              <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="color: #333333; font-size: 16px; line-height: 1.6;">
                  <p>Hello ${card.recipient_name || "there"},</p>
                  <p>Your Mama Card <strong>${card.card_name}</strong> has been updated.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${cardUrl}" style="background-color: #ff914d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Your Card</a>
                  </div>
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

    return NextResponse.json({ card });
  } catch (error) {
    console.error("Error in PATCH /api/admin/custom-cards/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a custom card
export async function DELETE(req, { params }) {
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

    const { error } = await supabase
      .from("custom_cards")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting custom card:", error);
      return NextResponse.json(
        { error: "Failed to delete custom card" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Custom card deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/admin/custom-cards/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

