import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const seedsByDay = distribute(86, 30, 61);
  const categoryBreakdown = [
    { category: "Documentation",   count: 32, percentage: 37.2 },
    { category: "FAQ",             count: 21, percentage: 24.4 },
    { category: "Blog Articles",   count: 14, percentage: 16.3 },
    { category: "Product Specs",   count: 11, percentage: 12.8 },
    { category: "Email Templates", count: 5,  percentage: 5.8  },
    { category: "Other",           count: 3,  percentage: 3.5  },
  ];
  const fileTypeBreakdown = [
    { type: "pdf",  count: 38, percentage: 44.2 },
    { type: "url",  count: 21, percentage: 24.4 },
    { type: "text", count: 12, percentage: 14.0 },
    { type: "docx", count: 8,  percentage: 9.3  },
    { type: "csv",  count: 4,  percentage: 4.7  },
    { type: "json", count: 3,  percentage: 3.5  },
  ];
  return NextResponse.json({
    summary: {
      totalSeeds: 86,
      allTimeSeeds: 132,
      uniqueUsers: 38,
      avgSeedsPerUser: 2.3,
      dateRange: { start: dates[0], end: dates[dates.length - 1] },
    },
    categoryBreakdown,
    fileTypeBreakdown,
    topUsers: [
      { userId: "u_001", fullUserId: "u_001_full", seedCount: 18, userName: "Ada Lovelace",     plan: "pro"   },
      { userId: "u_003", fullUserId: "u_003_full", seedCount: 14, userName: "Grace Hopper",     plan: "basic" },
      { userId: "u_006", fullUserId: "u_006_full", seedCount: 11, userName: "Donald Knuth",     plan: "pro"   },
      { userId: "u_002", fullUserId: "u_002_full", seedCount: 9,  userName: "Linus Torvalds",   plan: "free"  },
      { userId: "u_005", fullUserId: "u_005_full", seedCount: 7,  userName: "Barbara Liskov",   plan: "free"  },
    ],
    activity: {
      seedsPerDay: dates.map((date, i) => ({ date, count: seedsByDay[i] })),
    },
    recentSeeds: [
      { id: "s1", title: "Onboarding FAQ v3",                  category: "FAQ",           fileType: "url",  userId: "u_001", createdAt: "2026-06-21T18:00:00Z", contentPreview: "Top onboarding questions and how to answer them..." },
      { id: "s2", title: "Pricing Page Copy",                  category: "Documentation", fileType: "text", userId: "u_003", createdAt: "2026-06-20T14:32:00Z", contentPreview: "Inflectiv pricing copy with plan comparisons..."     },
      { id: "s3", title: "API Reference — auth",               category: "Documentation", fileType: "pdf",  userId: "u_006", createdAt: "2026-06-19T11:08:00Z", contentPreview: "Authentication endpoints, OAuth flows, token..."      },
      { id: "s4", title: "Q2 Roadmap Brief",                   category: "Product Specs", fileType: "docx", userId: "u_003", createdAt: "2026-06-18T09:47:00Z", contentPreview: "Roadmap themes: AI agents, multi-tenant..."           },
      { id: "s5", title: "Welcome Email Template",             category: "Email Templates",fileType: "text", userId: "u_001", createdAt: "2026-06-17T16:21:00Z", contentPreview: "Hi {{first_name}}, welcome to myNeutron..."           },
    ],
    insights: [
      "Documentation is your largest seed category at 37% — keep the docs pipeline healthy.",
      "PDF imports lead at 44% — consider faster PDF parsing in the next release.",
      "Top 5 users account for 69% of seeds. Look at expanding power-user features.",
    ],
    tableSchema: ["id", "user_id", "category", "content", "file_type", "created_at"],
  });
}
