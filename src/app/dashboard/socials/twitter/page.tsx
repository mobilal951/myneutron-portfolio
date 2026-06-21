"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Twitter,
  Users,
  Heart,
  Repeat,
  MessageCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  FileText,
  TrendingUp,
  Bookmark,
  Quote,
  Award,
  BarChart3,
} from "lucide-react";

interface TwitterProfile {
  id: string;
  name: string;
  username: string;
  profileImageUrl: string;
  description: string;
  verified: boolean;
  verifiedType: string;
  createdAt: string;
  location: string;
  url: string;
  publicMetrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
}

interface TweetMetrics {
  totalTweets: number;
  totalLikes: number;
  totalRetweets: number;
  totalReplies: number;
  totalQuotes: number;
  totalBookmarks: number;
  totalImpressions: number;
  avgLikesPerTweet: number;
  avgRetweetsPerTweet: number;
  avgRepliesPerTweet: number;
  engagementRate: number;
}

interface Tweet {
  id: string;
  text: string;
  createdAt: string;
  metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    quote_count: number;
    bookmark_count: number;
    impression_count: number;
  };
}

interface TwitterData {
  profile: TwitterProfile;
  tweetMetrics: TweetMetrics;
  recentTweets: Tweet[];
  bestTweet: Tweet | null;
  connected: boolean;
  dataSource: string;
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
    year: "numeric",
  });
}

