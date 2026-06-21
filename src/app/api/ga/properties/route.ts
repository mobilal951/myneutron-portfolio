import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    properties: [{ id: "properties/501072751", name: "myNeutron", account: "myNeutron Analytics" }],
  });
}
