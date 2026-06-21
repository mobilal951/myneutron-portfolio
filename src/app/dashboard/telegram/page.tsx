"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { Header } from "@/components/dashboard/header";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Send,
  Users,
  MessageSquare,
  Database,
  Coins,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
  Clock,
  FileText,
  Image,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TelegramStats {
  overview: {
    connectedAccounts: number;
    totalAiQueries: number;
    allTimeAiQueries: number;
    totalSeeds: number;
    allTimeSeeds: number;
    creditsSpent: number;
    uniqueUsers: number;
  };
  connectedAccountsList: Array<{
    username: string;
    lastActiveAt: string;
    createdAt: string;
  }>;
  activity: {
    aiQueriesPerDay: Array<{ date: string; count: number }>;
    seedsPerDay: Array<{ date: string; count: number }>;
  };
  seedsBreakdown: Array<{ type: string; count: number; percentage: number }>;
  actionsBreakdown: Array<{ action: string; count: number }>;
  topUsers: Array<{
    userId: string;
    fullUserId: string;
    userName: string;
    telegramUsername: string;
    queries: number;
    seeds: number;
    credits: number;
  }>;
  recentSeeds: Array<{
    id: string;
    title: string;
    type: string;
    createdAt: string;
  }>;
  insights: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatActionName(action: string): string {
  const actionMap: Record<string, string> = {
    ai_query: "AI Queries",
    save_seed: "Seeds Saved",
    upload_document: "Documents Uploaded",
  };
  return actionMap[action] || action;
}

function getTypeIcon(type: string) {
  switch (type) {
    case "text":
      return <FileText className="h-4 w-4 text-blue-500" />;
    case "image":
      return <Image className="h-4 w-4 text-purple-500" />;
    default:
      return <Database className="h-4 w-4 text-gray-500" />;
  }
}

function TelegramPageContent() {
  const { dateRange, getDateParams } = useDashboard();
  const [data, setData] = useState<TelegramStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);
  const prevDateRange = useRef(dateRange);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const { startDate, endDate } = getDateParams();
      const params = new URLSearchParams();
      if (startDate && startDate !== "30daysAgo") params.set("startDate", startDate);
      if (endDate && endDate !== "today") params.set("endDate", endDate);

      const response = await fetch(`/api/db/telegram-stats?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch Telegram stats");
      }

      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchData();
    initialFetchDone.current = true;
  }, []);

  // Refetch when global date range changes
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
        <Header title="Telegram Bot" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-muted-foreground">Loading Telegram stats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="Telegram Bot" />
        <div className="flex-1 p-3 sm:p-4 md:p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-8">
                <div className="p-4 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
                <p className="text-muted-foreground max-w-md mb-6">{error}</p>
                <Button variant="outline" onClick={() => fetchData(false)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, connectedAccountsList, activity, seedsBreakdown, actionsBreakdown, topUsers, recentSeeds, insights } = data;

  // Combine activity data for chart
  const chartData = activity.aiQueriesPerDay.map((item) => {
    const seedsItem = activity.seedsPerDay.find((s) => s.date === item.date);
    return {
      date: formatDate(item.date),
      queries: item.count,
      seeds: seedsItem?.count || 0,
    };
  });

  // Add any seeds days not in queries
  activity.seedsPerDay.forEach((seedItem) => {
    if (!chartData.find((c) => c.date === formatDate(seedItem.date))) {
      chartData.push({
        date: formatDate(seedItem.date),
        queries: 0,
        seeds: seedItem.count,
      });
    }
  });

  // Sort by date
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Telegram Bot" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        {/* Bot Status Card */}
        <Card className="border-slate-200 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">myNeutron Telegram Bot</h2>
                  <p className="text-sm text-muted-foreground">
                    {overview.connectedAccounts} connected account{overview.connectedAccounts !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Connected Accounts</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(overview.connectedAccounts)}</p>
              <p className="text-xs text-muted-foreground">active</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">AI Queries</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(overview.totalAiQueries)}</p>
              <p className="text-xs text-muted-foreground">
                / {formatNumber(overview.allTimeAiQueries)} all time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Seeds Saved</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(overview.totalSeeds)}</p>
              <p className="text-xs text-muted-foreground">
                / {formatNumber(overview.allTimeSeeds)} all time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Credits Used</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(overview.creditsSpent)}</p>
              <p className="text-xs text-muted-foreground">
                by {overview.uniqueUsers} user{overview.uniqueUsers !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-50 to-white border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {insights.map((insight, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Activity Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Daily Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="queries"
                      name="AI Queries"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: "#22c55e", r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="seeds"
                      name="Seeds Saved"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: "#8b5cf6", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Actions Breakdown */}
            {actionsBreakdown.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Actions Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {actionsBreakdown.map((action) => {
                      const total = actionsBreakdown.reduce((sum, a) => sum + a.count, 0);
                      const percentage = total > 0 ? Math.round((action.count / total) * 100) : 0;
                      return (
                        <div key={action.action}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{formatActionName(action.action)}</span>
                            <span className="text-muted-foreground">
                              {action.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seeds Type Breakdown */}
            {seedsBreakdown.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Seeds by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {seedsBreakdown.map((item) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="text-sm capitalize">{item.type}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Connected Accounts */}
            {connectedAccountsList.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Connected Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {connectedAccountsList.map((account, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-blue-100">
                            <User className="h-3 w-3 text-blue-500" />
                          </div>
                          <span className="text-sm font-medium">@{account.username}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(account.lastActiveAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Users */}
            {topUsers.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Top Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {topUsers.map((user, i) => (
                      <div key={user.fullUserId} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              i === 0
                                ? "bg-amber-100 text-amber-700"
                                : i === 1
                                ? "bg-slate-200 text-slate-700"
                                : i === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-sm font-medium">{user.userName}</span>
                            {user.telegramUsername && (
                              <span className="text-xs text-blue-500 ml-1">@{user.telegramUsername}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {user.queries} queries, {user.credits} credits
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Seeds */}
        {recentSeeds.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Seeds from Telegram</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentSeeds.map((seed) => (
                  <div
                    key={seed.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getTypeIcon(seed.type)}
                      <span className="text-sm truncate">{seed.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatDateTime(seed.createdAt)}
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

export default function TelegramPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
          <Header title="Telegram Bot" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">Loading Telegram stats...</p>
            </div>
          </div>
        </div>
      }
    >
      <TelegramPageContent />
    </Suspense>
  );
}
