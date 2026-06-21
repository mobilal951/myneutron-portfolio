import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    countries: [
      { country: "United States",       activeUsers: 342, sessions: 512 },
      { country: "United Kingdom",      activeUsers: 187, sessions: 268 },
      { country: "Pakistan",            activeUsers: 156, sessions: 242 },
      { country: "India",               activeUsers: 142, sessions: 219 },
      { country: "Germany",             activeUsers: 98,  sessions: 142 },
      { country: "Canada",              activeUsers: 84,  sessions: 122 },
      { country: "Australia",           activeUsers: 67,  sessions: 96  },
      { country: "United Arab Emirates",activeUsers: 54,  sessions: 78  },
      { country: "Singapore",           activeUsers: 38,  sessions: 54  },
      { country: "France",              activeUsers: 28,  sessions: 41  },
    ],
  });
}
