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

    const {
      eventTitle,
      eventDescription,
      eventDate,
      eventImage,
      eventUrl,
      customPostText,
    } = await request.json();

    // Validate required fields
    if (!eventTitle || !eventDescription || !eventDate || !eventUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Facebook Graph API configuration for both pages
    const mamaPageId = process.env.FACEBOOK_MAMA_PAGE_ID;
    const whiteLotusPageId = process.env.FACEBOOK_WHITELOTUS_PAGE_ID;
    const mamaAccessToken = process.env.FACEBOOK_MAMA_PAGE_TOKEN;
    const whiteLotusAccessToken = process.env.FACEBOOK_WHITELOTUS_PAGE_TOKEN;

    // Debug logging to help identify the issue
    console.log("Facebook Configuration Debug:");
    console.log("Mama Page ID:", mamaPageId ? "Set" : "Missing");
    console.log("White Lotus Page ID:", whiteLotusPageId ? "Set" : "Missing");
    console.log("Mama Access Token:", mamaAccessToken ? "Set" : "Missing");
    console.log(
      "White Lotus Access Token:",
      whiteLotusAccessToken ? "Set" : "Missing"
    );

    if (
      !mamaPageId ||
      !whiteLotusPageId ||
      !mamaAccessToken ||
      !whiteLotusAccessToken
    ) {
      const missingVars = [];
      if (!mamaPageId) missingVars.push("FACEBOOK_MAMA_PAGE_ID");
      if (!whiteLotusPageId) missingVars.push("FACEBOOK_WHITELOTUS_PAGE_ID");
      if (!mamaAccessToken) missingVars.push("FACEBOOK_MAMA_PAGE_TOKEN");
      if (!whiteLotusAccessToken)
        missingVars.push("FACEBOOK_WHITELOTUS_PAGE_TOKEN");

      return NextResponse.json(
        {
          success: false,
          error: `Facebook configuration missing: ${missingVars.join(", ")}`,
        },
        { status: 500 }
      );
    }

    // Format the post content
    const formattedDate = new Date(eventDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Use custom post text if provided, otherwise generate default
    const postMessage =
      customPostText ||
      `🎉 NEW EVENT: ${eventTitle}

📅 ${formattedDate}

${eventDescription}

🎫 Get your tickets now: ${eventUrl}

#MamaReykjavik #Events #Iceland`;

    // Function to post to a specific Facebook page
    const postToFacebookPage = async (pageId, accessToken, pageName) => {
      try {
        console.log(
          `Attempting to post to ${pageName} with page ID: ${pageId}`
        );

        const response = await fetch(
          `https://graph.facebook.com/v18.0/${pageId}/feed`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: postMessage,
              link: eventUrl,
              access_token: accessToken,
            }),
          }
        );

        const data = await response.json();
        console.log(`${pageName} API Response:`, data);

        if (!response.ok) {
          console.error(`Facebook API Error for ${pageName}:`, data);
          return {
            success: false,
            error: `Facebook API Error for ${pageName}: ${
              data.error?.message || "Unknown error"
            }`,
          };
        }

        return {
          success: true,
          postId: data.id,
          pageName,
        };
      } catch (error) {
        console.error(`Error posting to ${pageName}:`, error);
        return {
          success: false,
          error: `Error posting to ${pageName}: ${error.message}`,
        };
      }
    };

    // Post to both pages
    const [mamaResult, whiteLotusResult] = await Promise.all([
      postToFacebookPage(mamaPageId, mamaAccessToken, "Mama Reykjavik"),
      postToFacebookPage(
        whiteLotusPageId,
        whiteLotusAccessToken,
        "White Lotus"
      ),
    ]);

    console.log("Mama Result:", mamaResult);
    console.log("White Lotus Result:", whiteLotusResult);

    // Check results
    const successfulPosts = [];
    const failedPosts = [];

    if (mamaResult.success) {
      successfulPosts.push("Mama Reykjavik");
    } else {
      failedPosts.push(`Mama Reykjavik: ${mamaResult.error}`);
    }

    if (whiteLotusResult.success) {
      successfulPosts.push("White Lotus");
    } else {
      failedPosts.push(`White Lotus: ${whiteLotusResult.error}`);
    }

    // Return appropriate response
    if (successfulPosts.length === 2) {
      return NextResponse.json({
        success: true,
        fbPost: postMessage,
        message: "Event successfully posted to both Facebook pages",
        posts: {
          mama: mamaResult.postId,
          whiteLotus: whiteLotusResult.postId,
        },
      });
    } else if (successfulPosts.length === 1) {
      return NextResponse.json({
        success: true,
        fbPost: postMessage,
        message: `Event posted to ${successfulPosts[0]} page. Failed to post to: ${failedPosts[0]}`,
        posts: {
          [successfulPosts[0].toLowerCase().replace(" ", "")]:
            successfulPosts[0] === "Mama Reykjavik"
              ? mamaResult.postId
              : whiteLotusResult.postId,
        },
        warnings: failedPosts,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to post to both pages: ${failedPosts.join(", ")}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error posting to Facebook:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
