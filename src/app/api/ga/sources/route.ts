import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    sources: [
      { channel: "Direct",         activeUsers: 542, sessions: 786, newUsers: 386 },
      { channel: "Organic Search", activeUsers: 312, sessions: 478, newUsers: 218 },
      { channel: "Organic Social", activeUsers: 184, sessions: 246, newUsers: 124 },
      { channel: "Referral",       activeUsers: 96,  sessions: 142, newUsers: 64  },
      { channel: "Paid Search",    activeUsers: 64,  sessions: 96,  newUsers: 42  },
      { channel: "Email",          activeUsers: 28,  sessions: 42,  newUsers: 18  },
      { channel: "Unassigned",     activeUsers: 14,  sessions: 18,  newUsers: 8   },
    ],
    topPages: [
      { path: "/",          pageViews: 1248, users: 824 },
      { path: "/pricing",   pageViews: 482,  users: 312 },
      { path: "/features",  pageViews: 318,  users: 218 },
      { path: "/about",     pageViews: 234,  users: 178 },
      { path: "/blog",      pageViews: 168,  users: 142 },
      { path: "/docs",      pageViews: 124,  users: 96  },
      { path: "/contact",   pageViews: 86,   users: 64  },
      { path: "/signup",    pageViews: 64,   users: 48  },
    ],
  });
}
