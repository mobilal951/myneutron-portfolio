import { NextRequest, NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET(_request: NextRequest) {
  const overview = {
    activeUsers: 1240,
    sessions: 1856,
    pageViews: 4280,
    newUsers: 826,
    avgSessionDuration: 248,
    bounceRate: 42.1,
    pagesPerSession: 2.31,
  };
  const dates = lastNDates(30);
  const usersByDay = distribute(overview.activeUsers, 30, 3);
  const sessionsByDay = distribute(overview.sessions, 30, 4);
  const newByDay = distribute(overview.newUsers, 30, 5);
  const ctaByDay = distribute(412, 30, 7);
  const dailyData = dates.map((date, i) => ({
    date,
    activeUsers: usersByDay[i],
    sessions: sessionsByDay[i],
    newUsers: newByDay[i],
  }));
  const websiteTraffic = dates.map((date, i) => ({
    date,
    activeUsers: usersByDay[i],
    ctaClicks: ctaByDay[i],
  }));
  return NextResponse.json({ overview, dailyData, websiteTraffic });
}
