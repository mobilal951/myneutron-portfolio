"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Header } from "@/components/dashboard/header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DollarSign, MousePointerClick, Target, TrendingDown, Filter, Check, X } from "lucide-react";

interface AdsOverview {
  clicks: number;
  cost: number;
  impressions: number;
  cpc: number;
  ctr: number;
  conversions: number;
  costPerConversion: number;
}

interface DailyData {
  date: string;
  campaign: string;
  clicks: number;
  cost: number;
  impressions: number;
  conversions: number;
}

interface CampaignData {
  campaign: string;
  clicks: number;
  cost: number;
  impressions: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

export default function AdsOverviewPage() {
  const {
    selectedProperty,
    getDateParams,
    loading: contextLoading,
    isDemoMode,
    refreshKey,
    setLastUpdated,
    setRefreshing,
  } = useDashboard();

  const [overview, setOverview] = useState<AdsOverview | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!selectedProperty || contextLoading) return;

      setLoading(true);
      setError(null);

      if (isDemoMode) {
        // Demo data for when GA is not connected
        const mockOverview: AdsOverview = {
          clicks: 12543,
          cost: 4523.67,
          impressions: 543210,
          cpc: 0.36,
          ctr: 2.31,
          conversions: 876,
          costPerConversion: 5.16,
        };

        const mockCampaignNames = ["Brand Awareness", "Product Launch", "Retargeting", "Competitor Keywords", "Display Network"];
        const mockDailyData: DailyData[] = [];
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
          // Add data for each campaign per day
          mockCampaignNames.forEach((campaign) => {
            mockDailyData.push({
              date: dateStr,
              campaign,
              clicks: Math.floor(50 + Math.random() * 50),
              cost: Math.floor(20 + Math.random() * 30),
              impressions: Math.floor(3000 + Math.random() * 2000),
              conversions: Math.floor(5 + Math.random() * 10),
            });
          });
        }

        const mockCampaigns: CampaignData[] = [
          { campaign: "Brand Awareness", clicks: 4532, cost: 1234.56, impressions: 234567, conversions: 345, ctr: 1.93, cpc: 0.27 },
          { campaign: "Product Launch", clicks: 3210, cost: 1567.89, impressions: 156789, conversions: 234, ctr: 2.05, cpc: 0.49 },
          { campaign: "Retargeting", clicks: 2876, cost: 876.54, impressions: 98765, conversions: 187, ctr: 2.91, cpc: 0.30 },
          { campaign: "Competitor Keywords", clicks: 1234, cost: 543.21, impressions: 54321, conversions: 76, ctr: 2.27, cpc: 0.44 },
          { campaign: "Display Network", clicks: 691, cost: 301.47, impressions: 89012, conversions: 34, ctr: 0.78, cpc: 0.44 },
        ];

        await new Promise((resolve) => setTimeout(resolve, 500));
        setOverview(mockOverview);
        setDailyData(mockDailyData);
        setCampaigns(mockCampaigns);
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
        const response = await fetch(`/api/ga/ads?${params}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setOverview(data.overview);
        setDailyData(data.dailyData);
        setCampaigns(data.campaigns);
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

  // Get unique campaign names for filter
  const availableCampaigns = useMemo(() => {
    return campaigns
      .map((c) => c.campaign)
      .filter((name) => name && name !== "(not set)");
  }, [campaigns]);

  // Filter campaigns based on selection
  const filteredCampaigns = useMemo(() => {
    if (selectedCampaigns.length === 0) return campaigns;
    return campaigns.filter((c) => selectedCampaigns.includes(c.campaign));
  }, [campaigns, selectedCampaigns]);

  // Calculate filtered overview stats
  const filteredOverview = useMemo(() => {
    if (selectedCampaigns.length === 0 || !overview) return overview;

    const filtered = filteredCampaigns.reduce(
      (acc, c) => ({
        clicks: acc.clicks + c.clicks,
        cost: acc.cost + c.cost,
        impressions: acc.impressions + c.impressions,
        conversions: acc.conversions + c.conversions,
      }),
      { clicks: 0, cost: 0, impressions: 0, conversions: 0 }
    );

    return {
      ...filtered,
      cpc: filtered.clicks > 0 ? filtered.cost / filtered.clicks : 0,
      ctr: filtered.impressions > 0 ? (filtered.clicks / filtered.impressions) * 100 : 0,
      costPerConversion: filtered.conversions > 0 ? filtered.cost / filtered.conversions : 0,
    };
  }, [overview, filteredCampaigns, selectedCampaigns]);

  // Toggle campaign selection
  const toggleCampaign = (campaign: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(campaign)
        ? prev.filter((c) => c !== campaign)
        : [...prev, campaign]
    );
  };

  // Select all campaigns
  const selectAllCampaigns = () => {
    setSelectedCampaigns(availableCampaigns);
  };

  // Clear all selections
  const clearAllCampaigns = () => {
    setSelectedCampaigns([]);
  };

  // Filter and aggregate daily data for charts
  const filteredChartData = useMemo(() => {
    // Filter by selected campaigns if any
    const filtered = selectedCampaigns.length === 0
      ? dailyData
      : dailyData.filter((d) => selectedCampaigns.includes(d.campaign));

    // Aggregate by date
    const byDate = new Map<string, { clicks: number; cost: number; impressions: number; conversions: number }>();
    for (const row of filtered) {
      const existing = byDate.get(row.date) || { clicks: 0, cost: 0, impressions: 0, conversions: 0 };
      existing.clicks += row.clicks;
      existing.cost += row.cost;
      existing.impressions += row.impressions;
      existing.conversions += row.conversions;
      byDate.set(row.date, existing);
    }

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        ...data,
      }));
  }, [dailyData, selectedCampaigns]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Format date for chart
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${month}/${day}`;
  };

