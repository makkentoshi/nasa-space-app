'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Navigation, 
  Map, 
  Bell, 
  Settings, 
  ArrowRight,
  MessageSquare,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface QuickAction {
  label: string;
  action: string;
  page?: string;
  params?: Record<string, string>;
  icon?: string;
}

interface ActionButtonsProps {
  actions: QuickAction[];
  onActionClick?: (action: QuickAction) => void;
}

/**
 * ActionButtons Component
 * Displays quick action buttons in chat messages
 */
export function ActionButtons({ actions, onActionClick }: ActionButtonsProps) {
  const router = useRouter();
  
  const getIcon = (action: string) => {
    const iconMap: Record<string, any> = {
      CREATE_ROUTE: Navigation,
      SHOW_FORECAST: Calendar,
      CHECK_ALERTS: Bell,
      OPEN_MAP: Map,
      OPEN_SETTINGS: Settings,
      SHOW_BEHAVIOR: TrendingUp,
      CONTINUE_CHAT: MessageSquare,
    };
    return iconMap[action] || ArrowRight;
  };
  
  const handleClick = (action: QuickAction) => {
    if (onActionClick) {
      onActionClick(action);
    }
    
    if (action.page) {
      const url = action.params
        ? `${action.page}?${new URLSearchParams(action.params).toString()}`
        : action.page;
      router.push(url);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2 mt-3 mb-2">
      {actions.map((action, index) => {
        const Icon = getIcon(action.action);
        
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 dark:hover:border-blue-600"
            onClick={() => handleClick(action)}
          >
            <Icon className="w-3 h-3 mr-1" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}

interface NavigationPromptProps {
  page: string;
  title: string;
  description: string;
  params?: Record<string, string>;
  prefill?: Record<string, any>;
  actionLabel?: string;
  onNavigate?: () => void;
}

/**
 * NavigationPrompt Component
 * Displays a prominent navigation card when AI detects user intent
 */
export function NavigationPrompt({
  page,
  title,
  description,
  params,
  prefill,
  actionLabel = 'Go',
  onNavigate,
}: NavigationPromptProps) {
  const url = params
    ? `${page}?${new URLSearchParams(params).toString()}`
    : page;
  
  return (
    <div className="mt-3 mb-2 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg text-white">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">
            {title}
          </h3>
          <p className="text-sm opacity-90">
            {description}
          </p>
        </div>
        
        <div className="text-3xl">
          🚀
        </div>
      </div>
      
      {/* Prefill Data Preview */}
      {prefill && Object.keys(prefill).length > 0 && (
        <div className="mt-3 p-2 bg-white/10 rounded-md text-xs space-y-1">
          {Object.entries(prefill).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="opacity-80">{key}:</span>
              <span className="font-medium">{String(value)}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Action Button */}
      <Link href={url}>
        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-3 bg-white text-blue-600 hover:bg-white/90 font-semibold"
          onClick={onNavigate}
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

interface ConversationStartersProps {
  starters: string[];
  onStarterClick?: (starter: string) => void;
}

/**
 * ConversationStarters Component
 * Displays suggested questions/prompts for the user
 */
export function ConversationStarters({
  starters,
  onStarterClick,
}: ConversationStartersProps) {
  return (
    <div className="mt-3 mb-2">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
        💡 Try asking:
      </div>
      
      <div className="flex flex-col gap-2">
        {starters.map((starter, index) => (
          <button
            key={index}
            className="
              text-left p-3 rounded-lg 
              bg-gray-50 dark:bg-gray-800/50 
              border border-gray-200 dark:border-gray-700
              hover:bg-blue-50 dark:hover:bg-blue-900/30 
              hover:border-blue-300 dark:hover:border-blue-600
              transition-all text-sm
              group
            "
            onClick={() => onStarterClick?.(starter)}
          >
            <span className="text-gray-700 dark:text-gray-300">
              {starter}
            </span>
            <ArrowRight className="w-3 h-3 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}

interface TypingIndicatorProps {
  userName?: string;
}

/**
 * TypingIndicator Component
 * Shows when AI is processing a response
 */
export function TypingIndicator({ userName = 'AI' }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-fit">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {userName} is typing
      </div>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

interface MessageActionBarProps {
  messageId: string;
  canNavigate?: boolean;
  navigationUrl?: string;
  onShare?: () => void;
  onSave?: () => void;
  onCopy?: () => void;
}

/**
 * MessageActionBar Component
 * Action buttons for individual messages (share, save, navigate, etc.)
 */
export function MessageActionBar({
  messageId,
  canNavigate,
  navigationUrl,
  onShare,
  onSave,
  onCopy,
}: MessageActionBarProps) {
  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      {canNavigate && navigationUrl && (
        <Link href={navigationUrl}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
          >
            <ArrowRight className="w-3 h-3 mr-1" />
            Open
          </Button>
        </Link>
      )}
      
      {onCopy && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onCopy}
        >
          Copy
        </Button>
      )}
      
      {onSave && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onSave}
        >
          Save
        </Button>
      )}
      
      {onShare && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onShare}
        >
          Share
        </Button>
      )}
    </div>
  );
}
