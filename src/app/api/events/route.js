import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const GRAPHQL_ENDPOINT = process.env.NEXT_HYGRAPH_ENDPOINT;
  const now = new Date().toISOString(); // Current time in ISO format

  const EVENTS_QUERY = `
    query ($now: DateTime!) {
      events(
        where: { time_gt: $now }
        orderBy: time_ASC
      ) {
        id
        name
        shortDescription
        time
        duration
        price
        image {
          url
        }
      }
    }
  `;

  try {
    const response = await axios.post(GRAPHQL_ENDPOINT, {
      query: EVENTS_QUERY,
      variables: { now }, // Pass the current timestamp as a variable
    });

    return NextResponse.json(response.data.data.events); // Return only event data
  } catch (error) {
    console.error("GraphQL Error:", error.message, error.response?.data);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
