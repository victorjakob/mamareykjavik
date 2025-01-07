import { NextResponse } from "next/server";
import axios from "axios";

const GRAPHQL_ENDPOINT = process.env.NEXT_HYGRAPH_ENDPOINT;
const HYGRAPH_AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

export async function POST(req) {
  try {
    const { email, guestCartItems } = await req.json();

    const CREATE_AND_PUBLISH_MUTATION = `
      mutation CreateAndPublishOrderItem($quantity: Int!, $total: Int!, $email: String!, $productId: ID!) {
        createOrderItem(
          data: {
            quantity: $quantity
            total: $total
            email: $email
            product: { connect: { id: $productId } }
          }
        ) {
          id
        }
        publishOrderItem(where: { id: "LAST_CREATED_ID" }) {
          id
        }
      }
    `;

    for (const item of guestCartItems) {
      const { quantity, total, product } = item;

      // Create and publish each guest cart item under the user's email
      await axios.post(
        GRAPHQL_ENDPOINT,
        {
          query: CREATE_AND_PUBLISH_MUTATION,
          variables: {
            quantity,
            total,
            email, // Replace with logged-in user's email
            productId: product.id,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
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
