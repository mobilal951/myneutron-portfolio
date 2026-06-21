import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    sources: [
      { channel: "Direct",         users: 542, sessions: 786, newUsers: 386 },
      { channel: "Organic Search", users: 312, sessions: 478, newUsers: 218 },
      { channel: "Organic Social", users: 184, sessions: 246, newUsers: 124 },
      { channel: "Referral",       users: 96,  sessions: 142, newUsers: 64  },
      { channel: "Paid Search",    users: 64,  sessions: 96,  newUsers: 42  },
      { channel: "Email",          users: 28,  sessions: 42,  newUsers: 18  },
      { channel: "Unassigned",     users: 14,  sessions: 18,  newUsers: 8   },
    ],
  });
}