function TwitterPageContent() {
  const searchParams = useSearchParams();
  const { dateRange, getDateParams } = useDashboard();
  const [data, setData] = useState<TwitterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const initialFetchDone = useRef(false);
  const prevDateRange = useRef(dateRange);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setNeedsAuth(false);

    try {
      const { startDate, endDate } = getDateParams();
      const params = new URLSearchParams();
      if (startDate && startDate !== "30daysAgo") params.set("startDate", startDate);
      if (endDate && endDate !== "today") params.set("endDate", endDate);

      const response = await fetch(`/api/twitter?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        if (result.needsAuth) {
          setNeedsAuth(true);
        }
        throw new Error(result.error || "Failed to fetch Twitter data");
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
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setLoading(false);
    } else {
      fetchData();
    }
    initialFetchDone.current = true;
  }, []);

  // Refetch when global date range changes (but not on initial mount)
  useEffect(() => {
    if (!initialFetchDone.current) return;

    // Check if date range actually changed
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

  const handleConnect = () => {
    window.location.href = "/api/twitter/auth";
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="Twitter / X" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-black" />
            <p className="text-muted-foreground">Loading X data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || needsAuth) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="Twitter / X" />
        <div className="flex-1 p-3 sm:p-4 md:p-6">
          <Card className="border-slate-300 bg-slate-50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-8">
                <div className="p-4 rounded-full bg-black mb-4">
                  {needsAuth ? (
                    <Twitter className="h-8 w-8 text-white" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-white" />
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {needsAuth ? "Connect X / Twitter" : "Error Loading Data"}
                </h2>
                <p className="text-muted-foreground max-w-md mb-6">{error}</p>

                {needsAuth ? (
                  <Button className="bg-black hover:bg-gray-800" onClick={handleConnect}>
                    <Twitter className="h-4 w-4 mr-2" />
                    Connect X / Twitter
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => fetchData(false)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Button className="bg-black hover:bg-gray-800" onClick={handleConnect}>
                      <Twitter className="h-4 w-4 mr-2" />
                      Reconnect X
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, tweetMetrics, bestTweet, dataSource } = data;
  const totalEngagements = tweetMetrics.totalLikes + tweetMetrics.totalRetweets + tweetMetrics.totalReplies + tweetMetrics.totalQuotes;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Twitter / X" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        {/* Profile Card */}
        <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl.replace("_normal", "_400x400")}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full border-2 border-slate-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center">
                  <Twitter className="h-8 w-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {profile.name}
                  {profile.verified && (
                    <span className="text-blue-500 text-sm">✓</span>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
            {profile.description && (
              <p className="mt-4 text-sm text-muted-foreground">{profile.description}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">{dataSource}</p>
          </CardContent>
        </Card>

        {/* Main Stats Grid - Similar to screenshot */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Followers</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(profile.publicMetrics.followers_count)}</p>
              <p className="text-xs text-muted-foreground">/ {formatNumber(profile.publicMetrics.following_count)} following</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Engagement Rate</span>
              </div>
              <p className="text-2xl font-bold">{tweetMetrics.engagementRate.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground">per tweet avg</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Engagements</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(totalEngagements)}</p>
              <p className="text-xs text-muted-foreground">last {tweetMetrics.totalTweets} tweets</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="text-xs text-muted-foreground">Total Posts</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(profile.publicMetrics.tweet_count)}</p>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Listed</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(profile.publicMetrics.listed_count)}</p>
              <p className="text-xs text-muted-foreground">lists</p>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="bg-white">
            <CardContent className="pt-4 pb-4 text-center">
              <Heart className="h-5 w-5 text-red-500 mx-auto mb-2" />
              <p className="text-xl font-bold">{formatNumber(tweetMetrics.totalLikes)}</p>
              <p className="text-xs text-muted-foreground">Likes</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4 text-center">
              <Repeat className="h-5 w-5 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold">{formatNumber(tweetMetrics.totalRetweets)}</p>
              <p className="text-xs text-muted-foreground">Reposts</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4 text-center">
              <MessageCircle className="h-5 w-5 text-blue-500 mx-auto mb-2" />
              <p className="text-xl font-bold">{formatNumber(tweetMetrics.totalReplies)}</p>
              <p className="text-xs text-muted-foreground">Replies</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4 text-center">
              <Quote className="h-5 w-5 text-purple-500 mx-auto mb-2" />
              <p className="text-xl font-bold">{formatNumber(tweetMetrics.totalQuotes)}</p>
              <p className="text-xs text-muted-foreground">Quotes</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4 text-center">
              <Bookmark className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
              <p className="text-xl font-bold">{formatNumber(tweetMetrics.totalBookmarks)}</p>
              <p className="text-xs text-muted-foreground">Bookmarks</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="pt-4 pb-4 text-center">
              <TrendingUp className="h-5 w-5 text-cyan-500 mx-auto mb-2" />
              <p className="text-xl font-bold">{formatNumber(tweetMetrics.totalImpressions)}</p>
              <p className="text-xs text-muted-foreground">Impressions</p>
            </CardContent>
          </Card>
        </div>

        {/* Best Performing Tweet */}
        {bestTweet && (
          <Card className="bg-gradient-to-r from-amber-50 to-white border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Best Performing Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3 line-clamp-3">{bestTweet.text}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  {formatNumber(bestTweet.metrics?.like_count || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <Repeat className="h-4 w-4 text-green-500" />
                  {formatNumber(bestTweet.metrics?.retweet_count || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  {formatNumber(bestTweet.metrics?.reply_count || 0)}
                </span>
                {bestTweet.metrics?.impression_count > 0 && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    {formatNumber(bestTweet.metrics.impression_count)} impressions
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Posted {formatDate(bestTweet.createdAt)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Averages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Per Tweet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xl font-bold">{tweetMetrics.avgLikesPerTweet}</p>
                <p className="text-xs text-muted-foreground">Avg Likes</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xl font-bold">{tweetMetrics.avgRetweetsPerTweet}</p>
                <p className="text-xs text-muted-foreground">Avg Reposts</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xl font-bold">{tweetMetrics.avgRepliesPerTweet}</p>
                <p className="text-xs text-muted-foreground">Avg Replies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TwitterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
          <Header title="Twitter / X" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-black" />
              <p className="text-muted-foreground">Loading X data...</p>
            </div>
          </div>
        </div>
      }
    >
      <TwitterPageContent />
    </Suspense>
  );
}
