"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Calendar, Save, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface AlertTimerConfig {
  enabled: boolean;
  time: string; // HH:MM format
  customPrompt: string;
  selectedDays: number[]; // 0-6 (Sunday-Saturday)
  lastModified?: string;
}

const DEFAULT_CONFIG: AlertTimerConfig = {
  enabled: false,
  time: '08:00',
  customPrompt: 'Good morning! Please provide a detailed weather forecast for today with recommendations for clothing and activities.',
  selectedDays: [1, 2, 3, 4, 5], // Monday-Friday
};

const DAYS_OF_WEEK = [
  { id: 0, name: 'Sunday', short: 'Sun' },
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
];

export default function AlertTimerSettings() {
  const [config, setConfig] = useState<AlertTimerConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('alert-timer-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (error) {
        console.error('Failed to parse alert timer config:', error);
      }
    }
  }, []);

  // Mark changes when config is modified
  useEffect(() => {
    setHasChanges(true);
  }, [config.enabled, config.time, config.customPrompt, config.selectedDays]);

  const toggleDay = (dayId: number) => {
    setConfig(prev => {
      const selectedDays = prev.selectedDays.includes(dayId)
        ? prev.selectedDays.filter(id => id !== dayId)
        : [...prev.selectedDays, dayId].sort();
      
      return { ...prev, selectedDays };
    });
  };

  const saveConfig = async () => {
    setIsSaving(true);
    
    try {
      // Validate time format
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(config.time)) {
        toast.error('Invalid time format. Use HH:MM (e.g., 08:00)');
        setIsSaving(false);
        return;
      }

      // Validate at least one day selected
      if (config.enabled && config.selectedDays.length === 0) {
        toast.error('Please select at least one day of the week');
        setIsSaving(false);
        return;
      }

      const updatedConfig = {
        ...config,
        lastModified: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem('alert-timer-config', JSON.stringify(updatedConfig));
      setConfig(updatedConfig);
      setHasChanges(false);

      // If enabled, schedule the notification (in real app, this would be handled by backend)
      if (config.enabled) {
        // TODO: Call API to schedule push notifications
        toast.success(`✅ Settings saved! Notifications will arrive at ${config.time}`);
      } else {
        toast.success('✅ Settings saved');
      }
    } catch (error) {
      console.error('Failed to save alert timer config:', error);
      toast.error('❌ Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setHasChanges(true);
    toast.info('Settings reset to default values');
  };

  return (
    <Card className="w-full shadow-lg border-2 border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                Notification Settings
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Configure daily weather forecast notifications
              </CardDescription>
            </div>
          </div>
          <Button
            variant={config.enabled ? "default" : "outline"}
            size="sm"
            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={config.enabled ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {config.enabled ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Enabled
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-1" />
                Disabled
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Time Picker */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Clock className="h-4 w-4 text-blue-600" />
            Notification Time
          </Label>
          <Input
            type="time"
            value={config.time}
            onChange={(e) => setConfig(prev => ({ ...prev, time: e.target.value }))}
            className="text-lg font-mono border-2 focus:border-blue-500"
            disabled={!config.enabled}
          />
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Bell className="h-3 w-3" />
            Notification will arrive every day at this time
          </p>
        </div>

        {/* Days Selector */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calendar className="h-4 w-4 text-blue-600" />
            Days of Week
          </Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map(day => (
              <Badge
                key={day.id}
                variant={config.selectedDays.includes(day.id) ? "default" : "outline"}
                className={`cursor-pointer px-3 py-2 text-sm transition-all ${
                  config.selectedDays.includes(day.id)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'hover:bg-blue-50 text-gray-600'
                } ${!config.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => config.enabled && toggleDay(day.id)}
              >
                {day.short}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Selected days: <span className="font-semibold">{config.selectedDays.length}</span>
          </p>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            Custom Prompt (optional)
          </Label>
          <Textarea
            value={config.customPrompt}
            onChange={(e) => setConfig(prev => ({ ...prev, customPrompt: e.target.value }))}
            placeholder="Enter your AI prompt (e.g., 'Give me a forecast with clothing recommendations')"
            className="min-h-[100px] border-2 focus:border-blue-500 resize-none"
            disabled={!config.enabled}
          />
          <p className="text-xs text-gray-500">
            This text will be used to generate a personalized forecast
          </p>
        </div>

        {/* Preview */}
        {config.enabled && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900">
                  Notification Preview:
                </p>
                <p className="text-sm text-blue-700">
                  "🌤️ Good morning! Today at {config.time.split(':')[0]}:00. {config.customPrompt.slice(0, 80)}..."
                </p>
                <p className="text-xs text-blue-600">
                  Days: {config.selectedDays.map(id => DAYS_OF_WEEK.find(d => d.id === id)?.short).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Last Modified */}
        {config.lastModified && (
          <p className="text-xs text-gray-400 text-center">
            Last modified: {new Date(config.lastModified).toLocaleString('en-US')}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={saveConfig}
            disabled={!hasChanges || isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={resetConfig}
            disabled={isSaving}
            className="border-2 hover:bg-gray-50"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
