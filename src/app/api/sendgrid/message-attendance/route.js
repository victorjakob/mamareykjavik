// Retired 2026-09-26. It emailed any message to any list of addresses sent by
// the browser. Messaging attendees now goes through
// PUT /api/events/manage/[slug]/attendance, which checks the caller may manage
// the event and takes the recipients from the database.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has moved. Please reload the page and try again." },
    { status: 410 }
  );
}
