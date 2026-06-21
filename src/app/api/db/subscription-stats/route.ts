import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const newSubs = distribute(4, 30, 31);
  const churn = distribute(1, 30, 32);
  return NextResponse.json({
    total: 248,
    free: 244,
    basic: 3,
    pro: 1,
    totalMrrUsd: 67,
    byPlan: [
      { plan: "free",  count: 244, mrrUsd: 0  },
      { plan: "basic", count: 3,   mrrUsd: 27 },
      { plan: "pro",   count: 1,   mrrUsd: 40 },
    ],
    byDay: dates.map((date, i) => ({ date, newSubs: newSubs[i], churn: churn[i] })),
  });
}
