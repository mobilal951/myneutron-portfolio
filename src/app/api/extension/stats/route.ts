import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const installs = distribute(218, 30, 81);
  const active = distribute(802, 30, 82);
  return NextResponse.json({
    totalInstalls: 1428,
    activeWeekly: 802,
    activeMonthly: 1156,
    adoptionRate: 56.1,
    byDay: dates.map((date, i) => ({ date, installs: installs[i], activeUsers: active[i] })),
    byCountry: [
      { country: "United States",  installs: 412 },
      { country: "United Kingdom", installs: 218 },
      { country: "Pakistan",       installs: 184 },
      { country: "India",          installs: 168 },
      { country: "Germany",        installs: 124 },
      { country: "Canada",         installs: 98  },
      { country: "Australia",      installs: 76  },
      { country: "Singapore",      installs: 54  },
    ],
  });
}
