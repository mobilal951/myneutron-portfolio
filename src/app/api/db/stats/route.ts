import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const signupsByDay = distribute(51, 30, 21);
  return NextResponse.json({
    totalUsers: 248,
    activeUsers: 195,
    newUsersToday: 1,
    newUsersThisWeek: 12,
    newUsersThisMonth: 51,
    byDay: dates.map((date, i) => ({ date, signups: signupsByDay[i] })),
  });
}
