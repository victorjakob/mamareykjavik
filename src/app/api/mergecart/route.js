import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, guestCartItems } = await req.json();

    // Process each guest cart item
    for (const item of guestCartItems) {
      const { quantity, total, product } = item;

      // Create a dummy order item for each guest cart item
      const dummyOrderItem = {
        id: Math.random().toString(36).substring(7),
        quantity,
        total,
        email,
        productId: product.id,
        createdAt: new Date().toISOString(),
      };

      console.log("Created dummy order item:", dummyOrderItem);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error merging guest cart:", error.message);
    return NextResponse.json(
      { error: "Failed to merge cart items", details: error.message },
      { status: 500 }
    );
  }
}
