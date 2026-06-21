import { NextRequest, NextResponse } from "next/server";

// Portfolio demo — NextAuth stub. Real production wires Google OAuth.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  if (url.pathname.endsWith("/session")) return NextResponse.json({});
  if (url.pathname.endsWith("/providers")) return NextResponse.json({});
  if (url.pathname.endsWith("/csrf")) return NextResponse.json({ csrfToken: "demo" });
  return NextResponse.json({});
}

export async function POST() {
  return NextResponse.json({ ok: true });
}
