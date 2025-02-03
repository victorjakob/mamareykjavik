import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Extract data from request body
    const { quantity, total, email, productId } = await req.json();

    // Create a dummy order item response
    const dummyOrderItem = {
      id: Math.random().toString(36).substring(7), // Generate random ID
      quantity,
      total,
      email,
      productId,
      createdAt: new Date().toISOString(),
    };

    // Return the dummy order item
    return NextResponse.json({
      success: true,
      orderItem: dummyOrderItem,
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    return NextResponse.json(
      {
        error: "Failed to create order item",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
