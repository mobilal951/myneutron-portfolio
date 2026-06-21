import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/api/linkedin/callback?code=demo", "http://localhost"));
}
