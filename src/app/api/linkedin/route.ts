import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    profile: {
      id: "demo-linkedin-id",
      name: "myNeutron",
      firstName: "my",
      lastName: "Neutron",
      email: "admin@bigimmersive.com",
      picture: "/logo.png",
    },
    connected: true,
    message: "LinkedIn connected (demo).",
  });
}
