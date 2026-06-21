import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const seedsByDay = distribute(86, 30, 61);
  return NextResponse.json({
    totalSeeds: 86,
    byCategory: [
      { category: "Documentation",   count: 32 },
      { category: "FAQ",             count: 21 },
      { category: "Blog Articles",   count: 14 },
      { category: "Product Specs",   count: 11 },
      { category: "Email Templates", count: 5  },
      { category: "Other",           count: 3  },
    ],
    byUser: [
      { email: "ada@example.com",     seedCount: 18 },
      { email: "grace@example.com",   seedCount: 14 },
      { email: "donald@example.com",  seedCount: 11 },
      { email: "linus@example.com",   seedCount: 9  },
      { email: "barbara@example.com", seedCount: 7  },
    ],
    byDay: dates.map((date, i) => ({ date, seeds: seedsByDay[i] })),
  });
}
