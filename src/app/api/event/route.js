import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req) {
  const GRAPHQL_ENDPOINT = process.env.NEXT_HYGRAPH_ENDPOINT;

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("id");

  if (!eventId) {
    return NextResponse.json(
      { error: "Event ID is required" },
      { status: 400 }
    );
  }

  const EVENT_QUERY = `
    query ($id: ID!) {
      event(where: { id: $id }) {
        id
        name
        shortDescription
        longDescription
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
      query: EVENT_QUERY,
      variables: { id: eventId },
    });

    const event = response.data.data.event;

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch event",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
