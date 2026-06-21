"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/dashboard/header";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserPlus,
  Gift,
  Coins,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Award,
  Percent,
} from "lucide-react";

interface ReferralStats {
  summary: {
    totalReferralsAllTime: number;
    totalReferralsInRange: number;
    qualifiedInRange: number;
    creditsGrantedInRange: number;
    uniqueReferrersAllTime: number;
    uniqueReferrersInRange: number;
    qualificationRate: number;
    avgTimeToQualifyHours: string;
  };
  credits: {
    totalCreditsEarned: number;
    totalTransactions: number;
    creditsInRange: number;
    transactionsInRange: number;
  };
  topReferrers: Array<{
    referrerId: string;
    name: string;
    referralCode: string;
    totalReferrals: number;
    qualifiedReferrals: number;
    creditsEarned: number;
  }>;
  activity: Array<{
    date: string;
    count: number;
    qualified: number;
  }>;
  recentReferrals: Array<{
    id: string;
    referrerName: string;
    referredName: string;
    qualified: boolean;
    qualifiedAt: string | null;
    creditsGranted: boolean;
    createdAt: string;
  }>;
  distribution: Array<{
    referralCount: number;
    referrerCount: number;
  }>;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(dateStr);
}

export default function ReferralsPage() {
  const { dateRange, getDateParams } = useDashboard();
  const [data, setData] = useState<ReferralStats | null>(null);
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

      const response = await fetch(`/api/db/referral-stats?${params.toString()}`);
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

  useEffect(() => {
    fetchData();
    initialFetchDone.current = true;
  }, []);

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
        <Header title="Referrals" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="Referrals" />
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

  const { summary, credits, topReferrers, activity, recentReferrals, distribution } = data;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Referrals" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Total Referrals</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(summary.totalReferralsAllTime)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.totalReferralsInRange} in period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Unique Referrers</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{formatNumber(summary.uniqueReferrersAllTime)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.uniqueReferrersInRange} active in period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Qualified</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatNumber(summary.qualifiedInRange)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.qualificationRate}% rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Credits Granted</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{formatNumber(summary.creditsGrantedInRange)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                referrals rewarded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Credits Earnings & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-500" />
                Referral Earnings (Credits)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-700 mb-1">Total Credits Earned</p>
                  <p className="text-3xl font-bold text-amber-600">{formatNumber(credits.totalCreditsEarned)}</p>
                  <p className="text-xs text-amber-600 mt-1">{credits.totalTransactions} transactions</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 mb-1">In Selected Period</p>
                  <p className="text-3xl font-bold text-blue-600">{formatNumber(credits.creditsInRange)}</p>
                  <p className="text-xs text-blue-600 mt-1">{credits.transactionsInRange} transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-green-500" />
                Qualification Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700 mb-1">Qualification Rate</p>
                  <p className="text-3xl font-bold text-green-600">{summary.qualificationRate}%</p>
                  <p className="text-xs text-green-600 mt-1">of all referrals</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700 mb-1">Avg Time to Qualify</p>
                  <p className="text-3xl font-bold text-purple-600">{summary.avgTimeToQualifyHours}h</p>
                  <p className="text-xs text-purple-600 mt-1">average hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Referrers */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium text-muted-foreground">#</th>
                    <th className="pb-2 font-medium text-muted-foreground">User</th>
                    <th className="pb-2 font-medium text-muted-foreground">Referral Code</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Total</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Qualified</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {topReferrers.length > 0 ? (
                    topReferrers.map((referrer, idx) => (
                      <tr key={referrer.referrerId} className="border-b last:border-0">
                        <td className="py-3">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                            idx === 1 ? 'bg-gray-100 text-gray-700' :
                            idx === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-50 text-slate-500'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3">
                          <p className="font-medium">{referrer.name}</p>
                        </td>
                        <td className="py-3">
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded">{referrer.referralCode}</code>
                        </td>
                        <td className="py-3 text-right font-medium">{referrer.totalReferrals}</td>
                        <td className="py-3 text-right">
                          <span className="text-green-600">{referrer.qualifiedReferrals}</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-amber-600">{referrer.creditsEarned}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No referrers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Activity Chart & Recent Referrals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Activity Chart */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Referral Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <div className="overflow-x-auto">
                  {(() => {
                    const maxCount = Math.max(...activity.map(d => d.count), 1);
                    const chartHeight = 120;

                    return (
                      <div className="flex min-w-[400px]">
                        <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground" style={{ height: `${chartHeight}px` }}>
                          <span>{maxCount}</span>
                          <span>{Math.round(maxCount / 2)}</span>
                          <span>0</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-end gap-1 border-l border-b border-gray-200" style={{ height: `${chartHeight}px` }}>
                            {activity.map((day) => {
                              const heightPx = Math.max((day.count / maxCount) * 100, 4);
                              const qualifiedHeight = day.qualified > 0 ? Math.max((day.qualified / maxCount) * 100, 2) : 0;
                              return (
                                <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-0.5">
                                  {day.count > 0 && (
                                    <span className="text-[9px] text-gray-600 font-medium leading-none">
                                      {day.count}
                                    </span>
                                  )}
                                  <div className="w-full flex flex-col">
                                    <div
                                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                                      style={{ height: `${heightPx}px` }}
                                      title={`${formatDate(day.date)}: ${day.count} referrals (${day.qualified} qualified)`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span>{formatDate(activity[0].date)}</span>
                            <span>{formatDate(activity[activity.length - 1].date)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No referral activity in this period
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Referrals */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Recent Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {recentReferrals.length > 0 ? (
                  recentReferrals.map((ref) => (
                    <div
                      key={ref.id}
                      className={`p-3 rounded-lg border ${
                        ref.qualified
                          ? 'bg-green-50 border-green-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {ref.referrerName} → {ref.referredName}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {ref.qualified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{timeAgo(ref.createdAt)}</span>
                        {ref.qualified && <span className="text-green-600">Qualified</span>}
                        {ref.creditsGranted && <span className="text-amber-600">Credits granted</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No referrals in this period
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referrer Distribution */}
        {distribution.length > 0 && (
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                Referrer Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {distribution.map((d) => (
                  <div key={d.referralCount} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg">
                    <span className="text-sm text-indigo-700">
                      <strong>{d.referrerCount}</strong> users with <strong>{d.referralCount}</strong> referral{d.referralCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