  // Chart data with formatted dates (using filtered data)
  const chartData = filteredChartData.map((d) => ({
    ...d,
    formattedDate: formatDate(d.date),
  }));

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Ads Overview" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 overflow-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Campaign Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2"
                disabled={isLoading || availableCampaigns.length === 0}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter Campaigns</span>
                <span className="sm:hidden">Filter</span>
                {selectedCampaigns.length > 0 && (
                  <span className="ml-1 rounded-full bg-blue-500 text-white px-2 py-0.5 text-xs">
                    {selectedCampaigns.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Select Campaigns</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllCampaigns}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearAllCampaigns}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {availableCampaigns.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">No campaigns available</p>
                ) : (
                  availableCampaigns.map((campaign) => (
                    <button
                      key={campaign}
                      onClick={() => toggleCampaign(campaign)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-left text-sm"
                    >
                      <div
                        className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${
                          selectedCampaigns.includes(campaign)
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedCampaigns.includes(campaign) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="truncate">{campaign}</span>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Selected campaigns tags */}
          {selectedCampaigns.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {selectedCampaigns.slice(0, 3).map((campaign) => (
                <span
                  key={campaign}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  <span className="truncate max-w-[100px]">{campaign}</span>
                  <button
                    onClick={() => toggleCampaign(campaign)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {selectedCampaigns.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{selectedCampaigns.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <KPICard
            title="Total Spend"
            value={filteredOverview ? formatCurrency(filteredOverview.cost) : "$0"}
            subtitle="Ad spend"
            icon={DollarSign}
            loading={isLoading}
          />
          <KPICard
            title="Clicks"
            value={filteredOverview?.clicks || 0}
            subtitle={`CTR: ${filteredOverview?.ctr.toFixed(2) || 0}%`}
            icon={MousePointerClick}
            loading={isLoading}
          />
          <KPICard
            title="Conversions"
            value={filteredOverview?.conversions || 0}
            subtitle="Total conversions"
            icon={Target}
            loading={isLoading}
          />
          <KPICard
            title="Cost / Conversion"
            value={filteredOverview ? formatCurrency(filteredOverview.costPerConversion) : "$0"}
            subtitle={`CPC: ${formatCurrency(filteredOverview?.cpc || 0)}`}
            icon={TrendingDown}
            loading={isLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Spend Over Time */}
          <Card className="shadow-sm">
            <CardHeader className="px-3 sm:px-4 md:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">
                Spend Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-3 md:px-6">
              {isLoading ? (
                <Skeleton className="h-[200px] sm:h-[250px] md:h-[300px] w-full" />
              ) : (
                <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="formattedDate"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [formatCurrency(value as number), "Spend"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorCost)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversions Over Time */}
          <Card className="shadow-sm">
            <CardHeader className="px-3 sm:px-4 md:px-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">
                Conversions Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-3 md:px-6">
              {isLoading ? (
                <Skeleton className="h-[200px] sm:h-[250px] md:h-[300px] w-full" />
              ) : (
                <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="formattedDate"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="conversions"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#colorConversions)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Clicks & Impressions Chart */}
        <Card className="shadow-sm">
          <CardHeader className="px-3 sm:px-4 md:px-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">
              Clicks & Impressions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-3 md:px-6">
            {isLoading ? (
              <Skeleton className="h-[200px] sm:h-[250px] md:h-[300px] w-full" />
            ) : (
              <div className="h-[200px] sm:h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="formattedDate"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                    <Bar yAxisId="right" dataKey="impressions" name="Impressions" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Performance Table */}
        <Card className="shadow-sm">
          <CardHeader className="px-3 sm:px-4 md:px-6">
            <CardTitle className="text-sm sm:text-base md:text-lg">
              Campaign Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-2 md:px-6">
            {isLoading ? (
              <div className="space-y-2 px-3 sm:px-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 sm:h-10 w-full" />
                ))}
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No campaign data available for the selected period
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">
                        Campaign
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground">
                        Spend
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground hidden sm:table-cell">
                        Clicks
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground">
                        Conv.
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground hidden md:table-cell">
                        CTR
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground hidden lg:table-cell">
                        CPC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns
                      .filter((c) => c.campaign !== "(not set)")
                      .map((campaign, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-2 sm:py-3 px-3 sm:px-4 font-medium truncate max-w-[100px] sm:max-w-[200px]">
                            {campaign.campaign}
                          </td>
                          <td className="text-right py-2 sm:py-3 px-2 sm:px-4">
                            {formatCurrency(campaign.cost)}
                          </td>
                          <td className="text-right py-2 sm:py-3 px-2 sm:px-4 hidden sm:table-cell">
                            {campaign.clicks.toLocaleString()}
                          </td>
                          <td className="text-right py-2 sm:py-3 px-2 sm:px-4">
                            {campaign.conversions.toLocaleString()}
                          </td>
                          <td className="text-right py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell">
                            {campaign.ctr.toFixed(2)}%
                          </td>
                          <td className="text-right py-2 sm:py-3 px-2 sm:px-4 hidden lg:table-cell">
                            {formatCurrency(campaign.cpc)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
