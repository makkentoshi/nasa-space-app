"use client";

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BottomBar } from '@/components/ui/BottomBar';
import { useAppMode, type AppMode } from '@/components/ui/ModeToggle';
import {
  Menu,
  Home,
  AlertTriangle,
  Route,
  Users,
  MessageCircle,
  Settings,
  Shield,
  Phone,
  Cloud,
  BarChart3,
  Brain,
  Download,
} from 'lucide-react';
import { useAppStore } from '@/lib/store/useAppStore';
import { useTheme } from 'next-themes';
import BackButton from '@/components/ui/BackButton'
import { useRouter } from 'next/navigation'

const emergencyNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "SOS", href: "/sos", icon: Phone },
  { name: "Safe Route", href: "/route", icon: Route },
  { name: "Friends", href: "/friends", icon: Users }, 
  { name: "Community", href: "/chat", icon: MessageCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

const forecastNavigation = [
  { name: "Forecast", href: "/forecast", icon: Cloud },
  { name: "Map", href: "/forecast/map", icon: BarChart3 },
  { name: "AI Assistant", href: "/forecast/ai", icon: Brain },
  { name: "Statistics", href: "/forecast/stats", icon: BarChart3 },
  { name: "Export", href: "/forecast/export", icon: Download },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  // Theme toggle using next-themes
  const { theme, setTheme, systemTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  const toggleDarkMode = () => setTheme(isDark ? 'light' : 'dark');
  const pathname = usePathname();
  const router = useRouter()
  const [mode] = useAppMode();
  
  // Choose navigation based on current mode
  const navigation = mode === 'forecast' ? forecastNavigation : emergencyNavigation;
  const isInEmergency = useAppStore((state) => state.isInEmergency);

  return (
    <div className="min-h-screen flex flex-col bg-pwa-bg1 dark:bg-darkbg transition-colors duration-300 mt-10">
      {/* Mobile header */}
  <header className="flex items-center justify-between px-4 py-2 bg-pwa-green text-white shadow-md md:hidden">
        {/* Left: burger only on dashboard/root */}
        <div>
          {(pathname === '/dashboard' || pathname === '/') && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6 text-black" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <VisuallyHidden.Root>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden.Root>
                <nav className="flex flex-col gap-2 p-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-pwa-green/80 transition"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
                {/* Theme toggle in sidebar */}
                <div className="p-4 border-t">
                  <Button variant="outline" size="sm" onClick={toggleDarkMode} aria-label="Toggle dark mode" className="w-full">
                    {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
        {/* Right: avatar */}
        <div className="flex items-center gap-2">
          {(pathname === '/dashboard' || pathname === '/') && (
            <Avatar className="cursor-pointer" onClick={() => openUserProfile()} aria-label="Open user profile">
              <AvatarImage src={(user as any)?.imageUrl ?? (user as any)?.profileImageUrl ?? ""} alt={(user as any)?.fullName ?? "User"} />
              <AvatarFallback>
                {(user as any)?.firstName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1 flex flex-col bg-background dark:bg-darkbg transition-colors duration-300">
        {/* Fixed back button (hidden on dashboard root) */}
        {pathname && pathname !== '/dashboard' && pathname !== '/' && (
          <BackButton onClick={() => router.back()} />
        )}
        {/* Emergency banner */}
        {isInEmergency && (
          <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium m-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Emergency Mode Active</span>
          </div>
        )}
        {children}
      </main>
      {/* BottomBar for mobile navigation */}
      <BottomBar
  iconSize={24}
        activeColor="#53B175"
        inactiveColor="#37393F"
        bgColor="#FCFCFC"
      />
    </div>
  );
}