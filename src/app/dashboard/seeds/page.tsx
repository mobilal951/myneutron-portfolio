"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/dashboard/header";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Database,
  Users,
  Loader2,
  AlertCircle,
  TrendingUp,
  FileText,
  Folder,
  Clock,
  Lightbulb,
  CheckCircle,
  BarChart3,
  FileCode,
  FileSpreadsheet,
  Globe,
  BookOpen,
  Briefcase,
  MessageSquare,
  StickyNote,
  Heart,
  Scale,
  Calculator,
  Image,
  Bot,
  Presentation,
  FileJson,
  MousePointerClick,
  Mail,
} from "lucide-react";

interface SeedsStats {
  summary: {
    totalSeeds: number;
    allTimeSeeds: number;
    uniqueUsers: number;
    avgSeedsPerUser: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  fileTypeBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topUsers: Array<{
    userId: string;
    fullUserId: string;
    seedCount: number;
    userName: string;
    plan: string;
  }>;
  activity: {
    seedsPerDay: Array<{ date: string; count: number }>;
  };
  recentSeeds: Array<{
    id: string;
    title: string;
    category: string;
    fileType: string;
    userId: string;
    createdAt: string;
    contentPreview: string;
  }>;
  insights: string[];
  tableSchema: string[];
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

// Category icon mapping
function getCategoryIcon(category: string) {
  const icons: Record<string, any> = {
    'Legal Documents': Scale,
    'Accounting & Finance': Calculator,
    'Programming & Code': FileCode,
    'Education & Homework': BookOpen,
    'Website & Marketing': Globe,
    'Client Communication': MessageSquare,
    'Business & Operations': Briefcase,
    'Personal & Notes': StickyNote,
    'Product & Technical Docs': FileText,
    'Healthcare & Medical': Heart,
    'Other': Folder,
  };
  return icons[category] || Folder;
}

// Category color mapping
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Legal Documents': 'bg-purple-100 text-purple-700 border-purple-200',
    'Accounting & Finance': 'bg-green-100 text-green-700 border-green-200',
    'Programming & Code': 'bg-blue-100 text-blue-700 border-blue-200',
    'Education & Homework': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Website & Marketing': 'bg-pink-100 text-pink-700 border-pink-200',
    'Client Communication': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Business & Operations': 'bg-slate-100 text-slate-700 border-slate-200',
    'Personal & Notes': 'bg-orange-100 text-orange-700 border-orange-200',
    'Product & Technical Docs': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Healthcare & Medical': 'bg-red-100 text-red-700 border-red-200',
    'Other': 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
}

function getCategoryBgColor(category: string): string {
  const colors: Record<string, string> = {
    'Legal Documents': 'bg-purple-500',
    'Accounting & Finance': 'bg-green-500',
    'Programming & Code': 'bg-blue-500',
    'Education & Homework': 'bg-yellow-500',
    'Website & Marketing': 'bg-pink-500',
    'Client Communication': 'bg-indigo-500',
    'Business & Operations': 'bg-slate-500',
    'Personal & Notes': 'bg-orange-500',
    'Product & Technical Docs': 'bg-cyan-500',
    'Healthcare & Medical': 'bg-red-500',
    'Other': 'bg-gray-500',
  };
  return colors[category] || 'bg-gray-500';
}

// Daily Activity Chart Component with Hover Tooltips
function DailyActivityChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const [hoveredBar, setHoveredBar] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const chartHeight = 180;
  const barMaxHeight = 140;

  // Format date for display
  const formatDateFull = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateShort = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Calculate which bars should show x-axis labels (every nth bar based on data length)
  const getLabelInterval = () => {
    if (data.length <= 7) return 1; // Show all labels
    if (data.length <= 14) return 2; // Every 2nd
    if (data.length <= 21) return 3; // Every 3rd
    if (data.length <= 31) return 5; // Every 5th
    return 7; // Every 7th for longer periods
  };

