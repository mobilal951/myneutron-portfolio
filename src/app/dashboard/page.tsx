"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parse } from "date-fns";
import { Users, UserPlus, Puzzle, CreditCard, Globe, TrendingUp, FileText } from "lucide-react";

interface DbStats {
  overview: {
    totalUsers: number;
    newUsersLast7Days: number;
    activeSubscriptions: number;
    paidSubscriptions: number;
    totalSeeds: number;
    totalChunks: number;
    extensionUsers: number;
  };
  subscriptions: {
    free: number;
    basic: number;
    pro: number;
  };
  dailySignups: { date: string; count: number }[];
}

interface CountryData {
  country: string;
  activeUsers: number;
}

interface WebsiteTrafficData {
  date: string;
  activeUsers: number;
  ctaClicks: number;
}

interface GAOverview {
  activeUsers: number;
  sessions: number;
  newUsers: number;
}

export default function DashboardPage() {
  const { selectedProperty, getDateParams, loading: contextLoading, isDemoMode, refreshKey, setLastUpdated, setRefreshing } = useDashboard();

  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [gaOverview, setGaOverview] = useState<GAOverview | null>(null);
  const [visitorsAllTime, setVisitorsAllTime] = useState<number>(0);
  const [countriesAllTime, setCountriesAllTime] = useState<CountryData[]>([]);
  const [countriesLast7Days, setCountriesLast7Days] = useState<CountryData[]>([]);
  const [websiteTraffic, setWebsiteTraffic] = useState<WebsiteTrafficData[]>([]);
  const [visitorsLast7Days, setVisitorsLast7Days] = useState<number>(0);
  const [extensionUsers, setExtensionUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (contextLoading) return;

      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateParams();

      // Always fetch DB stats (no auth required)
      const dbParams = new URLSearchParams({ startDate, endDate });

      try {
        // Fetch DB stats and extension stats in parallel
        const [dbStatsRes, extensionStatsRes] = await Promise.all([
          fetch(`/api/db/stats?${dbParams}`),
          fetch('/api/extension/stats'),
        ]);

        const dbStatsData = await dbStatsRes.json();
        const extensionStatsData = await extensionStatsRes.json();

        if (dbStatsRes.ok) {
          setDbStats(dbStatsData);
        } else {
          console.error("DB Stats error:", dbStatsData.error);
        }

        if (extensionStatsRes.ok) {
          setExtensionUsers(extensionStatsData.users || 0);
        } else {
          console.error("Extension stats error:", extensionStatsData.error);
        }
      } catch (err: any) {
        console.error("Failed to fetch stats:", err);
      }

      // Fetch GA data only if authenticated and property selected
      if (!isDemoMode && selectedProperty) {
        const params = new URLSearchParams({
          propertyId: selectedProperty,
          startDate,
          endDate,
        });

        // Params for last 7 days
        const last7DaysParams = new URLSearchParams({
          propertyId: selectedProperty,
          startDate: "7daysAgo",
          endDate: "today",
        });

        // Params for "all time" (from Oct 1st, 2025)
        const allTimeParams = new URLSearchParams({
          propertyId: selectedProperty,
          startDate: "2025-10-01",
          endDate: "today",
        });

        try {
          // Fetch all GA data in parallel
          const [trafficRes, countriesAllTimeRes, countriesLast7DaysRes, allTimeTrafficRes, last7DaysTrafficRes] = await Promise.all([
            fetch(`/api/ga/traffic?${params}`),
            fetch(`/api/ga/countries?${allTimeParams}`),
            fetch(`/api/ga/countries?${last7DaysParams}`),
            fetch(`/api/ga/traffic?${allTimeParams}`),
            fetch(`/api/ga/traffic?${last7DaysParams}`),
          ]);

          const [trafficData, countriesAllTimeData, countriesLast7DaysData, allTimeTrafficData, last7DaysTrafficData] = await Promise.all([
            trafficRes.json(),
            countriesAllTimeRes.json(),
            countriesLast7DaysRes.json(),
            allTimeTrafficRes.json(),
            last7DaysTrafficRes.json(),
          ]);

          if (trafficRes.ok) {
            setGaOverview(trafficData.overview);
            setWebsiteTraffic(trafficData.websiteTraffic || []);
          }

          if (countriesAllTimeRes.ok) {
            setCountriesAllTime(countriesAllTimeData.countries || []);
          }

          if (countriesLast7DaysRes.ok) {
            setCountriesLast7Days(countriesLast7DaysData.countries || []);
          }

          // Set visitors all time (from Oct 1st, 2025)
          if (allTimeTrafficRes.ok) {
            setVisitorsAllTime(allTimeTrafficData.overview?.activeUsers || 0);
          }

          // Set visitors in last 7 days
          if (last7DaysTrafficRes.ok) {
            setVisitorsLast7Days(last7DaysTrafficData.overview?.activeUsers || 0);
          }
        } catch (err: any) {
          console.error("Failed to fetch GA data:", err);
          setError("Failed to fetch Google Analytics data. Please sign in.");
        }
      }

      setLastUpdated(new Date());
      setRefreshing(false);
      setLoading(false);
    }

    fetchData();
  }, [selectedProperty, getDateParams, contextLoading, isDemoMode, refreshKey]);

  const isLoading = loading || contextLoading;

  // Format date for charts
  const formatDate = (dateString: string): string => {
    try {
      if (dateString.includes("-")) {
        return format(new Date(dateString), "d-MMM");
      }
      const date = parse(dateString, "yyyyMMdd", new Date());
      return format(date, "d-MMM");
    } catch {
      return dateString;
    }
  };

  // Format number with K suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
  };


  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      {/* Header */}
      <Header title="Traffic Overview" />

      <div className="flex-1 px-3 sm:px-4 md:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 overflow-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-sm text-sm">
            {error}
          </div>
        )}

        {/* Top KPI Cards - 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {/* Visitors (all time - from Oct 1st, 2025) */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              {isLoading ? (
                <Skeleton className="h-16 sm:h-20 md:h-24 w-full" />
              ) : isDemoMode ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500 truncate">Visitors (all time)</p>
                    <p className="text-sm sm:text-lg md:text-xl text-gray-400 mt-1">Connect GA</p>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 bg-blue-50 rounded-lg sm:rounded-xl flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-blue-500" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500 truncate">Visitors (all time)</p>
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-0.5 sm:mt-1">{formatNumber(visitorsAllTime)}</p>
                    <p className="text-[10px] sm:text-xs md:text-sm text-blue-600 mt-0.5 sm:mt-1 flex items-center gap-1">
                      <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                      <span className="truncate">{formatNumber(visitorsLast7Days)} last 7d</span>
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 bg-blue-50 rounded-lg sm:rounded-xl flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-blue-500" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sign-ups (all time) */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600" />
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              {isLoading ? (
                <Skeleton className="h-16 sm:h-20 md:h-24 w-full" />
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500 truncate">Sign-ups (all time)</p>
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-0.5 sm:mt-1">{formatNumber(dbStats?.overview.totalUsers || 0)}</p>
                    <p className="text-[10px] sm:text-xs md:text-sm text-green-600 mt-0.5 sm:mt-1 flex items-center gap-1">
                      <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                      <span className="truncate">{dbStats?.overview.newUsersLast7Days || 0} last 7d</span>
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 bg-green-50 rounded-lg sm:rounded-xl flex-shrink-0">
                    <UserPlus className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-green-500" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extension Installs */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              {isLoading ? (
                <Skeleton className="h-16 sm:h-20 md:h-24 w-full" />
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500 truncate">Extension Installs</p>
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-0.5 sm:mt-1">
                      {formatNumber(extensionUsers)}
                    </p>
                    <p className="text-[10px] sm:text-xs md:text-sm text-purple-600 mt-0.5 sm:mt-1 truncate">Chrome Web Store</p>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 bg-purple-50 rounded-lg sm:rounded-xl flex-shrink-0">
                    <Puzzle className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-purple-500" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscriptions */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600" />
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              {isLoading ? (
                <Skeleton className="h-16 sm:h-20 md:h-24 w-full" />
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500 truncate">Paid Subscriptions</p>
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-0.5 sm:mt-1">{dbStats?.overview.paidSubscriptions || 0}</p>
                    <p className="text-[10px] sm:text-xs md:text-sm text-amber-600 mt-0.5 sm:mt-1 truncate">Active billing</p>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 bg-amber-50 rounded-lg sm:rounded-xl flex-shrink-0">
                    <CreditCard className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-amber-500" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Left (Charts) + Right (Country Cards Stacked) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch">
          {/* Left Column: Charts (stacked) - 2/3 width */}
          <div className="lg:col-span-2 flex flex-col gap-3 sm:gap-4 order-2 lg:order-1">
            {/* Daily Signups Chart */}
            <Card className="bg-white shadow-sm border-0 flex-1 flex flex-col">
              <CardHeader className="py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6">
                <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-500" />
                  Daily Signups
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-4 pb-3 sm:pb-4 pt-0 flex-1">
                {isLoading ? (
                  <Skeleton className="h-[180px] sm:h-full sm:min-h-[200px] w-full" />
                ) : !dbStats?.dailySignups || dbStats.dailySignups.length === 0 ? (
                  <div className="h-[180px] sm:h-full sm:min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500">No signup data available</p>
                  </div>
                ) : (
                  <div className="h-[180px] sm:h-full sm:min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dbStats.dailySignups.map(d => ({ ...d, formattedDate: formatDate(d.date) }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="formattedDate"
                          tick={{ fontSize: 12, fill: "#374151" }}
                          angle={-45}
                          textAnchor="end"
                          height={40}
                          interval={Math.floor(dbStats.dailySignups.length / 8)}
                          axisLine={{ stroke: "#e5e7eb" }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#374151" }} axisLine={{ stroke: "#e5e7eb" }} width={25} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: "12px" }}
                          formatter={(value) => [value as number, "Signups"]}
                        />
                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 1.5, strokeWidth: 0 }} activeDot={{ r: 3, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Website Traffic Chart */}
            <Card className="bg-white shadow-sm border-0 flex-1 flex flex-col">
              <CardHeader className="py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6">
                <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-indigo-500" />
                  Website Traffic
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-4 pb-3 sm:pb-4 pt-0 flex-1">
                {isDemoMode ? (
                  <div className="h-[180px] sm:h-full sm:min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-gray-500">Connect Google Analytics to view</p>
                    </div>
                  </div>
                ) : isLoading ? (
                  <Skeleton className="h-[180px] sm:h-full sm:min-h-[200px] w-full" />
                ) : !websiteTraffic || websiteTraffic.length === 0 ? (
                  <div className="h-[180px] sm:h-full sm:min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500">No traffic data available</p>
                  </div>
                ) : (
                  <div className="h-[180px] sm:h-full sm:min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={websiteTraffic.map(d => ({ ...d, formattedDate: formatDate(d.date) }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="formattedDate"
                          tick={{ fontSize: 12, fill: "#374151" }}
                          angle={-45}
                          textAnchor="end"
                          height={40}
                          interval={Math.floor(websiteTraffic.length / 8)}
                          axisLine={{ stroke: "#e5e7eb" }}
                        />
                        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#374151" }} axisLine={{ stroke: "#e5e7eb" }} width={25} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#374151" }} axisLine={{ stroke: "#e5e7eb" }} width={25} />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", fontSize: "12px" }} />
                        <Legend wrapperStyle={{ fontSize: "13px" }} />
                        <Bar yAxisId="left" dataKey="activeUsers" name="Active Users" fill="#3b82f6" radius={[3, 3, 0, 0]} label={{ position: 'top', fill: '#374151', fontSize: 10 }} />
                        <Line yAxisId="right" type="monotone" dataKey="ctaClicks" name="CTA Clicks" stroke="#f43f5e" strokeWidth={2} dot={{ fill: "#f43f5e", r: 1.5, strokeWidth: 0 }} activeDot={{ r: 3, strokeWidth: 0 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Stacked Country Cards + Auto Insights - 1/3 width */}
          <div className="space-y-3 sm:space-y-4 order-1 lg:order-2">
            {isDemoMode ? (
              <Card className="bg-white shadow-sm border-0">
                <CardContent className="p-4 sm:p-6 text-center">
                  <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-gray-400">Visitors by Country</p>
                  <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">Connect Google Analytics to view</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* All Time Countries */}
                <Card className="bg-white shadow-sm border-0 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                  <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 md:pt-5 px-3 sm:px-4 md:px-5">
                    <CardTitle className="text-xs sm:text-sm md:text-base font-semibold text-gray-600 flex items-center gap-1.5 sm:gap-2">
                      <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-500" />
                      Top Countries — All Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2 px-1.5 sm:px-2">
                      <span>Country</span>
                      <div className="flex items-center gap-3 sm:gap-6">
                        <span>Users</span>
                        <span>Share</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5">
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-7 sm:h-8 md:h-10 w-full" />
                        ))
                      ) : countriesAllTime.length === 0 ? (
                        <p className="text-xs sm:text-sm md:text-base text-gray-500 text-center py-3 sm:py-4">No data</p>
                      ) : (
                        (() => {
                          const totalUsers = countriesAllTime.reduce((sum, c) => sum + c.activeUsers, 0);
                          return countriesAllTime.slice(0, 5).map((country) => {
                            const sharePercent = totalUsers > 0 ? (country.activeUsers / totalUsers) * 100 : 0;
                            return (
                              <div key={country.country} className="relative rounded overflow-hidden">
                                <div className="absolute inset-0 bg-blue-100" style={{ width: `${sharePercent}%` }} />
                                <div className="relative flex items-center justify-between py-1.5 sm:py-2 md:py-2.5 px-1.5 sm:px-2 md:px-3">
                                  <span className="text-xs sm:text-sm md:text-base font-medium text-gray-800 truncate max-w-[100px] sm:max-w-none">{country.country}</span>
                                  <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
                                    <span className="text-xs sm:text-sm md:text-base text-gray-600">{formatNumber(country.activeUsers)}</span>
                                    <span className="text-xs sm:text-sm md:text-base font-semibold text-blue-600 w-10 sm:w-12 md:w-14 text-right">{sharePercent.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Last 7 Days Countries */}
                <Card className="bg-white shadow-sm border-0 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                  <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 md:pt-5 px-3 sm:px-4 md:px-5">
                    <CardTitle className="text-xs sm:text-sm md:text-base font-semibold text-gray-600 flex items-center gap-1.5 sm:gap-2">
                      <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-emerald-500" />
                      Top Countries — Last 7 Days
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs md:text-sm text-gray-500 uppercase tracking-wider mb-1.5 sm:mb-2 px-1.5 sm:px-2">
                      <span>Country</span>
                      <div className="flex items-center gap-3 sm:gap-6">
                        <span>Users</span>
                        <span>Share</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5">
                      {isLoading ? (
                        [...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-7 sm:h-8 md:h-10 w-full" />
                        ))
                      ) : countriesLast7Days.length === 0 ? (
                        <p className="text-xs sm:text-sm md:text-base text-gray-500 text-center py-3 sm:py-4">No data</p>
                      ) : (
                        (() => {
                          const totalUsers = countriesLast7Days.reduce((sum, c) => sum + c.activeUsers, 0);
                          return countriesLast7Days.slice(0, 5).map((country) => {
                            const sharePercent = totalUsers > 0 ? (country.activeUsers / totalUsers) * 100 : 0;
                            return (
                              <div key={country.country} className="relative rounded overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-100" style={{ width: `${sharePercent}%` }} />
                                <div className="relative flex items-center justify-between py-1.5 sm:py-2 md:py-2.5 px-1.5 sm:px-2 md:px-3">
                                  <span className="text-xs sm:text-sm md:text-base font-medium text-gray-800 truncate max-w-[100px] sm:max-w-none">{country.country}</span>
                                  <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
                                    <span className="text-xs sm:text-sm md:text-base text-gray-600">{formatNumber(country.activeUsers)}</span>
                                    <span className="text-xs sm:text-sm md:text-base font-semibold text-emerald-600 w-10 sm:w-12 md:w-14 text-right">{sharePercent.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Auto Insights */}
            <Card className="bg-white shadow-sm border-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
              <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 md:pt-5 px-3 sm:px-4 md:px-5">
                <CardTitle className="text-xs sm:text-sm md:text-base font-semibold text-gray-600 flex items-center gap-1.5 sm:gap-2">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-slate-500" />
                  Auto Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                <ul className="space-y-1.5 sm:space-y-2 md:space-y-3">
                  {!isDemoMode && countriesAllTime.length > 0 && (() => {
                    const totalAllTime = countriesAllTime.reduce((sum, c) => sum + c.activeUsers, 0);
                    const topCountryShare = totalAllTime > 0 ? ((countriesAllTime[0].activeUsers / totalAllTime) * 100).toFixed(1) : 0;
                    return (
                      <li className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 mt-1.5 md:mt-2 flex-shrink-0"></span>
                        <span className="text-xs sm:text-sm md:text-base text-gray-700">
                          <span className="font-medium text-blue-600">{countriesAllTime[0]?.country}</span> leads with {topCountryShare}% of all traffic.
                        </span>
                      </li>
                    );
                  })()}
                  {dbStats && dbStats.overview.totalUsers > 0 && (() => {
                    const avgDaily = (dbStats.overview.newUsersLast7Days / 7).toFixed(1);
                    return (
                      <li className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mt-1.5 md:mt-2 flex-shrink-0"></span>
                        <span className="text-xs sm:text-sm md:text-base text-gray-700">
                          Averaging <span className="font-medium text-green-600">{avgDaily}</span> signups/day this week.
                        </span>
                      </li>
                    );
                  })()}
                  {dbStats && visitorsAllTime > 0 && (() => {
                    const conversionRate = ((dbStats.overview.totalUsers / visitorsAllTime) * 100).toFixed(1);
                    return (
                      <li className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 mt-1.5 md:mt-2 flex-shrink-0"></span>
                        <span className="text-xs sm:text-sm md:text-base text-gray-700">
                          Conversion: <span className="font-medium text-purple-600">{conversionRate}%</span>
                        </span>
                      </li>
                    );
                  })()}
                  {dbStats && dbStats.overview.paidSubscriptions > 0 && (() => {
                    const paidRate = ((dbStats.overview.paidSubscriptions / dbStats.overview.totalUsers) * 100).toFixed(1);
                    return (
                      <li className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 mt-1.5 md:mt-2 flex-shrink-0"></span>
                        <span className="text-xs sm:text-sm md:text-base text-gray-700">
                          <span className="font-medium text-amber-600">{paidRate}%</span> paid subscribers.
                        </span>
                      </li>
                    );
                  })()}
                  {dbStats && dbStats.overview.extensionUsers > 0 && (() => {
                    const extensionRate = ((dbStats.overview.extensionUsers / dbStats.overview.totalUsers) * 100).toFixed(1);
                    return (
                      <li className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500 mt-1.5 md:mt-2 flex-shrink-0"></span>
                        <span className="text-xs sm:text-sm md:text-base text-gray-700">
                          Extension: <span className="font-medium text-indigo-600">{extensionRate}%</span> adoption.
                        </span>
                      </li>
                    );
                  })()}
                  {isDemoMode && (
                    <li className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400 mt-1.5 md:mt-2 flex-shrink-0"></span>
                      <span className="text-xs sm:text-sm md:text-base text-gray-500">Sign in with Google to see insights.</span>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
