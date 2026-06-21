"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserPlus,
  Database,
  MessageSquare,
  Package,
  Lightbulb,
  FileText,
  CreditCard,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

interface ActivityStats {
  usersSignedUp: number;
  accountsCreated: number;
  usersWithNewAccounts: number;
  chatsCreated: number;
  usersWithChats: number;
  messagesSent: number;
  chatsWithMessages: number;
  seedsAdded: number;
  usersWithNewSeeds: number;
  chunksGenerated: number;
  seedsWithNewChunks: number;
  bundlesCreated: number;
  seedsInBundles: number;
}

interface SubscriptionCounts {
  free: number;
  basic: number;
  pro: number;
}

interface DbStats {
  activity: ActivityStats;
  subscriptions: SubscriptionCounts;
}

export default function ActivityPage() {
  const { selectedProperty, getDateParams, loading: contextLoading, isDemoMode, refreshKey, setLastUpdated, setRefreshing } = useDashboard();

  const [stats, setStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!selectedProperty || contextLoading) return;

      setLoading(true);
      setError(null);

      if (isDemoMode) {
        const demoStats: DbStats = {
          activity: {
            usersSignedUp: 1247,
            accountsCreated: 3421,
            usersWithNewAccounts: 892,
            chatsCreated: 5678,
            usersWithChats: 743,
            messagesSent: 24567,
            chatsWithMessages: 4521,
            seedsAdded: 8934,
            usersWithNewSeeds: 567,
            chunksGenerated: 45678,
            seedsWithNewChunks: 7823,
            bundlesCreated: 234,
            seedsInBundles: 1892,
          },
          subscriptions: { free: 100, basic: 3, pro: 2 },
        };

        await new Promise((resolve) => setTimeout(resolve, 500));
        setStats(demoStats);
        setLastUpdated(new Date());
        setRefreshing(false);
        setLoading(false);
        return;
      }

      const { startDate, endDate } = getDateParams();
      const params = new URLSearchParams({
        propertyId: selectedProperty,
        startDate,
        endDate,
      });

      try {
        const response = await fetch(`/api/db/stats?${params}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setStats({
          activity: data.activity,
          subscriptions: data.subscriptions,
        });
        setLastUpdated(new Date());
        setRefreshing(false);
      } catch (err: any) {
        setError(err.message);
        setRefreshing(false);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedProperty, getDateParams, contextLoading, isDemoMode, refreshKey]);

  const isLoading = loading || contextLoading;

  // Calculate insights
  const activity = stats?.activity;
  const avgMessagesPerChat = activity && activity.chatsWithMessages > 0
    ? (activity.messagesSent / activity.chatsWithMessages).toFixed(1)
    : "0";
  const avgChunksPerSeed = activity && activity.seedsWithNewChunks > 0
    ? (activity.chunksGenerated / activity.seedsWithNewChunks).toFixed(0)
    : "0";
  const avgSeedsPerBundle = activity && activity.bundlesCreated > 0
    ? (activity.seedsInBundles / activity.bundlesCreated).toFixed(1)
    : "0";
  const accountLinkRate = activity && activity.usersSignedUp > 0
    ? ((activity.usersWithNewAccounts / activity.usersSignedUp) * 100).toFixed(0)
    : "0";
  const chatEngagementRate = activity && activity.usersSignedUp > 0
    ? ((activity.usersWithChats / activity.usersSignedUp) * 100).toFixed(0)
    : "0";

  const totalPaidSubscriptions = (stats?.subscriptions.basic || 0) + (stats?.subscriptions.pro || 0);

  // Metric card component for consistency
  const MetricItem = ({ value, label, accent }: { value: string | number; label: string; accent: string }) => (
    <div className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2">
      <div className={`w-1 h-6 sm:h-8 rounded-full ${accent}`}></div>
      <div>
        <div className="text-base sm:text-xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        <div className="text-[10px] sm:text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Activity Insights" />

      <div className="flex-1 px-3 sm:px-4 md:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 md:space-y-5 overflow-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3 sm:space-y-4">
            <Skeleton className="h-24 sm:h-32 w-full rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Skeleton className="h-48 sm:h-56 w-full rounded-xl" />
              <Skeleton className="h-48 sm:h-56 w-full rounded-xl" />
            </div>
            <Skeleton className="h-40 sm:h-48 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Top KPI Cards - matching dashboard style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {/* New Users */}
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500 truncate">New Users</p>
                      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-0.5 sm:mt-1">{activity?.usersSignedUp.toLocaleString() || 0}</p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-blue-600 mt-0.5 sm:mt-1 flex items-center gap-1">
                        <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                        <span className="truncate">{accountLinkRate}% activated</span>
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 md:p-4 bg-blue-50 rounded-lg sm:rounded-xl flex-shrink-0">
                      <UserPlus className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages Sent */}
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
                <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500 truncate">Messages Sent</p>
                      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-0.5 sm:mt-1">{activity?.messagesSent.toLocaleString() || 0}</p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-purple-600 mt-0.5 sm:mt-1 flex items-center gap-1">
                        <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                        <span className="truncate">{avgMessagesPerChat} per chat</span>
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 md:p-4 bg-purple-50 rounded-lg sm:rounded-xl flex-shrink-0">
                      <MessageSquare className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-purple-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chunks Generated */}
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-teal-600" />
                <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500 truncate">Chunks Generated</p>
                      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-0.5 sm:mt-1">{activity?.chunksGenerated.toLocaleString() || 0}</p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-teal-600 mt-0.5 sm:mt-1 flex items-center gap-1">
                        <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                        <span className="truncate">{avgChunksPerSeed} per seed</span>
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 md:p-4 bg-teal-50 rounded-lg sm:rounded-xl flex-shrink-0">
                      <Database className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-teal-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Paid Subscribers */}
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600" />
                <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm md:text-base font-medium text-gray-500 truncate">Paid Subscribers</p>
                      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mt-0.5 sm:mt-1">{totalPaidSubscriptions}</p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-green-600 mt-0.5 sm:mt-1 truncate">Active billing</p>
                    </div>
                    <div className="p-2 sm:p-3 md:p-4 bg-green-50 rounded-lg sm:rounded-xl flex-shrink-0">
                      <CreditCard className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
              {/* Users & Accounts */}
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400"></div>
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6">
                  <CardTitle className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
                      <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <span className="truncate">Users & Accounts</span>
                    <span className="ml-auto text-[10px] sm:text-xs font-normal text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {accountLinkRate}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
                    <MetricItem value={activity?.usersSignedUp || 0} label="New Users" accent="bg-blue-500" />
                    <MetricItem value={activity?.accountsCreated || 0} label="Accounts" accent="bg-blue-400" />
                    <MetricItem value={activity?.usersWithNewAccounts || 0} label="Linked" accent="bg-blue-300" />
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-2.5 sm:p-3 border-l-2 sm:border-l-3 border-blue-400">
                    <p className="text-xs sm:text-sm text-gray-600">
                      {Number(accountLinkRate) > 80
                        ? <><Zap className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 mr-1" /><strong className="text-blue-700">{accountLinkRate}%</strong> activation rate.</>
                        : Number(accountLinkRate) > 50
                        ? <><TrendingUp className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 mr-1" /><strong className="text-blue-700">{accountLinkRate}%</strong> linked accounts.</>
                        : <><BarChart3 className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 mr-1" />Only <strong className="text-blue-700">{accountLinkRate}%</strong> linked.</>
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Seeds & Chunks */}
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-400"></div>
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6">
                  <CardTitle className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-teal-50 rounded-lg">
                      <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600" />
                    </div>
                    <span className="truncate">Seeds & Chunks</span>
                    <span className="ml-auto text-[10px] sm:text-xs font-normal text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {avgChunksPerSeed}/seed
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                  <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-3 sm:mb-4">
                    <MetricItem value={activity?.seedsAdded || 0} label="Seeds" accent="bg-teal-500" />
                    <MetricItem value={activity?.chunksGenerated || 0} label="Chunks" accent="bg-emerald-500" />
                    <MetricItem value={activity?.usersWithNewSeeds || 0} label="Contributors" accent="bg-teal-400" />
                    <MetricItem value={activity?.seedsWithNewChunks || 0} label="w/ Chunks" accent="bg-emerald-400" />
                  </div>
                  <div className="bg-teal-50/50 rounded-lg p-2.5 sm:p-3 border-l-2 sm:border-l-3 border-teal-400">
                    <p className="text-xs sm:text-sm text-gray-600">
                      <TrendingUp className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-500 mr-1" />
                      <strong className="text-teal-700">{avgChunksPerSeed} chunks/seed</strong> avg.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Chats & Messages */}
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-purple-500 to-violet-400"></div>
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6">
                  <CardTitle className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg">
                      <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                    </div>
                    <span className="truncate">Chats & Messages</span>
                    <span className="ml-auto text-[10px] sm:text-xs font-normal text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {avgMessagesPerChat}/chat
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                  <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-3 sm:mb-4">
                    <MetricItem value={activity?.chatsCreated || 0} label="Chats" accent="bg-purple-500" />
                    <MetricItem value={activity?.messagesSent || 0} label="Messages" accent="bg-violet-500" />
                    <MetricItem value={activity?.usersWithChats || 0} label="Chatters" accent="bg-purple-400" />
                    <MetricItem value={activity?.chatsWithMessages || 0} label="Active" accent="bg-violet-400" />
                  </div>
                  <div className="bg-purple-50/50 rounded-lg p-2.5 sm:p-3 border-l-2 sm:border-l-3 border-purple-400">
                    <p className="text-xs sm:text-sm text-gray-600">
                      <TrendingUp className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 mr-1" />
                      <strong className="text-purple-700">{avgMessagesPerChat} msg/chat</strong> avg.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bundles & Organization */}
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-400"></div>
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6">
                  <CardTitle className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-amber-50 rounded-lg">
                      <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                    </div>
                    <span className="truncate">Bundles</span>
                    <span className="ml-auto text-[10px] sm:text-xs font-normal text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {avgSeedsPerBundle}/bundle
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                  <div className="grid grid-cols-2 gap-1 sm:gap-2 mb-3 sm:mb-4">
                    <MetricItem value={activity?.bundlesCreated || 0} label="Bundles" accent="bg-amber-500" />
                    <MetricItem value={activity?.seedsInBundles || 0} label="Seeds" accent="bg-orange-500" />
                  </div>
                  <div className="bg-amber-50/50 rounded-lg p-2.5 sm:p-3 border-l-2 sm:border-l-3 border-amber-400">
                    <p className="text-xs sm:text-sm text-gray-600">
                      <TrendingUp className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 mr-1" />
                      <strong className="text-amber-700">{avgSeedsPerBundle} seeds/bundle</strong> avg.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights */}
            <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-600"></div>
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6">
                <CardTitle className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg">
                    <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                  </div>
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  {Number(accountLinkRate) > 70 && (
                    <div className="flex gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">1</div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">Activation Rising</div>
                        <div className="text-xs sm:text-sm text-gray-600 line-clamp-2">High activation rate shows product-market fit.</div>
                      </div>
                    </div>
                  )}
                  {(activity?.usersWithChats || 0) > 100 && (
                    <div className="flex gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">2</div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">Chat Core Workflow</div>
                        <div className="text-xs sm:text-sm text-gray-600 line-clamp-2">{activity?.usersWithChats.toLocaleString()}+ active chatters.</div>
                      </div>
                    </div>
                  )}
                  {(activity?.chunksGenerated || 0) > 1000 && (
                    <div className="flex gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-teal-50 to-transparent rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">3</div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">Knowledge Growing</div>
                        <div className="text-xs sm:text-sm text-gray-600 line-clamp-2">{(activity?.chunksGenerated || 0) > 1000000 ? '1M+' : activity?.chunksGenerated.toLocaleString()} chunks generated.</div>
                      </div>
                    </div>
                  )}
                  {(activity?.bundlesCreated || 0) > 10 && (
                    <div className="flex gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">4</div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">Organization Growing</div>
                        <div className="text-xs sm:text-sm text-gray-600 line-clamp-2">Users organizing for reuse.</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bottom Row: Subscriptions + Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
              {/* Subscriptions */}
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6">
                  <CardTitle className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg">
                      <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                    </div>
                    Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Basic Plan</span>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-gray-900">{stats?.subscriptions.basic || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-500"></div>
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Pro Plan</span>
                      </div>
                      <span className="text-base sm:text-lg font-bold text-gray-900">{stats?.subscriptions.pro || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                          <span className="text-white text-[8px] sm:text-xs">$</span>
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-gray-800">Total Paid</span>
                      </div>
                      <span className="text-xl sm:text-2xl font-bold text-green-600">{totalPaidSubscriptions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-slate-400 to-gray-400"></div>
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 md:px-6">
                  <CardTitle className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg">
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                    </div>
                    Auto-Generated Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                  <div className="space-y-2 sm:space-y-3">
                    {totalPaidSubscriptions > 0 && (
                      <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-green-50/50 rounded-lg">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-gray-700">
                          <strong className="text-green-700">{totalPaidSubscriptions}</strong> paid subscriber{totalPaidSubscriptions > 1 ? 's' : ''}.
                        </span>
                      </div>
                    )}
                    {(activity?.usersSignedUp || 0) > 0 && (activity?.usersWithChats || 0) > 0 && (
                      <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-purple-50/50 rounded-lg">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-gray-700">
                          <strong className="text-purple-700">{chatEngagementRate}%</strong> chat engagement.
                        </span>
                      </div>
                    )}
                    {(activity?.seedsAdded || 0) > 0 && (activity?.bundlesCreated || 0) > 0 && (
                      <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-amber-50/50 rounded-lg">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-gray-700">
                          <strong className="text-amber-700">{((activity!.seedsInBundles / activity!.seedsAdded) * 100).toFixed(0)}%</strong> seeds bundled.
                        </span>
                      </div>
                    )}
                    {(activity?.chunksGenerated || 0) > 0 && (activity?.seedsAdded || 0) > 0 && (
                      <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-teal-50/50 rounded-lg">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-gray-700">
                          <strong className="text-teal-700">{avgChunksPerSeed}</strong> chunks/seed avg.
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
