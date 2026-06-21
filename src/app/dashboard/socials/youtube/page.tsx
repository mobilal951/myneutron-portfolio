"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Youtube,
  Users,
  Eye,
  Clock,
  ThumbsUp,
  MessageSquare,
  Share2,
  TrendingUp,
  TrendingDown,
  Play,
  Loader2,
  AlertCircle,
  RefreshCw,
  LogIn,
} from "lucide-react";

const YOUTUBE_ADMIN_EMAIL = "social@vanarchain.com";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface YouTubeChannel {
  id: string;
  title: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

interface YouTubeAnalytics {
  views: number;
  estimatedMinutesWatched: number;
  averageViewDuration: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  subscribersGained: number;
  subscribersLost: number;
  netSubscribers: number;
}

interface YouTubeDailyData {
  date: string;
  views: number;
  estimatedMinutesWatched: number;
  likes: number;
  subscribersGained: number;
  subscribersLost: number;
}

interface YouTubeTopVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
}

interface TrafficSource {
  source: string;
  views: number;
  watchTimeMinutes: number;
  [key: string]: string | number;
}

interface YouTubeData {
  channel: YouTubeChannel | null;
  analytics: YouTubeAnalytics;
  dailyData: YouTubeDailyData[];
  topVideos: YouTubeTopVideo[];
  trafficSources: TrafficSource[];
  dateRange: { startDate: string; endDate: string };
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString();
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatWatchTime(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${formatNumber(hours)} hrs`;
  }
  return `${formatNumber(minutes)} min`;
}

export default function YouTubePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<YouTubeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);
  const [needsOwnerAuth, setNeedsOwnerAuth] = useState(false);
  const [saving, setSaving] = useState(false);

  const isYouTubeAdmin = session?.user?.email === YOUTUBE_ADMIN_EMAIL;

  const saveYouTubeCredentials = async () => {
    alert("Button clicked! Saving credentials...");

    console.log("Session data:", {
      hasAccessToken: !!session?.accessToken,
      hasRefreshToken: !!session?.refreshToken,
      expiresAt: session?.accessTokenExpires,
      email: session?.user?.email,
    });

    if (!session?.accessToken || !session?.refreshToken) {
      const errorMsg = `Session missing tokens (accessToken: ${!!session?.accessToken}, refreshToken: ${!!session?.refreshToken}). Please sign out completely and sign in again.`;
      alert(errorMsg);
      setError(errorMsg);
      return;
    }

    // Check if token is expired
    if (session.accessTokenExpires && Date.now() > session.accessTokenExpires) {
      const errorMsg = "Your session token has expired. Please sign out and sign in again to get a fresh token.";
      alert(errorMsg);
      setError(errorMsg);
      return;
    }

    setSaving(true);
    try {
      console.log("Posting to /api/youtube/credentials...");
      const response = await fetch("/api/youtube/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresAt: session.accessTokenExpires,
        }),
      });

      const result = await response.json();
      console.log("Response:", response.status, result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to save credentials");
      }

      alert("Credentials saved successfully! Fetching YouTube data...");

      // Credentials saved, now fetch data
      setNeedsOwnerAuth(false);
      setError(null);
      fetchData();
    } catch (err: any) {
      console.error("Error saving credentials:", err);
      alert("Error: " + err.message);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setNeedsOwnerAuth(false);
    try {
      const response = await fetch("/api/youtube");
      const result = await response.json();

      if (!response.ok) {
        if (result.needsSetup) {
          setNeedsSetup(true);
        } else if (result.needsOwnerAuth) {
          setNeedsOwnerAuth(true);
        } else if (result.needsReauth) {
          setNeedsReauth(true);
        }
        throw new Error(result.error || "Failed to fetch YouTube data");
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
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="YouTube" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-muted-foreground">Loading YouTube Analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="YouTube" />
        <div className="flex-1 p-3 sm:p-4 md:p-6">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-8">
                <div className="p-4 rounded-full bg-red-100 mb-4">
                  {needsOwnerAuth ? (
                    <Youtube className="h-8 w-8 text-red-600" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {needsSetup
                    ? "YouTube API Not Enabled"
                    : needsOwnerAuth
                    ? "YouTube Not Connected"
                    : needsReauth
                    ? "Authentication Required"
                    : "Error Loading Data"}
                </h2>
                <p className="text-muted-foreground max-w-md mb-6">{error}</p>

                {/* YouTube owner needs to connect */}
                {needsOwnerAuth && (
                  <div className="space-y-4">
                    {isYouTubeAdmin ? (
                      <>
                        <p className="text-sm text-green-600 font-medium">
                          You are signed in as the YouTube channel owner!
                        </p>
                        <Button
                          className="bg-red-600 hover:bg-red-700"
                          onClick={saveYouTubeCredentials}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Youtube className="h-4 w-4 mr-2" />
                          )}
                          {saving ? "Connecting..." : "Connect YouTube Analytics"}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Token status: {session?.accessToken ? "Present" : "Missing"} |
                          Refresh: {session?.refreshToken ? "Present" : "Missing"} |
                          Expires: {session?.accessTokenExpires ? new Date(session.accessTokenExpires).toLocaleString() : "Unknown"}
                        </p>
                      </>
                    ) : (
                      <div className="text-sm bg-white p-4 rounded-lg border max-w-lg">
                        <p className="font-medium mb-2">To connect YouTube Analytics:</p>
                        <p className="text-muted-foreground text-left mb-4">
                          The YouTube channel owner (<strong>{YOUTUBE_ADMIN_EMAIL}</strong>) needs to sign in and connect the channel.
                        </p>
                        {session?.user?.email ? (
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">
                              Currently signed in as: {session.user.email}
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => window.location.href = "/api/auth/signout?callbackUrl=/dashboard/socials/youtube"}
                            >
                              <LogIn className="h-4 w-4 mr-2" />
                              Sign out to switch account
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => window.location.href = "/api/auth/signin?callbackUrl=/dashboard/socials/youtube"}
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign in as {YOUTUBE_ADMIN_EMAIL}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {needsSetup && (
                  <div className="text-sm text-left bg-white p-4 rounded-lg border mb-4 max-w-lg">
                    <p className="font-medium mb-2">To enable YouTube Analytics:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Go to Google Cloud Console</li>
                      <li>Enable "YouTube Analytics API"</li>
                      <li>Enable "YouTube Data API v3"</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                )}
                {needsReauth && (
                  <div className="space-y-4">
                    {isYouTubeAdmin ? (
                      <>
                        <p className="text-sm text-green-600 font-medium">
                          You are signed in as the YouTube channel owner!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Your current credentials may be outdated. Click below to reconnect.
                        </p>
                        <Button
                          className="bg-red-600 hover:bg-red-700"
                          onClick={saveYouTubeCredentials}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Youtube className="h-4 w-4 mr-2" />
                          )}
                          {saving ? "Reconnecting..." : "Reconnect YouTube Analytics"}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Token status: {session?.accessToken ? "Present" : "Missing"} |
                          Refresh: {session?.refreshToken ? "Present" : "Missing"} |
                          Expires: {session?.accessTokenExpires ? new Date(session.accessTokenExpires).toLocaleString() : "Unknown"}
                        </p>
                      </>
                    ) : (
                      <div className="text-sm bg-white p-4 rounded-lg border max-w-lg">
                        <p className="font-medium mb-2">YouTube credentials need to be updated:</p>
                        <p className="text-muted-foreground text-left mb-4">
                          The YouTube channel owner (<strong>{YOUTUBE_ADMIN_EMAIL}</strong>) needs to sign in and reconnect.
                        </p>
                        {session?.user?.email ? (
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">
                              Currently signed in as: {session.user.email}
                            </p>
                            <Button
                              variant="outline"
                              onClick={() => window.location.href = "/api/auth/signout?callbackUrl=/dashboard/socials/youtube"}
                            >
                              <LogIn className="h-4 w-4 mr-2" />
                              Sign out to switch account
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => window.location.href = "/api/auth/signin?callbackUrl=/dashboard/socials/youtube"}
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign in as {YOUTUBE_ADMIN_EMAIL}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {!needsSetup && !needsReauth && !needsOwnerAuth && (
                  <Button variant="outline" onClick={fetchData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { channel, analytics, dailyData, topVideos, trafficSources } = data;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="YouTube" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        {/* Channel Info */}
        {channel && (
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {channel.thumbnail && (
                  <img
                    src={channel.thumbnail}
                    alt={channel.title}
                    className="w-16 h-16 rounded-full border-2 border-red-200"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                    {channel.title}
                  </h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {formatNumber(channel.subscriberCount)} subscribers
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      {formatNumber(channel.videoCount)} videos
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {formatNumber(channel.viewCount)} total views
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="h-4 w-4 text-red-600" /> Views (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNumber(analytics.views)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" /> Watch Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatWatchTime(analytics.estimatedMinutesWatched)}</p>
              <p className="text-xs text-muted-foreground">Avg: {formatDuration(analytics.averageViewDuration)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-600" /> Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNumber(analytics.likes)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                {analytics.netSubscribers >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                Net Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${analytics.netSubscribers >= 0 ? "text-green-600" : "text-red-600"}`}>
                {analytics.netSubscribers >= 0 ? "+" : ""}{formatNumber(analytics.netSubscribers)}
              </p>
              <p className="text-xs text-muted-foreground">
                +{formatNumber(analytics.subscribersGained)} / -{formatNumber(analytics.subscribersLost)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-600" /> Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatNumber(analytics.comments)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Share2 className="h-4 w-4 text-orange-600" /> Shares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatNumber(analytics.shares)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" /> Dislikes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatNumber(analytics.dislikes)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Views Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Views Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip
                      formatter={(value) => [formatNumber(value as number), "Views"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="views" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Watch Time Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Watch Time (Minutes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatNumber(value)} />
                    <Tooltip
                      formatter={(value) => [formatNumber(value as number) + " min", "Watch Time"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Bar dataKey="estimatedMinutesWatched" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Sources and Top Videos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficSources.slice(0, 8)}
                      dataKey="views"
                      nameKey="source"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={false}
                    >
                      {trafficSources.slice(0, 8).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-1/2 space-y-2 text-sm">
                  {trafficSources.slice(0, 6).map((source, index) => (
                    <div key={source.source} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="flex-1 truncate">{source.source}</span>
                      <span className="text-muted-foreground">{formatNumber(source.views)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Videos (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-auto">
                {topVideos.map((video, index) => (
                  <div key={video.videoId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-24 h-14 object-cover rounded"
                      />
                    ) : (
                      <div className="w-24 h-14 bg-gray-200 rounded flex items-center justify-center">
                        <Play className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{video.title}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {formatNumber(video.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> {formatNumber(video.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {formatNumber(video.comments)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {topVideos.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No video data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
