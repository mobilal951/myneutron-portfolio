import { NextResponse } from "next/server";
import { lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const dailyData = dates.map((date, i) => {
    const seed = 30 + Math.round(40 * Math.sin(i / 4) + 15 * Math.cos(i / 6));
    const views = Math.max(8, seed);
    return {
      date,
      views,
      estimatedMinutesWatched: views * 2,
      likes: Math.round(views * 0.06),
      subscribersGained: Math.max(0, Math.round(views * 0.012)),
      subscribersLost: Math.max(0, Math.round(views * 0.002)),
    };
  });
  const totalViews = dailyData.reduce((s, d) => s + d.views, 0);
  const totalMins = dailyData.reduce((s, d) => s + d.estimatedMinutesWatched, 0);
  const totalLikes = dailyData.reduce((s, d) => s + d.likes, 0);
  const subsGained = dailyData.reduce((s, d) => s + d.subscribersGained, 0);
  const subsLost = dailyData.reduce((s, d) => s + d.subscribersLost, 0);

  return NextResponse.json({
    channel: {
      id: "UCsynthetic",
      title: "myNeutron",
      thumbnail: "/logo.png",
      subscriberCount: 412,
      videoCount: 18,
      viewCount: 8420,
    },
    analytics: {
      views: totalViews,
      estimatedMinutesWatched: totalMins,
      averageViewDuration: Math.round((totalMins / Math.max(1, totalViews)) * 60),
      likes: totalLikes,
      dislikes: Math.round(totalLikes * 0.04),
      comments: Math.round(totalLikes * 0.18),
      shares: Math.round(totalLikes * 0.12),
      subscribersGained: subsGained,
      subscribersLost: subsLost,
      netSubscribers: subsGained - subsLost,
    },
    dailyData,
    topVideos: [
      { videoId: "v1", title: "Building Your First AI Agent in 5 Minutes",     thumbnail: "/logo.png", views: 1284, likes: 84, comments: 12 },
      { videoId: "v2", title: "Seed Knowledge Base: Best Practices",            thumbnail: "/logo.png", views: 968,  likes: 62, comments: 8  },
      { videoId: "v3", title: "Connecting myNeutron to Telegram",               thumbnail: "/logo.png", views: 742,  likes: 51, comments: 6  },
      { videoId: "v4", title: "Pro Plan vs Basic — What's Worth It",            thumbnail: "/logo.png", views: 612,  likes: 38, comments: 4  },
      { videoId: "v5", title: "How Our AI Stack Works (Behind the Scenes)",     thumbnail: "/logo.png", views: 524,  likes: 42, comments: 9  },
    ],
    trafficSources: [
      { source: "YouTube search",        views: 1842, watchTimeMinutes: 3684 },
      { source: "Suggested videos",      views: 1124, watchTimeMinutes: 2156 },
      { source: "External",              views: 642,  watchTimeMinutes: 982  },
      { source: "Browse features",       views: 412,  watchTimeMinutes: 624  },
      { source: "Channel pages",         views: 268,  watchTimeMinutes: 412  },
      { source: "Direct or unknown",     views: 196,  watchTimeMinutes: 264  },
    ],
    dateRange: { startDate: dates[0], endDate: dates[dates.length - 1] },
  });
}
