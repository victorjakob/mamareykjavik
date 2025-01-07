import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const GRAPHQL_ENDPOINT = process.env.NEXT_HYGRAPH_ENDPOINT;

  const CACAO_QUERY = `
    query {
      products(where: { categories_some: { name: "Ceremonial Cacao" } }) {
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
  `;

  try {
    const response = await axios.post(GRAPHQL_ENDPOINT, {
      query: CACAO_QUERY,
    });

    return NextResponse.json(response.data.data.products); // Return filtered products
  } catch (error) {
    console.error("GraphQL Error:", error.message, error.response?.data);
    return NextResponse.json(
      { error: "Failed to fetch Ceremonial Cacao products" },
      { status: 500 }
    );
  }
}
