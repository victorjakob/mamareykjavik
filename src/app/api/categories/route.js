import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const GRAPHQL_ENDPOINT = process.env.NEXT_HYGRAPH_ENDPOINT;

  const CATEGORIES_QUERY = `
    query {
      categories {
        name
        image {
          url
        }
        position
        slug
      }
    }
  `;

  try {
    const response = await axios.post(GRAPHQL_ENDPOINT, {
      query: CATEGORIES_QUERY,
    });

    const sortedCategories = response.data.data.categories.sort(
      (a, b) => a.position - b.position
    );

    return NextResponse.json(sortedCategories); // Return sorted data
  } catch (error) {
    console.error("GraphQL Error:", error.message, error.response?.data);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
