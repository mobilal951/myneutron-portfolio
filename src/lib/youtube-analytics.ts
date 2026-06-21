const YT_ANALYTICS_API = "https://youtubeanalytics.googleapis.com/v2";
const YT_DATA_API = "https://www.googleapis.com/youtube/v3";

// myNeutron YouTube Channel ID
const YOUTUBE_CHANNEL_ID = "UCeSYXvqBe0UmrUPxaU5egTQ";

export interface YouTubeChannel {
  id: string;
  title: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

export interface YouTubeAnalytics {
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

export interface YouTubeDailyData {
  date: string;
  views: number;
  estimatedMinutesWatched: number;
  likes: number;
  subscribersGained: number;
  subscribersLost: number;
}

export interface YouTubeTopVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
}

export class YouTubeAnalyticsClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Get the myNeutron channel info
  async getMyChannel(): Promise<YouTubeChannel | null> {
    const response = await fetch(
      `${YT_DATA_API}/channels?part=snippet,statistics&id=${YOUTUBE_CHANNEL_ID}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch channel data");
    }

    const data = await response.json();
    const channel = data.items?.[0];

    if (!channel) {
      return null;
    }

    return {
      id: channel.id,
      title: channel.snippet.title,
      thumbnail: channel.snippet.thumbnails?.default?.url || "",
      subscriberCount: parseInt(channel.statistics.subscriberCount || "0"),
      videoCount: parseInt(channel.statistics.videoCount || "0"),
      viewCount: parseInt(channel.statistics.viewCount || "0"),
    };
  }

  // Get analytics overview for a date range
  async getAnalyticsOverview(startDate: string, endDate: string): Promise<YouTubeAnalytics> {
    const params = new URLSearchParams({
      ids: `channel==${YOUTUBE_CHANNEL_ID}`,
      startDate,
      endDate,
      metrics: "views,estimatedMinutesWatched,averageViewDuration,likes,dislikes,comments,shares,subscribersGained,subscribersLost",
    });

    const response = await fetch(`${YT_ANALYTICS_API}/reports?${params}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch analytics data");
    }

    const data = await response.json();
    const row = data.rows?.[0] || [];

    return {
      views: row[0] || 0,
      estimatedMinutesWatched: row[1] || 0,
      averageViewDuration: row[2] || 0,
      likes: row[3] || 0,
      dislikes: row[4] || 0,
      comments: row[5] || 0,
      shares: row[6] || 0,
      subscribersGained: row[7] || 0,
      subscribersLost: row[8] || 0,
      netSubscribers: (row[7] || 0) - (row[8] || 0),
    };
  }

  // Get daily analytics data
  async getDailyAnalytics(startDate: string, endDate: string): Promise<YouTubeDailyData[]> {
    const params = new URLSearchParams({
      ids: `channel==${YOUTUBE_CHANNEL_ID}`,
      startDate,
      endDate,
      metrics: "views,estimatedMinutesWatched,likes,subscribersGained,subscribersLost",
      dimensions: "day",
      sort: "day",
    });

    const response = await fetch(`${YT_ANALYTICS_API}/reports?${params}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch daily analytics");
    }

    const data = await response.json();

    return (data.rows || []).map((row: any[]) => ({
      date: row[0],
      views: row[1] || 0,
      estimatedMinutesWatched: row[2] || 0,
      likes: row[3] || 0,
      subscribersGained: row[4] || 0,
      subscribersLost: row[5] || 0,
    }));
  }

  // Get top videos by views
  async getTopVideos(startDate: string, endDate: string, limit = 10): Promise<YouTubeTopVideo[]> {
    // First get video IDs from analytics
    const params = new URLSearchParams({
      ids: `channel==${YOUTUBE_CHANNEL_ID}`,
      startDate,
      endDate,
      metrics: "views,likes,comments",
      dimensions: "video",
      sort: "-views",
      maxResults: limit.toString(),
    });

    const analyticsResponse = await fetch(`${YT_ANALYTICS_API}/reports?${params}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!analyticsResponse.ok) {
      const error = await analyticsResponse.json();
      throw new Error(error.error?.message || "Failed to fetch top videos");
    }

    const analyticsData = await analyticsResponse.json();
    const videoRows = analyticsData.rows || [];

    if (videoRows.length === 0) {
      return [];
    }

    // Get video details (titles, thumbnails)
    const videoIds = videoRows.map((row: any[]) => row[0]).join(",");
    const videosResponse = await fetch(
      `${YT_DATA_API}/videos?part=snippet&id=${videoIds}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!videosResponse.ok) {
      // Return basic data without titles if video details fail
      return videoRows.map((row: any[]) => ({
        videoId: row[0],
        title: row[0],
        thumbnail: "",
        views: row[1] || 0,
        likes: row[2] || 0,
        comments: row[3] || 0,
      }));
    }

    const videosData = await videosResponse.json();
    const videoDetails = new Map<string, { title: string; thumbnail: string }>();

    for (const video of videosData.items || []) {
      videoDetails.set(video.id, {
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url || "",
      });
    }

    return videoRows.map((row: any[]) => {
      const details = videoDetails.get(row[0]) || { title: row[0], thumbnail: "" };
      return {
        videoId: row[0],
        title: details.title,
        thumbnail: details.thumbnail,
        views: row[1] || 0,
        likes: row[2] || 0,
        comments: row[3] || 0,
      };
    });
  }

  // Get traffic sources
  async getTrafficSources(startDate: string, endDate: string) {
    const params = new URLSearchParams({
      ids: `channel==${YOUTUBE_CHANNEL_ID}`,
      startDate,
      endDate,
      metrics: "views,estimatedMinutesWatched",
      dimensions: "insightTrafficSourceType",
      sort: "-views",
    });

    const response = await fetch(`${YT_ANALYTICS_API}/reports?${params}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch traffic sources");
    }

    const data = await response.json();

    return (data.rows || []).map((row: any[]) => ({
      source: formatTrafficSource(row[0]),
      views: row[1] || 0,
      watchTimeMinutes: row[2] || 0,
    }));
  }
}

// Helper to format traffic source names
function formatTrafficSource(source: string): string {
  const sourceMap: Record<string, string> = {
    EXT_URL: "External",
    RELATED_VIDEO: "Suggested Videos",
    YT_SEARCH: "YouTube Search",
    YT_CHANNEL: "Channel Page",
    NOTIFICATION: "Notifications",
    PLAYLIST: "Playlists",
    YT_OTHER_PAGE: "Other YouTube",
    NO_LINK_OTHER: "Direct/Unknown",
    SUBSCRIBER: "Subscribers",
    END_SCREEN: "End Screens",
    ANNOTATION: "Cards",
    CAMPAIGN_CARD: "Campaign Cards",
    VIDEO_REMIXES: "Remixes",
    SHORTS: "Shorts Feed",
  };
  return sourceMap[source] || source;
}

// Helper to format date for YouTube API (YYYY-MM-DD)
export function formatYouTubeDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Get date range for YouTube API
export function getYouTubeDateRange(daysAgo: number = 30): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  return {
    startDate: formatYouTubeDate(startDate),
    endDate: formatYouTubeDate(endDate),
  };
}
