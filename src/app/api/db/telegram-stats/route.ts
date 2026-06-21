import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const queries = distribute(412, 30, 71);
  const seeds = distribute(64, 30, 72);
  return NextResponse.json({
    overview: {
      connectedAccounts: 38,
      totalAiQueries: 412,
      allTimeAiQueries: 1820,
      totalSeeds: 64,
      allTimeSeeds: 142,
      creditsSpent: 824,
      uniqueUsers: 24,
    },
    connectedAccountsList: [
      { username: "@ada_lvc",      lastActiveAt: "2026-06-21T18:42:00Z", createdAt: "2026-04-12T10:00:00Z" },
      { username: "@grace_h",      lastActiveAt: "2026-06-21T14:08:00Z", createdAt: "2026-04-18T10:00:00Z" },
      { username: "@linus_t",      lastActiveAt: "2026-06-20T11:32:00Z", createdAt: "2026-04-22T10:00:00Z" },
      { username: "@donald_k",     lastActiveAt: "2026-06-19T16:21:00Z", createdAt: "2026-05-02T10:00:00Z" },
      { username: "@barbara_lk",   lastActiveAt: "2026-06-18T09:47:00Z", createdAt: "2026-05-08T10:00:00Z" },
    ],
    activity: {
      aiQueriesPerDay: dates.map((date, i) => ({ date, count: queries[i] })),
      seedsPerDay:     dates.map((date, i) => ({ date, count: seeds[i]   })),
    },
    seedsBreakdown: [
      { type: "url",  count: 28, percentage: 43.8 },
      { type: "text", count: 18, percentage: 28.1 },
      { type: "pdf",  count: 12, percentage: 18.8 },
      { type: "docx", count: 6,  percentage: 9.4  },
    ],
    actionsBreakdown: [
      { action: "ai_query",  count: 412 },
      { action: "add_seed",  count: 64  },
      { action: "list_seeds",count: 96  },
      { action: "help",      count: 38  },
      { action: "delete",    count: 12  },
    ],
    topUsers: [
      { userId: "u_001", fullUserId: "u_001_full", userName: "Ada Lovelace",     telegramUsername: "@ada_lvc",    queries: 124, seeds: 18, credits: 248 },
      { userId: "u_003", fullUserId: "u_003_full", userName: "Grace Hopper",     telegramUsername: "@grace_h",    queries: 96,  seeds: 12, credits: 192 },
      { userId: "u_002", fullUserId: "u_002_full", userName: "Linus Torvalds",   telegramUsername: "@linus_t",    queries: 72,  seeds: 9,  credits: 144 },
      { userId: "u_006", fullUserId: "u_006_full", userName: "Donald Knuth",     telegramUsername: "@donald_k",   queries: 64,  seeds: 8,  credits: 128 },
      { userId: "u_005", fullUserId: "u_005_full", userName: "Barbara Liskov",   telegramUsername: "@barbara_lk", queries: 42,  seeds: 6,  credits: 84  },
    ],
    recentSeeds: [
      { id: "s1", title: "Vercel docs — Functions",        type: "url",  createdAt: "2026-06-21T17:42:00Z" },
      { id: "s2", title: "Pricing FAQ",                    type: "text", createdAt: "2026-06-20T14:21:00Z" },
      { id: "s3", title: "Onboarding email v3",            type: "text", createdAt: "2026-06-19T11:08:00Z" },
      { id: "s4", title: "Roadmap Q2 2026",                type: "pdf",  createdAt: "2026-06-18T09:47:00Z" },
    ],
    insights: [
      "Connected accounts up 18% week-over-week — Telegram channel is growing.",
      "ai_query dominates actions at 70%; add_seed at 11%. The bot is primarily a Q&A surface.",
      "Top 5 users account for 96% of credits spent. Power-user concentration is high.",
    ],
    dateRange: { start: dates[0], end: dates[dates.length - 1] },
  });
}
