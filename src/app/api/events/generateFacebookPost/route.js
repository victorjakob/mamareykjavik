import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { eventTitle, eventDescription, eventDate, eventUrl } =
      await request.json();

    // Validate required fields
    if (!eventTitle || !eventDescription || !eventDate || !eventUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Format the date for the AI prompt
    const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Create AI prompt for Facebook post generation
    const prompt = `Create an engaging Facebook post for this event. The post should be:

- Maximum 200 characters
- Include 2-3 relevant emojis
- Be warm and inviting
- Include the event ticket URL
- use date name not number
- never say the year
- never use hashtags

Event details:
- Title: ${eventTitle}
- Date: ${formattedDate}
- Description: ${eventDescription}
- Ticket URL: ${eventUrl}

Make it sound exciting and encourage people to join! keep it spaceious and short, using nextline for new paragraph`;

    // Generate post using OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a social media expert specializing in creating engaging Facebook posts for events. Keep posts concise, exciting, and include relevant emojis and hashtags.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API Error:", data);
      return NextResponse.json(
        {
          success: false,
          error: `OpenAI API Error: ${data.error?.message || "Unknown error"}`,
        },
        { status: 500 }
      );
    }

    const generatedPost = data.choices[0]?.message?.content?.trim();

    if (!generatedPost) {
      return NextResponse.json(
        { success: false, error: "Failed to generate post content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      generatedPost,
      message: "Facebook post generated successfully",
    });
  } catch (error) {
    console.error("Error generating Facebook post:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
