import { NextResponse } from "next/server";
import axios from "axios";

const GRAPHQL_ENDPOINT = process.env.NEXT_HYGRAPH_ENDPOINT;
const HYGRAPH_AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

export async function POST(req) {
  try {
    // Extract data from request body
    const { quantity, total, email, productId } = await req.json();

    const CREATE_AND_PUBLISH_ORDER_ITEM_MUTATION = `
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
          quantity
          total
          email
        }
      }
    `;

    // Step 1: Execute the mutation to create the item
    const response = await axios.post(
      GRAPHQL_ENDPOINT,
      {
        query: CREATE_AND_PUBLISH_ORDER_ITEM_MUTATION,
        variables: { quantity, total, email, productId },
      },
      {
        headers: {
          Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const createdItem = response.data.data.createOrderItem;

    // Step 2: Publish the created item by its ID
    const PUBLISH_MUTATION = `
      mutation PublishOrderItem($id: ID!) {
        publishOrderItem(where: { id: $id }) {
          id
        }
      }
    `;

    await axios.post(
      GRAPHQL_ENDPOINT,
      {
        query: PUBLISH_MUTATION,
        variables: { id: createdItem.id },
      },
      {
        headers: {
          Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Return the created and published item
    return NextResponse.json({
      success: true,
      orderItem: createdItem,
    });
  } catch (error) {
    console.error("Server Error:", error.message, error.response?.data);
    return NextResponse.json(
      {
        error: "Failed to create and publish OrderItem",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
