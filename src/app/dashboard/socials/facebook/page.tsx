"use client";

import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Users, Eye, ThumbsUp, MessageCircle, ExternalLink } from "lucide-react";

export default function FacebookPage() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="Facebook" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        {/* Connection Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center py-8">
              <div className="p-4 rounded-full bg-blue-600 mb-4">
                <Facebook className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Connect Facebook Page</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Connect your Facebook Business Page to view page likes, post reach, engagement metrics, and audience demographics.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                <Facebook className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Requires Meta Business Suite access
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Page Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-300">--</p>
            </CardContent>
          </Card>
          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="h-4 w-4" /> Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-300">--</p>
            </CardContent>
          </Card>
          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" /> Engagements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-300">--</p>
            </CardContent>
          </Card>
          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-300">--</p>
            </CardContent>
          </Card>
        </div>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Setup Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <p className="font-medium">Facebook Business Page</p>
                <p className="text-sm text-muted-foreground">You need admin access to a Facebook Business Page</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <p className="font-medium">Meta Business Suite</p>
                <p className="text-sm text-muted-foreground">Your page must be connected to Meta Business Suite</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <p className="font-medium">OAuth Authorization</p>
                <p className="text-sm text-muted-foreground">Grant read access to page insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
