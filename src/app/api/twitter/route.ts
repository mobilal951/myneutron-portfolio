import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    profile: { handle: "@myNeutron", followers: 824, tweets: 156 },
    recentTweets: [
      { id: "t1", text: "shipped: clipboard-aware seed importer. paste a doc, hit save, done.",  postedAt: "2026-06-20T14:32:00Z", impressions: 2814, likes: 142, retweets: 28, replies: 12 },
      { id: "t2", text: "the most underrated keyboard shortcut in our app is ⌘K. give it a try.", postedAt: "2026-06-17T11:09:00Z", impressions: 1968, likes: 98,  retweets: 16, replies: 8  },
      { id: "t3", text: "if you build with agents and you haven't tried our seed-based grounding, you're leaving accuracy on the table.", postedAt: "2026-06-13T16:21:00Z", impressions: 3214, likes: 184, retweets: 42, replies: 18 },
      { id: "t4", text: "office hours Friday 11am PT. bring your AI architecture questions.",     postedAt: "2026-06-10T09:48:00Z", impressions: 1124, likes: 56,  retweets: 9,  replies: 4  },
    ],
  });
}
