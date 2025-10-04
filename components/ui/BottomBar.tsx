
import Link from "next/link";
import { Home, Map, AlertTriangle, MessageCircle, Users, Bot, Cloud, BarChart3, Brain, Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppMode, type AppMode } from "./ModeToggle";

// Navigation items for Emergency Mode
const emergencyNavItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Map", href: "/route", icon: Map },
  { name: "SOS", href: "/sos", icon: AlertTriangle },
  { name: "Friends", href: "/friends", icon: Users },
  { name: "ChatGPT", href: "/chatgpt", icon: Bot },
];

// Navigation items for Forecast Mode
const forecastNavItems = [
  { name: "Forecast", href: "/forecast", icon: Cloud },
  { name: "Map", href: "/forecast/map", icon: Map },
  { name: "AI", href: "/forecast/ai", icon: Brain },
  { name: "Stats", href: "/forecast/stats", icon: BarChart3 },
  { name: "Export", href: "/forecast/export", icon: Download },
];

export interface BottomBarProps {
  iconSize?: number;
  activeColor?: string;
  inactiveColor?: string;
  bgColor?: string;
}

export function BottomBar({ iconSize = 24, activeColor = "#53B175", inactiveColor = "#37393F", bgColor = "#FCFCFC" }: BottomBarProps) {
  const pathname = usePathname();
  const [mode] = useAppMode();
  
  // Choose navigation items based on current mode
  const navItems = mode === 'forecast' ? forecastNavItems : emergencyNavItems;
  
  return (
  <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center border-t px-1 py-1 md:hidden" style={{ background: bgColor }}>
      {navItems.map((item, idx) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        // Make SOS (Emergency) or AI (Forecast) the centered, prominent button
        const isCenterButton = (mode === 'emergency' && item.name === 'SOS') || (mode === 'forecast' && item.name === 'AI');
        
        if (isCenterButton) {
          return (
            <div key={item.name} className="flex-1 flex justify-center" style={{ textAlign: 'center' }}>
              <div className="-mt-2">
                <Link href={item.href} className="inline-flex flex-col items-center justify-center p-2 rounded-full shadow-lg bg-white" 
                      style={{ color: isActive ? (mode === 'emergency' ? '#c1121f' : '#2563eb') : inactiveColor }}>
                  <Icon size={iconSize + 6} color={isActive ? (mode === 'emergency' ? '#c1121f' : '#2563eb') : inactiveColor} />
                </Link>
                <div className="text-[11px] mt-1 font-bold text-center hidden sm:block" 
                     style={{ color: isActive ? (mode === 'emergency' ? '#c1121f' : '#2563eb') : inactiveColor }}>{item.name}</div>
              </div>
            </div>
          )
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition font-bold"
            style={{ color: isActive ? activeColor : inactiveColor }}
          >
            <Icon size={iconSize} color={isActive ? activeColor : inactiveColor} />
              <span className="text-[10px] mt-1 hidden sm:block">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  );
}