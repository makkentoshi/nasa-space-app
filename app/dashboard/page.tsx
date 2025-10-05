"use client";
import { useUser } from '@clerk/nextjs';
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppShell } from "@/components/layout/AppShell";
import { Home, AlertTriangle, MapPin, MessageCircle, Users } from "lucide-react";
import { SiLighthouse } from "react-icons/si";
import { Waves, Flame, Earth, Wind } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import Link from "next/link";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { SafetyGuidesCard } from "@/components/SafetyGuidesCard";

interface DashboardAlert {
  id: string;
  type: string;
  severity: string;
  headline: string;
  distance?: number;
}

export default function DashboardPage() {
  const { user } = useUser();
  const location = useAppStore((state) => state.location.location);
  const locationName = useAppStore((state) => state.location.locationName);
  const isInEmergency = useAppStore((state) => state.isInEmergency);

  const { data: nearbyAlerts, isLoading } = useQuery({
    queryKey: ["alerts", "nearby", location],
    queryFn: async () => {
      if (!location) return [];

      const response = await fetch(
        `/api/alerts?lat=${location.lat}&lng=${location.lng}&radius=50000`
      );
      return response.json();
    },
    enabled: !!location,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "extreme":
        return "destructive";
      case "severe":
        return "default";
      case "moderate":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <AppShell>
      <div className="pb-24 px-4 pt-4 bg-pwa-bg2 min-h-screen">
        {/* Header - Compact version for emergency situations */}
        <div className="rounded-2xl shadow-sm bg-white py-4 px-4 flex flex-col items-center mb-4">
          <div className="flex items-center gap-3 mb-2">
            <SiLighthouse className="h-8 w-8 text-[#53B175]" />
            
          </div>
            <h1 className="text-xl font-bold text-gray-900">resQ</h1>
          <p className="text-sm text-gray-500 text-center max-w-xs">Emergency alerts & assistance</p>
        </div>

        {/* Emergency/Forecast Toggle */}
        <div className="mb-4 flex justify-center items-center w-full">
          <div className="bg-white rounded-full p-1 shadow-sm border border-gray-200 mx-auto">
            <div className="flex items-center">
              <div className="px-6 py-2 rounded-full text-sm font-medium bg-[#53B175] text-white">
                Emergency
              </div>
              <Link href="/forecast" className="px-6 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Forecast
              </Link>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Welcome back, {(user as any)?.fullName || "User"}</h2>
          <p className="text-sm text-gray-500">Stay informed and stay safe with real-time emergency updates.</p>
        </div>

        {/* Alerts Section - PRIORITY: stacked image cards */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Alerts
          </h2>
          <div className="space-y-3">
            <Link href="/alerts/type/tsunami" className="block rounded-2xl overflow-hidden relative h-32 shadow hover:shadow-lg transition">
              <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url('/alerts/tsunami.svg')` }} />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute left-4 bottom-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Waves className="h-4 w-4" />
                  <div className="text-sm font-semibold">Tsunami</div>
                </div>
                <div className="text-xs opacity-90">Coastal warnings & evacuation alerts</div>
              </div>
            </Link>
            <Link href="/alerts/type/fire" className="block rounded-2xl overflow-hidden relative h-32 shadow hover:shadow-lg transition">
              <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url('/alerts/fire.svg')` }} />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute left-4 bottom-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-4 w-4" />
                  <div className="text-sm font-semibold">Wildfire</div>
                </div>
                <div className="text-xs opacity-90">Fire reports & burn advisories</div>
              </div>
            </Link>
            <Link href="/alerts/type/earthquake" className="block rounded-2xl overflow-hidden relative h-32 shadow hover:shadow-lg transition">
              <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url('/alerts/earthquake.svg')` }} />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute left-4 bottom-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Earth className="h-4 w-4" />
                  <div className="text-sm font-semibold">Earthquake</div>
                </div>
                <div className="text-xs opacity-90">Seismic activity & magnitude reports</div>
              </div>
            </Link>
            <Link href="/alerts/type/hurricane" className="block rounded-2xl overflow-hidden relative h-32 shadow hover:shadow-lg transition">
              <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url('/alerts/hurricane.svg')` }} />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute left-4 bottom-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Wind className="h-4 w-4" />
                  <div className="text-sm font-semibold">Hurricane</div>
                </div>
                <div className="text-xs opacity-90">Storm tracks & evacuation notices</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Catalog Hero (survival videos & docs) - moved down */}
        <section className="mb-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Home className="h-5 w-5 text-[#53B175]" />
              Survival Guides & Videos
            </h2>
            <p className="text-sm text-gray-500 mb-4">Quick emergency preparation videos and offline instructions.</p>

            <div className="grid grid-cols-2 gap-3">
              {[1,2,3,4].map((i) => (
                <Link key={i} href={`/catalog`} className="block rounded-lg overflow-hidden bg-[#f8faf8] hover:bg-[#f0f4f0] transition">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 3v18l15-9L5 3z" />
                    </svg>
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-semibold">Emergency Prep #{i}</h3>
                    <p className="text-xs text-muted-foreground">Video • 3-7 min</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Link href="/sos">
              <div className="rounded-2xl bg-[#F2F3F2] flex flex-col items-center py-6 shadow hover:shadow-lg transition cursor-pointer">
        <AlertTriangle className="h-8 w-8 text-[#F87171]" />
                <span className="mt-2 text-base font-semibold text-gray-900">SOS</span>
              </div>
            </Link>
            <Link href="/route">
              <div className="rounded-2xl bg-[#FCFCFC] flex flex-col items-center py-6 shadow hover:shadow-lg transition cursor-pointer">
        <MapPin className="h-8 w-8 text-[#53B175]" />
                <span className="mt-2 text-base font-semibold text-gray-900">Map</span>
              </div>
            </Link>
            <Link href="/chat">
              <div className="rounded-2xl bg-[#FCFCFC] flex flex-col items-center py-6 shadow hover:shadow-lg transition cursor-pointer">
        <MessageCircle className="h-8 w-8 text-[#53B175]" />
                <span className="mt-2 text-base font-semibold text-gray-900">Chat</span>
              </div>
            </Link>
            <Link href="/friends">
              <div className="rounded-2xl bg-[#FCFCFC] flex flex-col items-center py-6 shadow hover:shadow-lg transition cursor-pointer">
        <Users className="h-8 w-8 text-[#53B175]" />
                <span className="mt-2 text-base font-semibold text-gray-900">Friends</span>
              </div>
            </Link>
          </div>

        {/* Location Status */}
        <div className="rounded-2xl bg-white shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-6 h-6 text-[#53B175]">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#53B175" strokeWidth="2" /><circle cx="12" cy="12" r="3" fill="#53B175" /></svg>
            </span>
            <span className="font-bold text-gray-900">Location Status</span>
          </div>
          {location ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-900 font-medium">
                {locationName || 'Current Location'}
              </p>
              <p className="text-xs text-gray-500">
                {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-[#53B175] text-white text-xs font-semibold">Location tracking active</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Location access required for emergency alerts and routing.
              </p>
              <button className="w-full py-3 rounded-xl bg-[#53B175] text-white font-bold text-base shadow">Enable Location</button>
            </div>
          )}
        </div>

        {/* Push Notifications */}
        <div className="mb-6">
          <PushNotificationManager />
        </div>

        {/* Emergency Banner */}
        {isInEmergency && (
          <div className="rounded-2xl bg-[#FFF9FF] border border-red-200 p-4 mb-6 flex items-center gap-3 shadow">
            <span className="inline-block w-8 h-8">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#F87171" /><text x="16" y="22" textAnchor="middle" fontSize="14" fill="#fff">SOS</text></svg>
            </span>
            <span className="text-red-800 font-semibold">Emergency mode active. Your location is being shared with emergency contacts.</span>
          </div>
        )}

        {/* Active Alerts */}
        <div className="rounded-2xl bg-white shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block w-4 h-4 mb-3 mr-2 text-[#53B175]">
            <AlertTriangle className="h-6 w-6 text-[#F87171]" />
            </span>
            <span className="font-bold text-gray-900">Nearby Alerts</span>
          </div>
          <p className="text-sm text-gray-500 mb-2">Emergency alerts within 50km of your location</p>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#F2F3F2] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : nearbyAlerts?.length > 0 ? (
            <div className="space-y-4">
              {nearbyAlerts.slice(0, 3).map((alert: DashboardAlert) => (
                <div key={alert.id} className="flex items-start justify-between p-4 border rounded-xl bg-[#FCFCFC]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-1 rounded bg-[#53B175] text-white text-xs font-semibold">{alert.severity}</span>
                      <span className="text-xs text-gray-500 uppercase">{alert.type.replace("_", " ")}</span>
                    </div>
                    <h4 className="font-medium text-gray-900">{alert.headline}</h4>
                    {alert.distance && (
                      <p className="text-xs text-gray-500">{(alert.distance / 1000).toFixed(1)} km away</p>
                    )}
                  </div>
                  <Link href={`/alerts/${alert.id}`}>
                    <button className="px-4 py-2 rounded-xl bg-[#53B175] text-white font-bold text-xs shadow">Details</button>
                  </Link>
                </div>
              ))}
              <Link href="/alerts">
                <button className="w-full py-3 rounded-xl bg-[#53B175] text-white font-bold text-base shadow">View All Alerts</button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg width="48" height="48" fill="none" viewBox="0 0 48 48" className="mx-auto mb-4"><rect x="8" y="8" width="32" height="32" rx="16" fill="#53B175" /></svg>
              <h3 className="font-medium text-green-800 mb-2">All Clear</h3>
              <p className="text-sm text-green-600">No active alerts in your area</p>
            </div>
          )}
        </div>
        {/* Safety Guides Library */}
        <div className="mb-6">
          <SafetyGuidesCard />
        </div>

        {/* Instructions (PDF) */}
        <div className="rounded-2xl bg-white shadow-sm p-4 mb-6">
          <h2 className="text-lg font-bold mb-2">Emergency Instructions</h2>
          <p className="text-sm text-muted-foreground mb-3">Offline-ready instructions are cached for quick access.</p>
          <div style={{ minHeight: 200 }}>
            <object data="/instructions/resq_instructions.pdf" type="application/pdf" width="100%" height="300">
              <p>PDF preview not available. <a href="/instructions/resq_instructions.pdf">Download instructions</a></p>
            </object>
          </div>
        </div>
      </div>
    </AppShell>
  );
}