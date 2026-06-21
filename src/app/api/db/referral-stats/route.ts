import { NextResponse } from "next/server";
import { distribute, lastNDates } from "@/lib/demo-data";

export async function GET() {
  const dates = lastNDates(30, "YYYY-MM-DD");
  const counts = distribute(38, 30, 41);
  const qualified = counts.map((c) => Math.max(0, Math.floor(c * 0.58)));
  return NextResponse.json({
    summary: {
      totalReferralsAllTime: 62,
      totalReferralsInRange: 38,
      qualifiedInRange: 22,
      creditsGrantedInRange: 1100,
      uniqueReferrersAllTime: 28,
      uniqueReferrersInRange: 16,
      qualificationRate: 57.9,
      avgTimeToQualifyHours: "18.4",
    },
    credits: {
      totalCreditsEarned: 3100,
      totalTransactions: 28,
      creditsInRange: 1100,
      transactionsInRange: 14,
    },
    topReferrers: [
      { referrerId: "u_001", name: "Ada Lovelace",     referralCode: "ada-lvc",   totalReferrals: 6, qualifiedReferrals: 5, creditsEarned: 250 },
      { referrerId: "u_003", name: "Grace Hopper",     referralCode: "grace-h",   totalReferrals: 5, qualifiedReferrals: 3, creditsEarned: 150 },
      { referrerId: "u_002", name: "Linus Torvalds",   referralCode: "linus-t",   totalReferrals: 4, qualifiedReferrals: 3, creditsEarned: 150 },
      { referrerId: "u_006", name: "Donald Knuth",     referralCode: "knuth-d",   totalReferrals: 3, qualifiedReferrals: 2, creditsEarned: 100 },
      { referrerId: "u_005", name: "Barbara Liskov",   referralCode: "liskov-b",  totalReferrals: 2, qualifiedReferrals: 2, creditsEarned: 100 },
    ],
    activity: dates.map((date, i) => ({ date, count: counts[i], qualified: qualified[i] })),
    recentReferrals: [
      { id: "r1", referrerName: "Ada Lovelace",    referredName: "Aisha Khan",      qualified: true,  qualifiedAt: "2026-06-19T11:00:00Z", creditsGranted: true,  createdAt: "2026-06-18T09:00:00Z" },
      { id: "r2", referrerName: "Grace Hopper",    referredName: "Marcus Patel",    qualified: true,  qualifiedAt: "2026-06-17T14:32:00Z", creditsGranted: true,  createdAt: "2026-06-16T10:14:00Z" },
      { id: "r3", referrerName: "Linus Torvalds",  referredName: "Sara Lin",        qualified: false, qualifiedAt: null,                  creditsGranted: false, createdAt: "2026-06-15T16:08:00Z" },
      { id: "r4", referrerName: "Donald Knuth",    referredName: "Tomás Reyes",     qualified: true,  qualifiedAt: "2026-06-14T08:21:00Z", creditsGranted: true,  createdAt: "2026-06-13T12:33:00Z" },
      { id: "r5", referrerName: "Barbara Liskov",  referredName: "Olivia Chen",     qualified: false, qualifiedAt: null,                  creditsGranted: false, createdAt: "2026-06-12T17:08:00Z" },
    ],
    distribution: [
      { referralCount: 1, referrerCount: 12 },
      { referralCount: 2, referrerCount: 8  },
      { referralCount: 3, referrerCount: 4  },
      { referralCount: 4, referrerCount: 2  },
      { referralCount: 5, referrerCount: 1  },
      { referralCount: 6, referrerCount: 1  },
    ],
  });
}
