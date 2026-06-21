import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  return NextResponse.json({ success: true, message: "Demo mode: credentials accepted." });
}

export async function GET() {
  return NextResponse.json({
    saved: true,
    accessTokenSet: true,
    refreshTokenSet: true,
    propertyId: "properties/501072751",
    savedAt: "2026-06-22T00:00:00Z",
  });
}
