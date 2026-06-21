import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    messages: [
      { id: "m1", userId: "u_001", role: "user",      content: "How do I add a new seed for the chatbot?",                          created_at: "2026-06-21T18:42:00Z" },
      { id: "m2", userId: "u_001", role: "assistant", content: "Open the Seeds tab, click 'New seed', paste the source material...", created_at: "2026-06-21T18:42:08Z" },
      { id: "m3", userId: "u_003", role: "user",      content: "What's the difference between basic and pro plans?",                created_at: "2026-06-21T17:14:00Z" },
      { id: "m4", userId: "u_003", role: "assistant", content: "Pro includes 2,500 credits/month, priority models, and team seats.", created_at: "2026-06-21T17:14:11Z" },
      { id: "m5", userId: "u_006", role: "user",      content: "Why are my credits not refreshing?",                                 created_at: "2026-06-21T15:08:00Z" },
      { id: "m6", userId: "u_006", role: "assistant", content: "Credits refresh on your billing anniversary. Your next refresh is...", created_at: "2026-06-21T15:08:14Z" },
      { id: "m7", userId: "u_007", role: "user",      content: "Can I export my chat history?",                                      created_at: "2026-06-21T12:55:00Z" },
      { id: "m8", userId: "u_007", role: "assistant", content: "Yes — under Account → Data, click 'Export chats'. You'll get a JSON dump.", created_at: "2026-06-21T12:55:09Z" },
    ],
    total: 1820,
  });
}