  const labelInterval = getLabelInterval();

  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Seeds Created Per Day
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto relative">
          <div className="flex min-w-[600px]">
            {/* Y-axis scale */}
            <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground" style={{ height: `${chartHeight}px` }}>
              <span>{maxCount}</span>
              <span>{Math.round(maxCount * 0.75)}</span>
              <span>{Math.round(maxCount * 0.5)}</span>
              <span>{Math.round(maxCount * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Chart area */}
            <div className="flex-1">
              <div className="flex items-end gap-1 border-l border-b border-gray-200 relative" style={{ height: `${chartHeight}px` }}>
                {data.map((day, idx) => {
                  const heightPx = Math.max((day.count / maxCount) * barMaxHeight, 4);
                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center justify-end gap-0.5 relative group"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredBar({
                          date: day.date,
                          count: day.count,
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div
                        className={`w-full rounded-t transition-all cursor-pointer min-w-[8px] ${
                          hoveredBar?.date === day.date
                            ? 'bg-green-600 scale-105'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                        style={{ height: `${heightPx}px` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex mt-2">
                {data.map((day, idx) => (
                  <div key={day.date} className="flex-1 text-center">
                    {idx % labelInterval === 0 && (
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDateShort(day.date)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hover Tooltip */}
          {hoveredBar && (
            <div
              className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
              style={{
                left: hoveredBar.x,
                top: hoveredBar.y - 8,
              }}
            >
              <p className="text-xs font-medium">{formatDateFull(hoveredBar.date)}</p>
              <p className="text-sm font-bold text-green-400">{hoveredBar.count} seeds</p>
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-green-600">
              {data.reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Daily Avg</p>
            <p className="text-lg font-bold text-blue-600">
              {(data.reduce((sum, d) => sum + d.count, 0) / data.length).toFixed(1)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Peak Day</p>
            <p className="text-lg font-bold text-purple-600">{maxCount}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Days</p>
            <p className="text-lg font-bold text-gray-600">{data.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SeedsAnalyticsPage() {
  const { dateRange, getDateParams } = useDashboard();
  const [data, setData] = useState<SeedsStats | null>(null);
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

      const response = await fetch(`/api/db/seeds-stats?${params.toString()}`);
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
        <Header title="Seeds Analytics" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="Seeds Analytics" />
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

  const { summary, categoryBreakdown, fileTypeBreakdown, topUsers, activity, recentSeeds, insights } = data;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Seeds Analytics" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Total Seeds</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(summary.totalSeeds)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                of {formatNumber(summary.allTimeSeeds)} all-time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Unique Users</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatNumber(summary.uniqueUsers)}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Avg Seeds/User</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{summary.avgSeedsPerUser}</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Folder className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Categories</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{categoryBreakdown.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        {insights.length > 0 && (
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Content Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {categoryBreakdown.map((cat) => {
                    const Icon = getCategoryIcon(cat.category);
                    return (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{cat.category}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {cat.count} ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getCategoryBgColor(cat.category)}`}
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No seeds in this date range
                </p>
              )}
            </CardContent>
          </Card>

          {/* File Type Breakdown */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                File Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fileTypeBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {fileTypeBreakdown.map((ft) => {
                    // Icon and color mapping for file types
                    const getFileTypeIcon = (type: string) => {
                      const iconMap: Record<string, { icon: any; color: string }> = {
                        'PDF': { icon: FileText, color: 'text-red-500' },
                        'Word Document': { icon: FileText, color: 'text-blue-500' },
                        'Spreadsheet': { icon: FileSpreadsheet, color: 'text-green-600' },
                        'Presentation': { icon: Presentation, color: 'text-orange-500' },
                        'Markdown': { icon: FileCode, color: 'text-gray-600' },
                        'JSON': { icon: FileJson, color: 'text-yellow-600' },
                        'Image': { icon: Image, color: 'text-pink-500' },
                        'Web Content': { icon: Globe, color: 'text-purple-500' },
                        'Web Selection': { icon: MousePointerClick, color: 'text-indigo-500' },
                        'Text/Note': { icon: StickyNote, color: 'text-yellow-500' },
                        'AI Chat': { icon: Bot, color: 'text-cyan-500' },
                        'Email': { icon: Mail, color: 'text-blue-400' },
                        'Google Doc': { icon: FileText, color: 'text-blue-600' },
                        'Google Sheet': { icon: FileSpreadsheet, color: 'text-green-500' },
                        'Google Slide': { icon: Presentation, color: 'text-yellow-500' },
                        'RTF Document': { icon: FileText, color: 'text-gray-500' },
                      };
                      return iconMap[type] || { icon: FileText, color: 'text-gray-400' };
                    };

                    const { icon: Icon, color } = getFileTypeIcon(ft.type);

                    return (
                      <div key={ft.type} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${color}`} />
                            <span className="text-sm font-medium">{ft.type}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {ft.count} ({ft.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                            style={{ width: `${ft.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No file data available
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Users */}
        {topUsers.length > 0 && (
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Top Users by Seeds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {topUsers.map((user, idx) => (
                  <div
                    key={user.fullUserId}
                    className={`p-3 rounded-lg border ${
                      idx === 0
                        ? 'bg-yellow-50 border-yellow-200'
                        : idx === 1
                        ? 'bg-slate-50 border-slate-200'
                        : idx === 2
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-lg font-bold ${
                        idx === 0 ? 'text-yellow-600' : idx === 1 ? 'text-slate-600' : idx === 2 ? 'text-orange-600' : 'text-gray-600'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.plan === 'pro' || user.plan === 'Pro'
                          ? 'bg-purple-100 text-purple-700'
                          : user.plan === 'premium' || user.plan === 'Premium'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.plan}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate" title={user.userName}>
                      {user.userName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate" title={user.fullUserId}>
                      {user.userId}
                    </p>
                    <p className="text-lg font-bold mt-1">{user.seedCount} seeds</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Seeds */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Recent Seeds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {recentSeeds.length > 0 ? (
                recentSeeds.map((seed) => (
                  <div
                    key={seed.id}
                    className="p-4 rounded-lg border bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {seed.title || "Untitled"}
                        </p>
                        {seed.contentPreview && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {seed.contentPreview}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded border ${getCategoryColor(seed.category)}`}>
                            {seed.category}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {seed.fileType}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeAgo(seed.createdAt)}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {seed.userId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No seeds in this date range
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Activity Chart */}
        {activity.seedsPerDay.length > 0 && (
          <DailyActivityChart data={activity.seedsPerDay} />
        )}
      </div>
    </div>
  );
}
