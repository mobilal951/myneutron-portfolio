import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/api/twitter/callback?oauth_token=demo", "http://localhost"));
}
