"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Linkedin,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";

interface LinkedInProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
}

interface LinkedInData {
  profile: LinkedInProfile;
  connected: boolean;
  message: string;
}

function LinkedInPageContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<LinkedInData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setNeedsAuth(false);

    try {
      const response = await fetch("/api/linkedin");
      const result = await response.json();

      if (!response.ok) {
        if (result.needsAuth) {
          setNeedsAuth(true);
        }
        throw new Error(result.error || "Failed to fetch LinkedIn data");
      }

      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for error or success from OAuth callback
    const errorParam = searchParams.get("error");
    const connected = searchParams.get("connected");

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setLoading(false);
    } else if (connected === "true") {
      // Successfully connected, fetch data
      fetchData();
    } else {
      fetchData();
    }
  }, [searchParams]);

  const handleConnect = () => {
    // Redirect to LinkedIn OAuth
    window.location.href = "/api/linkedin/auth";
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="LinkedIn" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-700" />
            <p className="text-muted-foreground">Loading LinkedIn data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || needsAuth) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
        <Header title="LinkedIn" />
        <div className="flex-1 p-3 sm:p-4 md:p-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-8">
                <div className="p-4 rounded-full bg-blue-100 mb-4">
                  {needsAuth ? (
                    <Linkedin className="h-8 w-8 text-blue-700" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-blue-700" />
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {needsAuth ? "Connect LinkedIn" : "Error Loading Data"}
                </h2>
                <p className="text-muted-foreground max-w-md mb-6">{error}</p>

                {needsAuth ? (
                  <Button className="bg-blue-700 hover:bg-blue-800" onClick={handleConnect}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    Connect LinkedIn
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={fetchData}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Button className="bg-blue-700 hover:bg-blue-800" onClick={handleConnect}>
                      <Linkedin className="h-4 w-4 mr-2" />
                      Reconnect LinkedIn
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, message } = data;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <Header title="LinkedIn" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-auto">
        {/* Connected Status */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {profile.picture ? (
                <img
                  src={profile.picture}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full border-2 border-green-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-700" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  {profile.name}
                </h2>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Organization Stats Notice */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-1">Organization Stats Pending</h3>
                <p className="text-sm text-amber-700 mb-3">
                  {message}
                </p>
                <p className="text-sm text-muted-foreground">
                  Once approved, you&apos;ll see:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Follower count and growth</li>
                  <li>• Page views and unique visitors</li>
                  <li>• Post impressions and engagement</li>
                  <li>• Reactions, comments, and shares</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <p className="text-sm font-medium text-amber-800 mb-2">Request API Access:</p>
                  <a
                    href="https://linkedincustomerops.qualtrics.com/jfe/form/SV_2mnALYcWNtfvT02"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    Fill out LinkedIn Community Management API Request Form
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {["Followers", "Page Views", "Impressions", "Engagement"].map((label) => (
            <Card key={label} className="opacity-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-muted-foreground">--</p>
                <p className="text-xs text-muted-foreground">Pending API approval</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LinkedInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
          <Header title="LinkedIn" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-700" />
              <p className="text-muted-foreground">Loading LinkedIn data...</p>
            </div>
          </div>
        </div>
      }
    >
      <LinkedInPageContent />
    </Suspense>
  );
}
