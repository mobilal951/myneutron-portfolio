"use client";

import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Users, Eye, Heart, MessageCircle } from "lucide-react";

export default function InstagramPage() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Instagram" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        <Card className="border-pink-200 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center py-8">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 mb-4">
                <Instagram className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Connect Instagram</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Connect your Instagram Business/Creator account to view followers, reach, engagement, and content performance.
              </p>
              <Button className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:opacity-90" disabled>
                <Instagram className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Requires Instagram Business or Creator account linked to Facebook
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Followers
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-slate-300">--</p></CardContent>
          </Card>
          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="h-4 w-4" /> Reach
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-slate-300">--</p></CardContent>
          </Card>
          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="h-4 w-4" /> Likes
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-slate-300">--</p></CardContent>
          </Card>
          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Comments
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-slate-300">--</p></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
