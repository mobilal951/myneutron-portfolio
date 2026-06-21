import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const msgs = distribute(1820, 30, 51);
  const chats = distribute(412, 30, 52);
  return NextResponse.json({
    summary: {
      totalChats: 412,
      totalMessages: 1820,
      userMessages: 910,
      assistantMessages: 910,
      avgMessagesPerChat: 4.4,
      responseRate: 99.6,
    },
    healthScore: { score: 84, label: "Healthy", color: "emerald" },
    sentiment: {
      positive: 248,
      negative: 28,
      neutral: 136,
      positivePercentage: 60.2,
      negativePercentage: 6.8,
    },
    issues: {
      totalChatsWithIssues: 22,
      percentage: 5.3,
      breakdown: [
        { issue: "Couldn't find answer",    count: 12, percentage: 54.5 },
        { issue: "Wrong source used",       count: 6,  percentage: 27.3 },
        { issue: "Slow response",           count: 4,  percentage: 18.2 },
      ],
    },
    insights: [
      "Response rate is 99.6% — assistant rarely fails to reply.",
      "Top issue: 12 chats where the bot couldn't find an answer — consider expanding the seed library.",
      "Sentiment skews positive (60%); negatives concentrate around source-relevance issues.",
    ],
    activity: {
      messagesPerDay: dates.map((date, i) => ({ date, count: msgs[i] })),
      chatsPerDay: dates.map((date, i) => ({ date, count: chats[i] })),
    },
    topKeywords: [
      { word: "pricing",         count: 84 },
      { word: "credits",         count: 72 },
      { word: "seeds",           count: 58 },
      { word: "subscription",    count: 46 },
      { word: "telegram",        count: 38 },
      { word: "extension",       count: 32 },
      { word: "pro plan",        count: 28 },
      { word: "export",          count: 22 },
    ],
    recentQueries: [
      { id: "q1", chatId: "c1", query: "How do I add a new seed?",                          createdAt: "2026-06-21T18:42:00Z", sentiment: "neutral",  hasIssues: false },
      { id: "q2", chatId: "c2", query: "What's the difference between basic and pro?",      createdAt: "2026-06-21T17:14:00Z", sentiment: "neutral",  hasIssues: false },
      { id: "q3", chatId: "c3", query: "Why are my credits not refreshing?",                createdAt: "2026-06-21T15:08:00Z", sentiment: "negative", hasIssues: true  },
      { id: "q4", chatId: "c4", query: "Can I export my chat history?",                     createdAt: "2026-06-21T12:55:00Z", sentiment: "positive", hasIssues: false },
      { id: "q5", chatId: "c5", query: "Connect my Telegram account",                       createdAt: "2026-06-21T09:38:00Z", sentiment: "positive", hasIssues: false },
    ],
    chatSummaries: [
      { chatId: "c1", messageCount: 8,  userMessages: 4, botMessages: 4, firstQuery: "How do I add a new seed?",                  lastActivity: "2026-06-21T18:48:00Z", sentiment: "neutral",  sentimentScore: 0.1,  issues: [],                    preview: "User added a doc, asked about chunking..." },
      { chatId: "c2", messageCount: 12, userMessages: 6, botMessages: 6, firstQuery: "What's the difference between basic and pro?",lastActivity: "2026-06-21T17:32:00Z", sentiment: "positive", sentimentScore: 0.6,  issues: [],                    preview: "User asked about plan tiers, then upgraded..." },
      { chatId: "c3", messageCount: 6,  userMessages: 3, botMessages: 3, firstQuery: "Why are my credits not refreshing?",        lastActivity: "2026-06-21T15:20:00Z", sentiment: "negative", sentimentScore: -0.5, issues: ["Wrong source used"], preview: "User asked about credit cycle, bot answered with wrong policy..." },
    ],
  });
}
