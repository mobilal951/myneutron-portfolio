import { NextResponse } from "next/server";

export async function GET() {
  const tweet = (id: string, text: string, postedAt: string, m: { l:number;r:number;rp:number;q:number;b:number;i:number }) => ({
    id,
    text,
    createdAt: postedAt,
    metrics: {
      like_count: m.l,
      retweet_count: m.r,
      reply_count: m.rp,
      quote_count: m.q,
      bookmark_count: m.b,
      impression_count: m.i,
    },
  });

  const recentTweets = [
    tweet("t1", "shipped: clipboard-aware seed importer. paste a doc, hit save, done.",                                "2026-06-20T14:32:00Z", { l:142, r:28, rp:12, q:4, b:32, i:2814 }),
    tweet("t2", "the most underrated keyboard shortcut in our app is ⌘K. give it a try.",                              "2026-06-17T11:09:00Z", { l:98,  r:16, rp:8,  q:2, b:18, i:1968 }),
    tweet("t3", "if you build with agents and you haven't tried our seed-based grounding, you're leaving accuracy on the table.", "2026-06-13T16:21:00Z", { l:184, r:42, rp:18, q:8, b:64, i:3214 }),
    tweet("t4", "office hours Friday 11am PT. bring your AI architecture questions.",                                  "2026-06-10T09:48:00Z", { l:56,  r:9,  rp:4,  q:1, b:8,  i:1124 }),
  ];

  const sum = (k: keyof (typeof recentTweets)[0]["metrics"]) =>
    recentTweets.reduce((s, t) => s + t.metrics[k], 0);
  const totalLikes        = sum("like_count");
  const totalRetweets     = sum("retweet_count");
  const totalReplies      = sum("reply_count");
  const totalQuotes       = sum("quote_count");
  const totalBookmarks    = sum("bookmark_count");
  const totalImpressions  = sum("impression_count");
  const totalTweets       = recentTweets.length;
  const engagement        = totalLikes + totalRetweets + totalReplies + totalQuotes + totalBookmarks;

  return NextResponse.json({
    profile: {
      id: "1234567890",
      name: "myNeutron",
      username: "myNeutron",
      profileImageUrl: "/logo.png",
      description: "Building AI agents with grounded seed knowledge.",
      verified: false,
      verifiedType: "none",
      createdAt: "2025-08-12T10:00:00Z",
      location: "Internet",
      url: "https://myNeutron.com",
      publicMetrics: {
        followers_count: 824,
        following_count: 184,
        tweet_count: 156,
        listed_count: 18,
      },
    },
    tweetMetrics: {
      totalTweets,
      totalLikes,
      totalRetweets,
      totalReplies,
      totalQuotes,
      totalBookmarks,
      totalImpressions,
      avgLikesPerTweet:    +(totalLikes    / totalTweets).toFixed(1),
      avgRetweetsPerTweet: +(totalRetweets / totalTweets).toFixed(1),
      avgRepliesPerTweet:  +(totalReplies  / totalTweets).toFixed(1),
      engagementRate:      +((engagement / Math.max(1, totalImpressions)) * 100).toFixed(2),
    },
    recentTweets,
    bestTweet: recentTweets.reduce((best, t) => t.metrics.like_count > (best?.metrics.like_count ?? 0) ? t : best, recentTweets[0]),
    connected: true,
    dataSource: "demo",
  });
}
