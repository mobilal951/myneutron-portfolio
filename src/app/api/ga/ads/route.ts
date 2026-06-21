import { NextRequest, NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET(_request: NextRequest) {
  const overview = {
    clicks: 1842,
    cost: 2418.46,
    impressions: 64280,
    conversions: 78,
    hasConversionData: true,
    cpc: 1.31,
    ctr: 2.87,
    costPerConversion: 31.01,
    currencyCode: "USD",
  };
  const dates = lastNDates(30, "YYYY-MM-DD");
  const clicksByDay = distribute(overview.clicks, 30, 11);
  const impressionsByDay = distribute(overview.impressions, 30, 12);
  const costByDayCents = distribute(Math.round(overview.cost * 100), 30, 13);
  const byDay = dates.map((date, i) => ({
    date,
    clicks: clicksByDay[i],
    impressions: impressionsByDay[i],
    cost: costByDayCents[i] / 100,
  }));
  const campaigns = [
    { campaign: "Search — Creators",          clicks: 786, cost: 982.42,  impressions: 28104, conversions: 36, costPerConversion: 27.29, ctr: 2.80, cpc: 1.25 },
    { campaign: "Display — Retargeting",      clicks: 542, cost: 712.18,  impressions: 21420, conversions: 22, costPerConversion: 32.37, ctr: 2.53, cpc: 1.31 },
    { campaign: "Search — Pro Plan",          clicks: 318, cost: 528.92,  impressions: 9876,  conversions: 14, costPerConversion: 37.78, ctr: 3.22, cpc: 1.66 },
    { campaign: "Video — Brand Awareness",    clicks: 196, cost: 194.94,  impressions: 4880,  conversions: 6,  costPerConversion: 32.49, ctr: 4.02, cpc: 0.99 },
  ];
  return NextResponse.json({ overview, byDay, campaigns });
}
