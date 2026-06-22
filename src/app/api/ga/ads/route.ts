import { NextRequest, NextResponse } from "next/server";
import { lastNDates } from "@/lib/demo-data";

export async function GET(_request: NextRequest) {
  const overview = {
    clicks: 1842,
    cost: 2418.46,
    impressions: 64280,
    cpc: 1.31,
    ctr: 2.87,
    conversions: 78,
    costPerConversion: 31.01,
  };
  const campaigns = [
    { campaign: "Search — Creators",       clicks: 786, cost: 982.42, impressions: 28104, conversions: 36, ctr: 2.80, cpc: 1.25 },
    { campaign: "Display — Retargeting",   clicks: 542, cost: 712.18, impressions: 21420, conversions: 22, ctr: 2.53, cpc: 1.31 },
    { campaign: "Search — Pro Plan",       clicks: 318, cost: 528.92, impressions: 9876,  conversions: 14, ctr: 3.22, cpc: 1.66 },
    { campaign: "Video — Brand Awareness", clicks: 196, cost: 194.94, impressions: 4880,  conversions: 6,  ctr: 4.02, cpc: 0.99 },
  ];

  const dates = lastNDates(30);
  // Per-campaign daily breakdown (cartesian)
  const dailyData: Array<{date:string; campaign:string; clicks:number; cost:number; impressions:number; conversions:number}> = [];
  for (let i = 0; i < dates.length; i++) {
    const dayProgress = i / Math.max(1, dates.length - 1);
    const baseFactor = 0.7 + 0.6 * Math.sin(i / 4) + 0.3 * Math.cos(i / 7);
    for (const c of campaigns) {
      const dayShare = (baseFactor * (1 + dayProgress * 0.1)) / 30;
      dailyData.push({
        date: dates[i],
        campaign: c.campaign,
        clicks: Math.max(1, Math.round(c.clicks * dayShare)),
        cost: Math.max(0, Math.round(c.cost * dayShare * 100) / 100),
        impressions: Math.max(10, Math.round(c.impressions * dayShare)),
        conversions: Math.max(0, Math.round(c.conversions * dayShare)),
      });
    }
  }

  return NextResponse.json({ overview, dailyData, campaigns });
}
