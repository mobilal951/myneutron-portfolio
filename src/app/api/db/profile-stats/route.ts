import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalProfiles: 248,
    complete: 144,
    partial: 78,
    empty: 26,
    completionByStep: [
      { step: "Account created",  count: 248 },
      { step: "Email verified",   count: 232 },
      { step: "Profile filled",   count: 187 },
      { step: "First seed added", count: 144 },
      { step: "First chat",       count: 122 },
      { step: "First subscription", count: 4 },
    ],
  });
}
