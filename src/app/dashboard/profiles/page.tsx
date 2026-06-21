"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/dashboard/header";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  Briefcase,
  Building2,
  Globe,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface ProfileStats {
  summary: {
    totalUsers: number;
    completedProfiles: number;
    incompleteProfiles: number;
    completionRate: number;
  };
  usageTypes: Array<{ type: string; count: number; percentage: number }>;
  fieldCompletion: {
    [key: string]: { filled: number; percentage: number };
  };
  demographics: {
    professions: Array<{ value: string; count: number }>;
    industries: Array<{ value: string; count: number }>;
    genders: Array<{ value: string; count: number }>;
    countries: Array<{ value: string; count: number }>;
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString();
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

export default function ProfilesPage() {
  const { dateRange, getDateParams } = useDashboard();
  const [data, setData] = useState<ProfileStats | null>(null);
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

      const response = await fetch(`/api/db/profile-stats?${params.toString()}`);
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
        <Header title="User Profiles" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="User Profiles" />
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

  const { summary, usageTypes, fieldCompletion, demographics } = data;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="User Profiles" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Total Users</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(summary.totalUsers)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatNumber(summary.completedProfiles)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <UserX className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Incomplete</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{formatNumber(summary.incompleteProfiles)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Completion Rate</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{summary.completionRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Types */}
        {usageTypes.length > 0 && (
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                User Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {usageTypes.map((type) => (
                  <div key={type.type} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{type.type}</span>
                      <span className="text-sm text-muted-foreground">{type.percentage}%</span>
                    </div>
                    <p className="text-2xl font-bold mb-2">{formatNumber(type.count)}</p>
                    <ProgressBar percentage={type.percentage} color="bg-blue-500" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Field Completion */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Field Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(fieldCompletion).map(([field, stats]) => (
                <div key={field} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium capitalize">
                    {field.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                  <div className="flex-1">
                    <ProgressBar
                      percentage={stats.percentage}
                      color={stats.percentage > 50 ? "bg-green-500" : stats.percentage > 25 ? "bg-yellow-500" : "bg-red-500"}
                    />
                  </div>
                  <div className="w-20 text-right text-sm text-muted-foreground">
                    {Math.round(stats.percentage)}% ({formatNumber(stats.filled)})
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Professions */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-500" />
                Top Professions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demographics.professions.map((item, idx) => (
                  <div key={item.value} className="flex items-center gap-3">
                    <span className="w-6 text-sm text-muted-foreground">{idx + 1}.</span>
                    <span className="flex-1 text-sm">{item.value}</span>
                    <span className="text-sm font-medium">{formatNumber(item.count)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industries */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-500" />
                Top Industries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demographics.industries.map((item, idx) => (
                  <div key={item.value} className="flex items-center gap-3">
                    <span className="w-6 text-sm text-muted-foreground">{idx + 1}.</span>
                    <span className="flex-1 text-sm">{item.value}</span>
                    <span className="text-sm font-medium">{formatNumber(item.count)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Countries */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-500" />
                Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demographics.countries.map((item, idx) => (
                  <div key={item.value} className="flex items-center gap-3">
                    <span className="w-6 text-sm text-muted-foreground">{idx + 1}.</span>
                    <span className="flex-1 text-sm">{item.value}</span>
                    <span className="text-sm font-medium">{formatNumber(item.count)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gender */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-pink-500" />
                Gender Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demographics.genders.map((item) => {
                  const total = demographics.genders.reduce((sum, g) => sum + g.count, 0);
                  const percentage = (item.count / total) * 100;
                  return (
                    <div key={item.value}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{item.value}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(item.count)} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <ProgressBar
                        percentage={percentage}
                        color={item.value === "male" ? "bg-blue-500" : "bg-pink-500"}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
