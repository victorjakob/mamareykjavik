import { NextResponse } from "next/server";
import axios from "axios";

const GRAPHQL_ENDPOINT = process.env.NEXT_HYGRAPH_ENDPOINT;
const HYGRAPH_AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

export async function POST(req) {
  try {
    const { identifier } = await req.json();

    console.log("Identifier received for fetching cart:", identifier); // Debug identifier

    const FETCH_CART_QUERY = `
      query FetchCart($identifier: String!) {
        orderItems(where: { email: $identifier }) {
          id
          quantity
          total
          product {
            id
            name
            slug
            description
            price
            images {
              url
            }
          }
        }
      }
    `;

    const response = await axios.post(
      GRAPHQL_ENDPOINT,
      {
        query: FETCH_CART_QUERY,
        variables: { identifier },
      },
      {
        headers: {
          Authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      "Sending Payload:",
      JSON.stringify({ query: FETCH_CART_QUERY, variables: { identifier } })
    );

    console.log("GraphQL Endpoint:", GRAPHQL_ENDPOINT);
    console.log(
      "Authorization Token:",
      HYGRAPH_AUTH_TOKEN ? "Present" : "Missing"
    );
    console.log("GraphQL response:", JSON.stringify(response.data, null, 2)); // Log response

    const { orderItems } = response.data.data;
    return NextResponse.json(orderItems); // Return the cart items
  } catch (error) {
    console.error(
      "Error fetching cart items:",
      error.message,
      error.response?.data
    );
    return NextResponse.json(
      { error: "Failed to fetch cart items", details: error.message },
      { status: 500 }
    );
  }
}
