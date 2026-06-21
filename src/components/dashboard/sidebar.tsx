"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Globe,
  TrendingUp,
  MousePointerClick,
  Activity,
  Menu,
  X,
  Megaphone,
  Share2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  UserCheck,
  CreditCard,
  Bot,
  Gift,
  Database,
  Send,
} from "lucide-react";
import { GAConnectDialog } from "./ga-connect-dialog";
import { useState, useEffect } from "react";

const analyticsNavigation = [
  {
    name: "Traffic Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Activity Stats",
    href: "/dashboard/activity",
    icon: Activity,
  },
  {
    name: "Demographics",
    href: "/dashboard/demographics",
    icon: Users,
  },
  {
    name: "Ads Overview",
    href: "/dashboard/ads",
    icon: Megaphone,
  },
  {
    name: "User Events",
    href: "/dashboard/events",
    icon: MousePointerClick,
  },
  {
    name: "Countries",
    href: "/dashboard/countries",
    icon: Globe,
  },
  {
    name: "Acquisition",
    href: "/dashboard/acquisition",
    icon: TrendingUp,
  },
];

const usersNavigation = [
  {
    name: "Profile Completion",
    href: "/dashboard/profiles",
    icon: UserCheck,
  },
  {
    name: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: CreditCard,
  },
  {
    name: "Referrals",
    href: "/dashboard/referrals",
    icon: Gift,
  },
];

const aiAssistantNavigation = [
  {
    name: "Chat Summary",
    href: "/dashboard/ai-assistant",
    icon: Bot,
  },
];

const knowledgeBaseNavigation = [
  {
    name: "Seeds Analytics",
    href: "/dashboard/seeds",
    icon: Database,
  },
];

const integrationsNavigation = [
  {
    name: "Telegram Bot",
    href: "/dashboard/telegram",
    icon: Send,
  },
];

const socialsNavigation = [
  {
    name: "Social Overview",
    href: "/dashboard/socials",
    icon: Share2,
  },
  {
    name: "Facebook",
    href: "/dashboard/socials/facebook",
    icon: Facebook,
  },
  {
    name: "Instagram",
    href: "/dashboard/socials/instagram",
    icon: Instagram,
  },
  {
    name: "LinkedIn",
    href: "/dashboard/socials/linkedin",
    icon: Linkedin,
  },
  {
    name: "Twitter / X",
    href: "/dashboard/socials/twitter",
    icon: Twitter,
  },
  {
    name: "YouTube",
    href: "/dashboard/socials/youtube",
    icon: Youtube,
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
  }, [pathname]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 border-b border-slate-800">
        <Image
          src="/logo.png"
          alt="myNeutron"
          width={120}
          height={35}
          className="object-contain brightness-0 invert"
        />
        {/* Close button - mobile only */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 sm:px-3 py-3 sm:py-4 overflow-y-auto">
        {/* Analytics Section */}
        <div className="mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Analytics
          </h3>
          <div className="space-y-0.5 sm:space-y-1">
            {analyticsNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center px-3 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Users Section */}
        <div className="mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Users
          </h3>
          <div className="space-y-0.5 sm:space-y-1">
            {usersNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center px-3 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* AI Assistant Section */}
        <div className="mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            AI Assistant
          </h3>
          <div className="space-y-0.5 sm:space-y-1">
            {aiAssistantNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center px-3 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Knowledge Base Section */}
        <div className="mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Knowledge Base
          </h3>
          <div className="space-y-0.5 sm:space-y-1">
            {knowledgeBaseNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center px-3 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Integrations Section */}
        <div className="mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Integrations
          </h3>
          <div className="space-y-0.5 sm:space-y-1">
            {integrationsNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center px-3 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Socials Section */}
        <div className="mb-4">
          <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Socials
          </h3>
          <div className="space-y-0.5 sm:space-y-1">
            {socialsNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center px-3 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* GA Connection */}
      <div className="px-2 sm:px-3 py-2 border-t border-slate-800">
        <GAConnectDialog />
      </div>

      {/* User Info */}
      {session && (
        <div className="p-3 sm:p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 px-1 sm:px-2">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-slate-700 text-xs">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full w-64 flex-col bg-slate-900 text-white">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 max-w-[80vw] flex flex-col bg-slate-900 text-white z-50 lg:hidden animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}

// Mobile Header with hamburger menu
export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="lg:hidden flex items-center justify-between h-14 px-3 bg-slate-900 border-b border-slate-800">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <Menu className="h-5 w-5 text-white" />
      </button>
      <Image
        src="/logo.png"
        alt="myNeutron"
        width={100}
        height={30}
        className="object-contain brightness-0 invert"
      />
      <div className="w-9" /> {/* Spacer for centering */}
    </div>
  );
}
