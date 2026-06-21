import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const refs = distribute(38, 30, 41);
  return NextResponse.json({
    totalReferrals: 38,
    successful: 22,
    pending: 11,
    expired: 5,
    topReferrers: [
      { userEmail: "ada@example.com",     count: 6 },
      { userEmail: "grace@example.com",   count: 5 },
      { userEmail: "linus@example.com",   count: 4 },
      { userEmail: "donald@example.com",  count: 3 },
      { userEmail: "barbara@example.com", count: 2 },
    ],
    byDay: dates.map((date, i) => ({ date, referrals: refs[i] })),
  });
}
