import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const msgs = distribute(1820, 30, 51);
  const sessions = distribute(412, 30, 52);
  return NextResponse.json({
    totalMessages: 1820,
    totalSessions: 412,
    avgMessagesPerSession: 4.4,
    topUsers: [
      { userId: "u_001", email: "ada@example.com",     messageCount: 142 },
      { userId: "u_003", email: "grace@example.com",   messageCount: 98  },
      { userId: "u_006", email: "donald@example.com",  messageCount: 81  },
      { userId: "u_007", email: "edsger@example.com",  messageCount: 64  },
      { userId: "u_005", email: "barbara@example.com", messageCount: 52  },
    ],
    byDay: dates.map((date, i) => ({ date, messages: msgs[i], sessions: sessions[i] })),
    modelUsage: [
      { model: "gpt-4o-mini",   count: 1042 },
      { model: "gpt-4o",        count: 472  },
      { model: "claude-haiku",  count: 218  },
      { model: "claude-sonnet", count: 88   },
    ],
  });
}
