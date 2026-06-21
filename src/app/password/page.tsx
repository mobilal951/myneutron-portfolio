"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Invalid password");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-8 relative overflow-hidden">
      {/* Portfolio demo: floating password hint bubble */}
      <button
        type="button"
        onClick={() => setPassword("myNeutron_stats26")}
        className="absolute top-4 right-4 md:top-10 md:right-10 z-20 cursor-pointer group"
        title="Click to fill the password"
      >
        <div className="relative w-28 h-28 md:w-44 md:h-44 animate-[mnfloat_4s_ease-in-out_infinite]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-400 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
          <div className="absolute inset-3 bg-gradient-to-br from-blue-600 via-cyan-600 to-emerald-500 rounded-full shadow-2xl flex flex-col items-center justify-center text-white text-center p-4 ring-4 ring-white/30">
            <span className="text-[10px] uppercase tracking-widest opacity-80">Demo password</span>
            <span className="font-mono text-xs md:text-sm font-bold mt-1 break-all leading-tight">myNeutron_stats26</span>
            <span className="text-[10px] opacity-80 mt-1">tap to fill ↓</span>
          </div>
        </div>
      </button>
      <style jsx global>{`
        @keyframes mnfloat {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-14px) rotate(2deg); }
        }
      `}</style>

      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center space-y-3 sm:space-y-4 px-4 sm:px-6">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="myNeutron"
              width={140}
              height={40}
              className="object-contain sm:w-[180px] sm:h-[50px]"
            />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold">Dashboard Access</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Enter password to access the dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading || !password}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Access Dashboard"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
