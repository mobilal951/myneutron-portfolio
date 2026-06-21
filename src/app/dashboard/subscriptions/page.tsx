"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/dashboard/header";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  Users,
  DollarSign,
  Loader2,
  AlertCircle,
  Tag,
  XCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface SubscriptionStats {
  summary: {
    totalSubscribers: number;
    totalRevenue: number;
    activeSubscriptions: number;
    cancellations: number;
    promoCodeUsage: number;
    promoCodePercentage: number;
  };
  planBreakdown: Array<{ plan: string; count: number; revenue: number; percentage: number }>;
  billingCycleBreakdown: Array<{ cycle: string; count: number; percentage: number }>;
  statusBreakdown: Array<{ status: string; count: number; percentage: number }>;
  topPromoCodes: Array<{ code: string; count: number }>;
  subscribers: Array<{
    id: string;
    userName: string;
    plan: string;
    billingCycle: string;
    amount: number;
    status: string;
    startDate: string;
    createdAt: string;
    cancelledAt: string | null;
    usedPromoCode: boolean;
  }>;
  cancellationReasons: Array<{ reason: string; count: number }>;
  cancelledSubscribers: Array<{
    id: string;
    userName: string;
    plan: string;
    billingCycle: string;
    amount: number;
    startDate: string;
    cancelledAt: string;
    reason: string;
    feedback: string | null;
    comment: string | null;
  }>;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProgressBar({ percentage, color = "bg-blue-500" }: { percentage: number; color?: string }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    active: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
    cancelled: { color: "bg-red-100 text-red-700", icon: <XCircle className="h-3 w-3" /> },
    past_due: { color: "bg-yellow-100 text-yellow-700", icon: <AlertCircle className="h-3 w-3" /> },
    trialing: { color: "bg-blue-100 text-blue-700", icon: <Calendar className="h-3 w-3" /> },
  };

  const config = statusConfig[status] || { color: "bg-gray-100 text-gray-700", icon: null };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {status}
    </span>
  );
}

