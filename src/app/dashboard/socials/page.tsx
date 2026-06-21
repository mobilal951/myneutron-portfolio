"use client";

import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, AlertCircle } from "lucide-react";
import Link from "next/link";

const platforms = [
  {
    name: "Facebook",
    href: "/dashboard/socials/facebook",
    icon: Facebook,
    color: "bg-blue-600",
    description: "Page likes, reach, engagement",
    status: "coming_soon",
  },
  {
    name: "Instagram",
    href: "/dashboard/socials/instagram",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    description: "Followers, reach, engagement",
    status: "coming_soon",
  },
  {
    name: "LinkedIn",
    href: "/dashboard/socials/linkedin",
    icon: Linkedin,
    color: "bg-blue-700",
    description: "Followers, impressions, engagement",
    status: "coming_soon",
  },
  {
    name: "Twitter / X",
    href: "/dashboard/socials/twitter",
    icon: Twitter,
    color: "bg-black",
    description: "Followers, impressions, engagement",
    status: "coming_soon",
  },
  {
    name: "YouTube",
    href: "/dashboard/socials/youtube",
    icon: Youtube,
    color: "bg-red-600",
    description: "Subscribers, views, watch time",
    status: "coming_soon",
  },
];

export default function SocialOverviewPage() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Social Overview" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Connect Your Social Accounts</h3>
            <p className="text-sm text-blue-700 mt-1">
              Link your social media accounts to view performance metrics, engagement stats, and audience insights all in one place.
            </p>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <Link key={platform.name} href={platform.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${platform.color}`}>
                      <platform.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{platform.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                      Coming Soon
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Click to setup
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Management Metrics Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What You'll See</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-400">--</p>
                <p className="text-sm text-muted-foreground mt-1">Total Followers</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-400">--</p>
                <p className="text-sm text-muted-foreground mt-1">Total Impressions</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-400">--</p>
                <p className="text-sm text-muted-foreground mt-1">Total Engagements</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-2xl font-bold text-slate-400">--</p>
                <p className="text-sm text-muted-foreground mt-1">Avg. Engagement Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
