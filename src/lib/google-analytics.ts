const GA_API_BASE = "https://analyticsdata.googleapis.com/v1beta";

export interface GAMetric {
  name: string;
  value: string;
}

export interface GADimension {
  name: string;
  value: string;
}

export interface GARow {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}

export interface GAResponse {
  rows?: GARow[];
  totals?: GARow[];
  rowCount?: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export class GoogleAnalyticsClient {
  private accessToken: string;
  private propertyId: string;

  constructor(accessToken: string, propertyId: string) {
    this.accessToken = accessToken;
    this.propertyId = propertyId;
  }

  private async runReport(body: object): Promise<GAResponse> {
    const response = await fetch(
      `${GA_API_BASE}/${this.propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to fetch GA data");
    }

    return response.json();
  }

  // Get total visitors and sessions
  async getTrafficOverview(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "newUsers" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    });

    const values = response.rows?.[0]?.metricValues || [];
    return {
      activeUsers: parseInt(values[0]?.value || "0"),
      sessions: parseInt(values[1]?.value || "0"),
      pageViews: parseInt(values[2]?.value || "0"),
      newUsers: parseInt(values[3]?.value || "0"),
      avgSessionDuration: parseFloat(values[4]?.value || "0"),
      bounceRate: parseFloat(values[5]?.value || "0"),
    };
  }

  // Get traffic by day for charts
  async getTrafficByDay(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "newUsers" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    return (response.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      activeUsers: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      newUsers: parseInt(row.metricValues?.[2]?.value || "0"),
    }));
  }

  // Get traffic by country
  async getTrafficByCountry(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      country: row.dimensionValues?.[0]?.value || "Unknown",
      activeUsers: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  // Get demographics - age
  async getDemographicsAge(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "userAgeBracket" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "userAgeBracket" } }],
    });

    return (response.rows || []).map((row) => ({
      ageGroup: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));
  }

  // Get demographics - gender
  async getDemographicsGender(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "userGender" }],
      metrics: [{ name: "activeUsers" }],
    });

    return (response.rows || []).map((row) => ({
      gender: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));
  }

  // Get device category breakdown
  async getDeviceCategory(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    });

    return (response.rows || []).map((row) => ({
      device: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));
  }

  // Get user interests
  async getUserInterests(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "brandingInterest" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      interest: row.dimensionValues?.[0]?.value || "Unknown",
      users: parseInt(row.metricValues?.[0]?.value || "0"),
    }));
  }

  // Get traffic sources / acquisition
  async getTrafficSources(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "newUsers" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      channel: row.dimensionValues?.[0]?.value || "Unknown",
      activeUsers: parseInt(row.metricValues?.[0]?.value || "0"),
      sessions: parseInt(row.metricValues?.[1]?.value || "0"),
      newUsers: parseInt(row.metricValues?.[2]?.value || "0"),
    }));
  }

  // Get top pages
  async getTopPages(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || "/",
      pageViews: parseInt(row.metricValues?.[0]?.value || "0"),
      users: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  // Get daily traffic with event counts for website traffic chart
  async getDailyWebsiteTraffic(dateRange: DateRange, ctaEventNames: string[] = ["click", "cta_click", "button_click"]) {
    // Get daily active users
    const trafficResponse = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    // Get daily CTA/click events
    const eventsResponse = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: {
            values: ctaEventNames,
          },
        },
      },
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    // Create a map of events by date
    const eventsByDate = new Map<string, number>();
    (eventsResponse.rows || []).forEach((row) => {
      const date = row.dimensionValues?.[0]?.value || "";
      const count = parseInt(row.metricValues?.[0]?.value || "0");
      eventsByDate.set(date, (eventsByDate.get(date) || 0) + count);
    });

    // Combine traffic and events data
    return (trafficResponse.rows || []).map((row) => {
      const date = row.dimensionValues?.[0]?.value || "";
      return {
        date,
        activeUsers: parseInt(row.metricValues?.[0]?.value || "0"),
        ctaClicks: eventsByDate.get(date) || 0,
      };
    });
  }

  // Get event counts for specific events
  async getEventCounts(dateRange: DateRange, eventNames: string[]) {
    // If no specific events, get all events
    const dimensionFilter = eventNames.length > 0
      ? {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: eventNames,
            },
          },
        }
      : undefined;

    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter,
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      limit: 100,
    });

    return (response.rows || []).map((row) => ({
      eventName: row.dimensionValues?.[0]?.value || "Unknown",
      eventCount: parseInt(row.metricValues?.[0]?.value || "0"),
    }));
  }

  // Get Google Ads overview metrics (via GA4 linked data)
  async getAdsOverview(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionCampaignName" }],
      metrics: [
        { name: "advertiserAdClicks" },
        { name: "advertiserAdCost" },
        { name: "advertiserAdImpressions" },
      ],
    });

    // Aggregate across all campaigns
    let clicks = 0, cost = 0, impressions = 0;
    for (const row of response.rows || []) {
      clicks += parseInt(row.metricValues?.[0]?.value || "0");
      cost += parseFloat(row.metricValues?.[1]?.value || "0");
      impressions += parseInt(row.metricValues?.[2]?.value || "0");
    }

    return {
      clicks,
      cost,
      impressions,
      cpc: clicks > 0 ? cost / clicks : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    };
  }

  // Get Google Ads spend and clicks by day (with campaign breakdown for filtering)
  async getAdsByDay(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }, { name: "sessionCampaignName" }],
      metrics: [
        { name: "advertiserAdClicks" },
        { name: "advertiserAdCost" },
        { name: "advertiserAdImpressions" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    // Return raw data with campaign names for client-side filtering
    return (response.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      campaign: row.dimensionValues?.[1]?.value || "(not set)",
      clicks: parseInt(row.metricValues?.[0]?.value || "0"),
      cost: parseFloat(row.metricValues?.[1]?.value || "0"),
      impressions: parseInt(row.metricValues?.[2]?.value || "0"),
    }));
  }

  // Get Google Ads campaign performance
  async getAdsCampaigns(dateRange: DateRange, limit = 10) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionCampaignName" }],
      metrics: [
        { name: "advertiserAdClicks" },
        { name: "advertiserAdCost" },
        { name: "advertiserAdImpressions" },
        { name: "sessions" },
      ],
      orderBys: [{ metric: { metricName: "advertiserAdCost" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => {
      const clicks = parseInt(row.metricValues?.[0]?.value || "0");
      const cost = parseFloat(row.metricValues?.[1]?.value || "0");
      const impressions = parseInt(row.metricValues?.[2]?.value || "0");
      const sessions = parseInt(row.metricValues?.[3]?.value || "0");

      return {
        campaign: row.dimensionValues?.[0]?.value || "(not set)",
        clicks,
        cost,
        impressions,
        conversions: sessions, // Using sessions as proxy for conversions from ads
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpc: clicks > 0 ? cost / clicks : 0,
      };
    });
  }

  // Get sessions from Google Ads (as conversion proxy)
  async getAdsConversions(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionCampaignName" }],
      metrics: [
        { name: "sessions" },
        { name: "advertiserAdCost" },
      ],
    });

    // Aggregate across all campaigns
    let sessions = 0, cost = 0;
    for (const row of response.rows || []) {
      sessions += parseInt(row.metricValues?.[0]?.value || "0");
      cost += parseFloat(row.metricValues?.[1]?.value || "0");
    }

    return {
      conversions: sessions,
      costPerConversion: sessions > 0 ? cost / sessions : 0,
    };
  }

  // Get sessions by day from Google Ads (with campaign breakdown for filtering)
  async getConversionsByDay(dateRange: DateRange) {
    const response = await this.runReport({
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }, { name: "sessionCampaignName" }],
      metrics: [
        { name: "sessions" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    // Return raw data with campaign names for client-side filtering
    return (response.rows || []).map((row) => ({
      date: row.dimensionValues?.[0]?.value || "",
      campaign: row.dimensionValues?.[1]?.value || "(not set)",
      conversions: parseInt(row.metricValues?.[0]?.value || "0"),
    }));
  }

  // List available GA4 properties for the user
  static async listProperties(accessToken: string) {
    const response = await fetch(
      "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to list properties");
    }

    const data = await response.json();
    const properties: { id: string; name: string; account: string }[] = [];

    for (const account of data.accountSummaries || []) {
      for (const property of account.propertySummaries || []) {
        properties.push({
          id: property.property,
          name: property.displayName,
          account: account.displayName,
        });
      }
    }

    return properties;
  }
}
