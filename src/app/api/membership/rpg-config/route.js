// GET /api/membership/rpg-config
// -----------------------------------------------------------------------------
// Returns the RPG public tokenization endpoint + public access token so the
// browser can POST card details to Teya directly (the PAN NEVER enters our
// server). Auth: signed-in only, so we aren't handing these out to drive-by
// scrapers.
//
// Shape:
//   {
//     tokenSingleUrl: "https://test.borgun.is/rpg/api/token/single",
//     publicAccessToken: "891451_p…",            // used by browser as Basic auth
//     testPan: "4176669999000104"                 // only in non-prod mode
//   }
//
// Why this is safe:
//   - Public Access Token can ONLY call /api/token/single and /api/mpi.
//     It CANNOT charge cards, CANNOT create MultiTokens, CANNOT refund.
//     (Per RPG spec — confirmed against the local swagger copy.)
//   - NextAuth session gate keeps the surface restricted to logged-in members.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const baseUrl   = (process.env.SALTPAY_RPG_BASE_URL || "").replace(/\/+$/, "");
  const publicKey = process.env.SALTPAY_RPG_PUBLIC_KEY || "";

  if (!baseUrl || !publicKey) {
    return NextResponse.json(
      { error: "RPG not configured on the server." },
      { status: 500 },
    );
  }

  const isTest = /test\.borgun\.is|sandbox|\btest\b/i.test(baseUrl);

  return NextResponse.json({
    tokenSingleUrl:    `${baseUrl}/api/token/single`,
    publicAccessToken: publicKey,
    testMode:          isTest,
    // Teya's documented sandbox test PAN — only echoed back in test mode so
    // the UI can offer a "use test card" shortcut.
    testPan:    isTest ? "4176669999000104" : null,
    testExpMM:  isTest ? "12" : null,
    testExpYY:  isTest ? "31" : null,
    testCvc:    isTest ? "123" : null,
  });
}
