import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    channel: {
      id: "UCsynthetic",
      title: "myNeutron",
      subscribers: 412,
      totalViews: 8420,
      videoCount: 18,
    },
    recentVideos: [
      { id: "v1", title: "Building Your First AI Agent in 5 Minutes",   publishedAt: "2026-06-12T09:00:00Z", views: 1284, likes: 84, comments: 12 },
      { id: "v2", title: "Seed Knowledge Base: Best Practices",          publishedAt: "2026-06-05T09:00:00Z", views: 968,  likes: 62, comments: 8  },
      { id: "v3", title: "Connecting myNeutron to Telegram",             publishedAt: "2026-05-28T09:00:00Z", views: 742,  likes: 51, comments: 6  },
      { id: "v4", title: "Pro Plan vs Basic — What's Worth It",          publishedAt: "2026-05-20T09:00:00Z", views: 612,  likes: 38, comments: 4  },
      { id: "v5", title: "How Our AI Stack Works (Behind the Scenes)",   publishedAt: "2026-05-13T09:00:00Z", views: 524,  likes: 42, comments: 9  },
    ],
  });
}
