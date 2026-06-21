import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    summary: {
      totalSubscribers: 4,
      totalRevenue: 134,
      activeSubscriptions: 4,
      cancellations: 2,
      promoCodeUsage: 1,
      promoCodePercentage: 25.0,
    },
    planBreakdown: [
      { plan: "basic", count: 3, revenue: 27, percentage: 75.0 },
      { plan: "pro",   count: 1, revenue: 40, percentage: 25.0 },
    ],
    billingCycleBreakdown: [
      { cycle: "monthly", count: 3, percentage: 75.0 },
      { cycle: "yearly",  count: 1, percentage: 25.0 },
    ],
    statusBreakdown: [
      { status: "active",    count: 4, percentage: 66.7 },
      { status: "cancelled", count: 2, percentage: 33.3 },
    ],
    topPromoCodes: [
      { code: "LAUNCH50", count: 1 },
    ],
    subscribers: [
      { id: "s1", userName: "Maya Patel",   plan: "pro",   billingCycle: "yearly",  amount: 480, status: "active",    startDate: "2026-03-15T10:00:00Z", createdAt: "2026-03-15T10:00:00Z", cancelledAt: null,                  usedPromoCode: true  },
      { id: "s2", userName: "Sam Carter", plan: "basic", billingCycle: "monthly", amount: 9,   status: "active",    startDate: "2026-04-22T10:00:00Z", createdAt: "2026-04-22T10:00:00Z", cancelledAt: null,                  usedPromoCode: false },
      { id: "s3", userName: "Priya Sharma",   plan: "basic", billingCycle: "monthly", amount: 9,   status: "active",    startDate: "2026-05-08T10:00:00Z", createdAt: "2026-05-08T10:00:00Z", cancelledAt: null,                  usedPromoCode: false },
      { id: "s4", userName: "Noah Brooks",       plan: "basic", billingCycle: "monthly", amount: 9,   status: "active",    startDate: "2026-05-30T10:00:00Z", createdAt: "2026-05-30T10:00:00Z", cancelledAt: null,                  usedPromoCode: false },
    ],
    cancellationReasons: [
      { reason: "Not using enough",                  count: 1 },
      { reason: "Found alternative",                 count: 1 },
    ],
    cancelledSubscribers: [
      { id: "c1", userName: "Aaron Chen",  plan: "basic", billingCycle: "monthly", amount: 9, startDate: "2026-02-10T10:00:00Z", cancelledAt: "2026-04-22T10:00:00Z", reason: "Not using enough",  feedback: "Light usage",     comment: null },
      { id: "c2", userName: "Zoe Martinez",plan: "pro",   billingCycle: "monthly", amount: 40,startDate: "2026-03-01T10:00:00Z", cancelledAt: "2026-05-15T10:00:00Z", reason: "Found alternative", feedback: "Switched tools", comment: "Going with in-house build" },
    ],
  });
}
