import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");
  return NextResponse.json({
    chatId,
    messages: [
      { id: "m1", role: "user",      content: "How do I add a new seed for the chatbot?",                              createdAt: "2026-06-21T18:42:00Z" },
      { id: "m2", role: "assistant", content: "Open the Seeds tab, click 'New seed', paste the source material...",   createdAt: "2026-06-21T18:42:08Z" },
      { id: "m3", role: "user",      content: "Do I have to wait for it to be processed?",                            createdAt: "2026-06-21T18:43:00Z" },
      { id: "m4", role: "assistant", content: "Yes — chunking + embedding usually takes about 30 seconds for...",     createdAt: "2026-06-21T18:43:12Z" },
      { id: "m5", role: "user",      content: "Got it, thanks.",                                                       createdAt: "2026-06-21T18:43:50Z" },
      { id: "m6", role: "assistant", content: "Anytime — let me know if it doesn't show up after a minute.",          createdAt: "2026-06-21T18:43:55Z" },
    ],
  });
}
