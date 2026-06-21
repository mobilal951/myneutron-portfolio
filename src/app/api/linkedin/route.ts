import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    profile: { name: "myNeutron", followers: 1240, posts: 32 },
    recentPosts: [
      { id: "p1", text: "We just shipped: import any web article straight into your seed library.",   postedAt: "2026-06-19T10:00:00Z", impressions: 4128, engagement: 218 },
      { id: "p2", text: "Three patterns we see from teams that go from free to pro in under a month.", postedAt: "2026-06-12T10:00:00Z", impressions: 3214, engagement: 156 },
      { id: "p3", text: "Behind the chatbot: how we use seeded retrieval to keep answers grounded.",   postedAt: "2026-06-05T10:00:00Z", impressions: 2890, engagement: 142 },
      { id: "p4", text: "Office hours this Friday — bring your weirdest data-cleaning problem.",       postedAt: "2026-05-29T10:00:00Z", impressions: 1976, engagement: 98  },
    ],
  });
}
