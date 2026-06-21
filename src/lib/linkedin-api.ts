const LINKEDIN_API = "https://api.linkedin.com/v2";

export interface LinkedInOrganization {
  id: string;
  name: string;
  logoUrl: string;
  followerCount: number;
}

export interface LinkedInPageStats {
  pageViews: number;
  uniqueVisitors: number;
  followers: number;
  newFollowers: number;
}

export interface LinkedInPostStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalImpressions: number;
  engagementRate: number;
}

export class LinkedInClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Get organizations the user is admin of
  async getMyOrganizations(): Promise<LinkedInOrganization[]> {
    const response = await fetch(
      `${LINKEDIN_API}/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalTarget~(id,localizedName,logoV2(original~:playableStreams))))`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch organizations");
    }

    const data = await response.json();
    const organizations: LinkedInOrganization[] = [];

    for (const element of data.elements || []) {
      const org = element["organizationalTarget~"];
      if (org) {
        organizations.push({
          id: org.id,
          name: org.localizedName,
          logoUrl: org.logoV2?.["original~"]?.elements?.[0]?.identifiers?.[0]?.identifier || "",
          followerCount: 0, // Will be fetched separately
        });
      }
    }

    return organizations;
  }

  // Get organization follower count
  async getOrganizationFollowers(organizationId: string): Promise<number> {
    const response = await fetch(
      `${LINKEDIN_API}/networkSizes/urn:li:organization:${organizationId}?edgeType=CompanyFollowedByMember`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch follower count");
      return 0;
    }

    const data = await response.json();
    return data.firstDegreeSize || 0;
  }

  // Get organization page statistics
  async getOrganizationPageStats(organizationId: string, startDate: string, endDate: string): Promise<LinkedInPageStats> {
    const timeRange = `(start:${new Date(startDate).getTime()},end:${new Date(endDate).getTime()})`;

    const response = await fetch(
      `${LINKEDIN_API}/organizationPageStatistics?q=organization&organization=urn:li:organization:${organizationId}&timeIntervals.timeGranularityType=DAY&timeIntervals.timeRange=${timeRange}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to fetch page stats:", error);
      return {
        pageViews: 0,
        uniqueVisitors: 0,
        followers: 0,
        newFollowers: 0,
      };
    }

    const data = await response.json();
    let pageViews = 0;
    let uniqueVisitors = 0;

    for (const element of data.elements || []) {
      pageViews += element.totalPageStatistics?.views?.allPageViews?.pageViews || 0;
      uniqueVisitors += element.totalPageStatistics?.views?.allPageViews?.uniquePageViews || 0;
    }

    const followers = await this.getOrganizationFollowers(organizationId);

    return {
      pageViews,
      uniqueVisitors,
      followers,
      newFollowers: 0, // Would need follower statistics API
    };
  }

  // Get share (post) statistics
  async getOrganizationShareStats(organizationId: string, startDate: string, endDate: string): Promise<LinkedInPostStats> {
    const timeRange = `(start:${new Date(startDate).getTime()},end:${new Date(endDate).getTime()})`;

    const response = await fetch(
      `${LINKEDIN_API}/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${organizationId}&timeIntervals.timeGranularityType=DAY&timeIntervals.timeRange=${timeRange}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to fetch share stats:", error);
      return {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalImpressions: 0,
        engagementRate: 0,
      };
    }

    const data = await response.json();
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalImpressions = 0;
    let totalPosts = 0;

    for (const element of data.elements || []) {
      const stats = element.totalShareStatistics || {};
      totalLikes += stats.likeCount || 0;
      totalComments += stats.commentCount || 0;
      totalShares += stats.shareCount || 0;
      totalImpressions += stats.impressionCount || 0;
      totalPosts += stats.shareCount || 0;
    }

    const totalEngagements = totalLikes + totalComments + totalShares;
    const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;

    return {
      totalPosts,
      totalLikes,
      totalComments,
      totalShares,
      totalImpressions,
      engagementRate,
    };
  }

  // Get follower demographics
  async getFollowerDemographics(organizationId: string) {
    const response = await fetch(
      `${LINKEDIN_API}/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${organizationId}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch follower demographics");
      return null;
    }

    return await response.json();
  }
}

// LinkedIn admin email
export const LINKEDIN_ADMIN_EMAIL = "shahrukh.ali@bigimmersive.com";

// Get date range for LinkedIn API
export function getLinkedInDateRange(daysAgo: number = 30): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}
