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
  customPrompt: 'Доброе утро! Пожалуйста, предоставьте подробный прогноз погоды на сегодня с рекомендациями по одежде и активностям.',
  selectedDays: [1, 2, 3, 4, 5], // Monday-Friday
};

const DAYS_OF_WEEK = [
  { id: 0, name: 'Воскресенье', short: 'Вс' },
  { id: 1, name: 'Понедельник', short: 'Пн' },
  { id: 2, name: 'Вторник', short: 'Вт' },
  { id: 3, name: 'Среда', short: 'Ср' },
  { id: 4, name: 'Четверг', short: 'Чт' },
  { id: 5, name: 'Пятница', short: 'Пт' },
  { id: 6, name: 'Суббота', short: 'Сб' },
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
        toast.error('Неверный формат времени. Используйте HH:MM (например, 08:00)');
        setIsSaving(false);
        return;
      }

      // Validate at least one day selected
      if (config.enabled && config.selectedDays.length === 0) {
        toast.error('Выберите хотя бы один день недели');
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
        toast.success(`✅ Настройки сохранены! Уведомления будут приходить в ${config.time}`);
      } else {
        toast.success('✅ Настройки сохранены');
      }
    } catch (error) {
      console.error('Failed to save alert timer config:', error);
      toast.error('❌ Не удалось сохранить настройки');
    } finally {
      setIsSaving(false);
    }
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setHasChanges(true);
    toast.info('Настройки сброшены к значениям по умолчанию');
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
                Настройки уведомлений
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Настройте ежедневные уведомления с прогнозом погоды
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
                Включено
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-1" />
                Выключено
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
            Время уведомления
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
            Уведомление будет приходить каждый день в это время
          </p>
        </div>

        {/* Days Selector */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Calendar className="h-4 w-4 text-blue-600" />
            Дни недели
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
            Выбрано дней: <span className="font-semibold">{config.selectedDays.length}</span>
          </p>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            Пользовательский запрос (необязательно)
          </Label>
          <Textarea
            value={config.customPrompt}
            onChange={(e) => setConfig(prev => ({ ...prev, customPrompt: e.target.value }))}
            placeholder="Введите свой запрос для AI (например, 'Дай прогноз с рекомендациями по одежде')"
            className="min-h-[100px] border-2 focus:border-blue-500 resize-none"
            disabled={!config.enabled}
          />
          <p className="text-xs text-gray-500">
            Этот текст будет использоваться для генерации персонализированного прогноза
          </p>
        </div>

        {/* Preview */}
        {config.enabled && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-900">
                  Пример уведомления:
                </p>
                <p className="text-sm text-blue-700">
                  "🌤️ Доброе утро! Сегодня {config.time.split(':')[0]}:00. {config.customPrompt.slice(0, 80)}..."
                </p>
                <p className="text-xs text-blue-600">
                  Дни: {config.selectedDays.map(id => DAYS_OF_WEEK.find(d => d.id === id)?.short).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Last Modified */}
        {config.lastModified && (
          <p className="text-xs text-gray-400 text-center">
            Последнее изменение: {new Date(config.lastModified).toLocaleString('ru-RU')}
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
                Сохранение...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Сохранить настройки
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={resetConfig}
            disabled={isSaving}
            className="border-2 hover:bg-gray-50"
          >
            Сброс
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
