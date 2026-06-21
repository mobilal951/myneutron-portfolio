import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    // Portfolio demo: hardcoded so no env var is needed in the deploy.
    // Real production reads process.env.DASHBOARD_PASSWORD.
    const correctPassword = "myNeutron_stats26";

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true });

      // Set auth cookie - expires in 30 days
      response.cookies.set("dashboard_auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
