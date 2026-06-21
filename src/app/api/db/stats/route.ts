import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const signupsByDay = distribute(51, 30, 21);
  return NextResponse.json({
    overview: {
      totalUsers: 248,
      newUsersLast7Days: 12,
      activeSubscriptions: 4,
      paidSubscriptions: 4,
      totalSeeds: 86,
      totalChunks: 1428,
      extensionUsers: 1156,
    },
    subscriptions: {
      free: 244,
      basic: 3,
      pro: 1,
    },
    dailySignups: dates.map((date, i) => ({ date, count: signupsByDay[i] })),
  });
}
