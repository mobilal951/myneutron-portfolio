"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, Link2, Unlink, Loader2, CheckCircle2, Shield } from "lucide-react";
import { useDashboard } from "./dashboard-context";

export function GAConnectDialog() {
  const { data: session, status } = useSession();
  const { isGAConnected, isAdmin, refresh } = useDashboard();
  const [open, setOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const credentialsSaved = useRef(false);

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  // When admin authenticates, save their credentials to database (only once per session)
  useEffect(() => {
    async function saveAdminCredentials() {
      // Skip if already saved in this session
      if (credentialsSaved.current) return;

      if (isAuthenticated && isAdmin && session?.accessToken && session?.refreshToken) {
        credentialsSaved.current = true;
        setIsSaving(true);
        try {
          const response = await fetch("/api/admin/credentials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken: session.accessToken,
              refreshToken: session.refreshToken,
              expiresAt: session.accessTokenExpires,
              propertyId: process.env.NEXT_PUBLIC_GA_PROPERTY_ID || null,
            }),
          });

          if (response.ok) {
            // Refresh dashboard to use new credentials
            refresh();
          }
        } catch (error) {
          console.error("Failed to save admin credentials:", error);
          credentialsSaved.current = false; // Allow retry on error
        } finally {
          setIsSaving(false);
        }
      }
    }

    saveAdminCredentials();
  }, [isAuthenticated, isAdmin, session?.accessToken]);

  const handleConnect = async () => {
    // Portfolio demo: skip real Google OAuth. Pretend success.
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setOpen(false);
      refresh();
    }, 700);
  };

  // Manual save button for admin if auto-save didn't work
  const handleManualSave = async () => {
    if (!session?.accessToken || !session?.refreshToken) {
      alert("No tokens available. Please sign in again.");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          expiresAt: session.accessTokenExpires,
          propertyId: process.env.NEXT_PUBLIC_GA_PROPERTY_ID || null,
        }),
      });
      if (response.ok) {
        refresh();
        setOpen(false);
      } else {
        alert("Failed to save credentials");
      }
    } catch (error) {
      console.error("Failed to save credentials:", error);
      alert("Failed to save credentials");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    await signOut({ redirect: false });
    setOpen(false);
  };

  // For viewers (non-admin): show GA connection status only
  // For admins: show connect/disconnect options
  const showAdminControls = isAdmin || !isGAConnected;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-3 py-2 text-sm font-medium rounded-lg transition-colors text-amber-300 hover:bg-slate-800 hover:text-amber-200"
        >
          <Link2 className="h-5 w-5 mr-3" />
          Demo data · not live GA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            Google Analytics
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isGAConnected
              ? "Google Analytics is connected and providing live data."
              : isAdmin
              ? "Connect your Google account to enable analytics for all viewers."
              : "Admin needs to connect Google Analytics to view data."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          {isGAConnected ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-green-800">Connected</p>
                  <p className="text-[10px] sm:text-xs text-green-600">Live data from Google Analytics</p>
                </div>
              </div>
              {isAdmin && isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm h-9 sm:h-10"
                >
                  <Unlink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Disconnect Account
                </Button>
              )}
            </div>
          ) : isAdmin ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-blue-800">Admin Access</p>
                  <p className="text-[10px] sm:text-xs text-blue-600">
                    {isAuthenticated ? "Save your GA credentials to enable dashboard for all viewers" : "Connect GA to enable dashboard for all viewers"}
                  </p>
                </div>
              </div>
              {isAuthenticated ? (
                <Button
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-9 sm:h-10"
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  )}
                  Save GA Credentials
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-9 sm:h-10"
                >
                  {isConnecting ? (
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                  ) : (
                    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Sign in with Google
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-2.5 sm:p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs sm:text-sm text-amber-700">
                  The dashboard administrator needs to connect Google Analytics to enable live data.
                  Please contact your administrator.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