export default function SubscriptionsPage() {
  const { dateRange, getDateParams } = useDashboard();
  const [data, setData] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);
  const prevDateRange = useRef(dateRange);

  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateParams();
      const params = new URLSearchParams();
      params.set("startDate", startDate);
      params.set("endDate", endDate);

      const response = await fetch(`/api/db/subscription-stats?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }

      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
    initialFetchDone.current = true;
  }, []);

  // Refetch when date range changes
  useEffect(() => {
    if (!initialFetchDone.current) return;

    const prevFrom = prevDateRange.current?.from?.getTime();
    const prevTo = prevDateRange.current?.to?.getTime();
    const newFrom = dateRange?.from?.getTime();
    const newTo = dateRange?.to?.getTime();

    if (prevFrom !== newFrom || prevTo !== newTo) {
      prevDateRange.current = dateRange;
      if (dateRange?.from && dateRange?.to) {
        fetchData(true);
      }
    }
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="Subscriptions" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="Subscriptions" />
        <div className="flex-1 p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error || "Failed to load data"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { summary, planBreakdown, billingCycleBreakdown, statusBreakdown, topPromoCodes, subscribers, cancellationReasons, cancelledSubscribers } = data;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Subscriptions" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Total Subscribers</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(summary.totalSubscribers)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalRevenue)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{formatNumber(summary.activeSubscriptions)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs text-muted-foreground">Cancelled</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatNumber(summary.cancellations)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Used Promo</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(summary.promoCodeUsage)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-indigo-500" />
                <span className="text-xs text-muted-foreground">Promo Rate</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600">{summary.promoCodePercentage}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Plan Breakdown */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                By Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {planBreakdown.length > 0 ? planBreakdown.map((item) => (
                  <div key={item.plan}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{item.plan || "Unknown"}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(item.count)} ({item.percentage}%)
                      </span>
                    </div>
                    <ProgressBar percentage={item.percentage} color="bg-blue-500" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Revenue: {formatCurrency(item.revenue)}
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Billing Cycle Breakdown */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-500" />
                By Billing Cycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingCycleBreakdown.length > 0 ? billingCycleBreakdown.map((item) => (
                  <div key={item.cycle}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{item.cycle || "Unknown"}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(item.count)} ({item.percentage}%)
                      </span>
                    </div>
                    <ProgressBar
                      percentage={item.percentage}
                      color={item.cycle === "yearly" ? "bg-teal-500" : "bg-cyan-500"}
                    />
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                By Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusBreakdown.length > 0 ? statusBreakdown.map((item) => {
                  const colors: Record<string, string> = {
                    active: "bg-green-500",
                    cancelled: "bg-red-500",
                    past_due: "bg-yellow-500",
                    trialing: "bg-blue-500",
                  };
                  return (
                    <div key={item.status}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{item.status || "Unknown"}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(item.count)} ({item.percentage}%)
                        </span>
                      </div>
                      <ProgressBar percentage={item.percentage} color={colors[item.status] || "bg-gray-500"} />
                    </div>
                  );
                }) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Promo Codes */}
        {topPromoCodes.length > 0 && (
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5 text-purple-500" />
                Top Promo Codes Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topPromoCodes.map((promo) => (
                  <div
                    key={promo.code}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg"
                  >
                    <span className="font-mono text-sm font-medium text-purple-700">{promo.code}</span>
                    <span className="text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
                      {promo.count} uses
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscribers List */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Recent Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cycle</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Start Date</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Promo</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length > 0 ? subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-2">{sub.userName}</td>
                      <td className="py-3 px-2 capitalize">{sub.plan}</td>
                      <td className="py-3 px-2 capitalize">{sub.billingCycle}</td>
                      <td className="py-3 px-2">{formatCurrency(sub.amount)}</td>
                      <td className="py-3 px-2">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="py-3 px-2">{formatDate(sub.startDate)}</td>
                      <td className="py-3 px-2">
                        {sub.usedPromoCode ? (
                          <span className="inline-flex items-center gap-1 text-purple-600">
                            <Tag className="h-3 w-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No subscribers found in this date range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Cancellations Section */}
        {(cancellationReasons.length > 0 || cancelledSubscribers.length > 0) && (
          <>
            {/* Cancellation Reasons */}
            {cancellationReasons.length > 0 && (
              <Card className="bg-white border-red-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    Cancellation Reasons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cancellationReasons.map((item) => {
                      const total = cancellationReasons.reduce((sum, r) => sum + r.count, 0);
                      const percentage = total > 0 ? (item.count / total) * 100 : 0;
                      return (
                        <div key={item.reason} className="p-3 bg-red-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-red-800 capitalize">
                              {item.reason.replace(/_/g, " ")}
                            </span>
                            <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                              {item.count}
                            </span>
                          </div>
                          <ProgressBar percentage={percentage} color="bg-red-500" />
                          <p className="text-xs text-red-600 mt-1">{Math.round(percentage)}% of cancellations</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancelled Subscribers List */}
            <Card className="bg-white border-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Cancelled Subscriptions
                  <span className="text-sm font-normal text-muted-foreground">
                    ({cancelledSubscribers.length} in period)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Plan</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cancelled</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Reason</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cancelledSubscribers.length > 0 ? cancelledSubscribers.map((sub) => (
                        <tr key={sub.id} className="border-b last:border-0 hover:bg-red-50">
                          <td className="py-3 px-2">{sub.userName}</td>
                          <td className="py-3 px-2 capitalize">{sub.plan}</td>
                          <td className="py-3 px-2">{formatCurrency(sub.amount)}</td>
                          <td className="py-3 px-2 text-red-600">{formatDate(sub.cancelledAt)}</td>
                          <td className="py-3 px-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs capitalize">
                              {sub.reason.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3 px-2 max-w-md">
                            {sub.comment ? (
                              <span className="inline-flex items-start gap-1 text-muted-foreground">
                                <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{sub.comment}</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">
                            No cancellations in this date range
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
