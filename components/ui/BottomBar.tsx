
import Link from "next/link";
import { Home, Map, AlertTriangle, MessageCircle, Users, Bot, Cloud, BarChart3, Brain, Download } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppMode, type AppMode } from "./ModeToggle";

// Navigation items for Emergency Mode
const emergencyNavItems = [
  { name: "Home", href: "/dashboard", icon: Home, color: "#53B175" },
  { name: "Map", href: "/emergency/map", icon: Map, color: "#ef4444" },
  { name: "SOS", href: "/sos", icon: AlertTriangle, color: "#c1121f" },
  { name: "Friends", href: "/friends", icon: Users, color: "#53B175" },
  { name: "Chat", href: "/chatgpt", icon: Bot, color: "#53B175" },
];

// Navigation items for Forecast Mode
const forecastNavItems = [
  { name: "Forecast", href: "/forecast", icon: Cloud, color: "#2563eb" },
  { name: "Map", href: "/forecast/map", icon: Map, color: "#2563eb" },
  { name: "AI", href: "/chat", icon: Bot, color: "#2563eb" },
  { name: "Stats", href: "/forecast/stats", icon: BarChart3, color: "#2563eb" },
  { name: "Behavior", href: "/forecast/behavior", icon: Brain, color: "#8b5cf6" },
];

export interface BottomBarProps {
  iconSize?: number;
  activeColor?: string;
  inactiveColor?: string;
  bgColor?: string;
}

export function BottomBar({ iconSize = 24, activeColor = "#53B175", inactiveColor = "#7C8B9D", bgColor = "#FFFFFF" }: BottomBarProps) {
  const pathname = usePathname();
  const [mode] = useAppMode();
  
  // Determine actual mode based on current pathname (override mode if needed)
  const isInForecastArea = pathname.startsWith('/forecast') || pathname === '/chat' || pathname === '/settings';
  const isInEmergencyArea = pathname === '/dashboard' || pathname === '/sos' || pathname === '/route' || pathname === '/friends' || pathname === '/chatgpt' || pathname === '/alerts' || pathname.startsWith('/emergency');
  
  // Use pathname-based detection if mode from context doesn't match current area
  const actualMode: AppMode = isInForecastArea ? 'forecast' : isInEmergencyArea ? 'emergency' : mode;
  
  // Choose navigation items based on actual mode
  const navItems = actualMode === 'forecast' ? forecastNavItems : emergencyNavItems;
  
  // Determine colors based on actual mode
  const modeActiveColor = actualMode === 'emergency' ? '#53B175' : '#2563eb'
  const modeCenterColor = actualMode === 'emergency' ? '#c1121f' : '#2563eb'
  
  return (
  <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center border-t px-1 py-1 md:hidden shadow-lg" style={{ background: bgColor }}>
      {navItems.map((item, idx) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        // Make SOS (Emergency) or AI (Forecast) the centered, prominent button
        const isCenterButton = (actualMode === 'emergency' && item.name === 'SOS') || (actualMode === 'forecast' && item.name === 'AI');
        
        if (isCenterButton) {
          return (
            <div key={item.name} className="flex-1 flex justify-center" style={{ textAlign: 'center' }}>
              <div className="-mt-3">
                <Link href={item.href} 
                      className="inline-flex flex-col items-center justify-center p-3 rounded-full shadow-xl"
                      style={{ 
                        background: isActive ? modeCenterColor : '#FFFFFF',
                        border: `2px solid ${modeCenterColor}`
                      }}>
                  <Icon size={iconSize + 8} color={isActive ? '#FFFFFF' : modeCenterColor} strokeWidth={2.5} />
                </Link>
                <div className="text-[10px] mt-1 font-bold text-center" 
                     style={{ color: isActive ? modeCenterColor : inactiveColor }}>{item.name}</div>
              </div>
            </div>
          )
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all"
            style={{ color: isActive ? item.color : inactiveColor }}
          >
            <Icon 
              size={iconSize} 
              color={isActive ? item.color : inactiveColor} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  );
}