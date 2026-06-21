import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ connected: true, channelId: "UCsynthetic" });
}
