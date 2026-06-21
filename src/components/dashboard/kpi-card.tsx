"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  loading,
}: KPICardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-4 md:px-6">
          <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
          <Skeleton className="h-3 sm:h-4 w-3 sm:w-4 rounded" />
        </CardHeader>
        <CardContent className="px-3 sm:px-4 md:px-6">
          <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mb-1" />
          <Skeleton className="h-2.5 sm:h-3 w-24 sm:w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-4 md:px-6">
        <CardTitle className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground truncate">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />}
      </CardHeader>
      <CardContent className="px-3 sm:px-4 md:px-6">
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{formatValue(value)}</div>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
          {trend && (
            <span
              className={cn(
                "text-[10px] sm:text-xs md:text-sm font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value.toFixed(1)}%
            </span>
          )}
          {subtitle && (
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatValue(value: string | number): string {
  if (typeof value === "number") {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toLocaleString();
  }
  return value;
}
