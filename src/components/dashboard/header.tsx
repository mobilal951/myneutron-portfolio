"use client";

import { useDashboard } from "./dashboard-context";
import { DateRangePicker } from "./date-range-picker";
import { Button } from "@/components/ui/button";
import { AlertCircle, Building2, RefreshCw } from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const {
    properties,
    dateRange,
    setDateRange,
    loading,
    isDemoMode,
    refresh,
    refreshing,
    lastUpdated,
  } = useDashboard();

  const currentProperty = properties[0];

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      {isDemoMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 sm:px-6 py-1.5 sm:py-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-amber-800 text-xs sm:text-sm">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="line-clamp-1">
              <strong>Demo Mode:</strong> <span className="hidden sm:inline">Showing sample data. </span>Connect GA to see real data.
            </span>
          </div>
        </div>
      )}
      <div className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-2.5 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
              <p className="text-xs text-gray-500">
                Updated {formatLastUpdated(lastUpdated)}
              </p>
            </div>
            <Button
              size="sm"
              onClick={refresh}
              disabled={refreshing}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 h-8"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="sr-only sm:not-sr-only">{refreshing ? "..." : "Refresh"}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-100 rounded text-xs text-gray-700 flex-shrink-0">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate max-w-[80px]">{loading ? "..." : currentProperty?.name || "myNeutron"}</span>
            </div>
            <div className="flex-1">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden sm:flex lg:hidden flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">
                Last updated at {formatLastUpdated(lastUpdated)}
              </p>
            </div>
            <Button
              size="default"
              onClick={refresh}
              disabled={refreshing}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700">
              <Building2 className="h-4 w-4" />
              <span className="truncate max-w-[150px]">{loading ? "Loading..." : currentProperty?.name || "myNeutron"}</span>
            </div>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{title}</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Last updated at {formatLastUpdated(lastUpdated)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700">
              <Building2 className="h-4 w-4" />
              <span>{loading ? "Loading..." : currentProperty?.name || "myNeutron"}</span>
            </div>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button
              size="lg"
              onClick={refresh}
              disabled={refreshing}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
