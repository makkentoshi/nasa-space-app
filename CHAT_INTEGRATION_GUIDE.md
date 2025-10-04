# AI Chat Integration Guide

## 🚀 Overview

Мощная AI-чат система с полной интеграцией приложения. Чат понимает контекст погоды, маршруты пользователя, alerts и автоматически предлагает соответствующие действия.

## ✨ Key Features

### 1. **Context-Aware Conversations** 🧠
- Автоматическая загрузка погоды на 7 дней
- Учет сохраненных маршрутов пользователя
- Интеграция с активными alerts
- Анализ поведенческих паттернов
- Comfort predictions для планирования

### 2. **Intent Detection & Navigation** 🎯
Чат автоматически распознает намерения и перенаправляет на нужные страницы:

**Примеры:**
- "Я хочу съездить в Алматы" → Открывает `/route?to=Алматы`
- "Какая погода?" → Показывает `/forecast`
- "Проверь alerts" → Открывает `/alerts`
- "Создать маршрут из Астаны в Алматы" → `/route?from=Астана&to=Алматы`
- "Покажи карту" → `/forecast/map`
- "Настройки" → `/settings`

### 3. **Scheduled Messages** ⏰
Автоматические сообщения в установленное время (например, 8:00 утра):
- Погодный брифинг на день
- Рекомендации по одежде
- Предупреждения об alerts
- Проверка сохраненных маршрутов
- Комфорт-анализ

### 4. **Rich Message Components** 🎨

#### WeatherForecastCard
```typescript
<WeatherForecastCard
  forecast={forecast7days}
  location="Astana"
  compact={false}
  showActions={true}
/>
```
- 7-дневный прогноз с emoji
- Температура high/low
- Precipitation chance
- Comfort index badges
- Quick actions buttons

#### RoutePreviewCard
```typescript
<RoutePreviewCard
  from="Astana"
  to="Almaty"
  weather_condition="Clear"
  weather_emoji="☀️"
  warnings={["High wind expected"]}
  comfort_score={75}
/>
```
- Визуализация маршрута
- Погода вдоль пути
- Warnings и alerts
- Кнопка "Plan Route"

#### AlertSummaryCard
```typescript
<AlertSummaryCard
  alerts={activeAlerts}
  showAll={false}
  onViewDetails={(id) => router.push(`/alerts/${id}`)}
/>
```
- Цветовая индикация severity
- Distance до alert
- Quick actions

### 5. **Streaming Responses** ⚡
```typescript
// Enable streaming for real-time responses
const response = await fetch('/api/chat/enhanced', {
  method: 'POST',
  body: JSON.stringify({
    message: userMessage,
    stream: true
  })
});
```

## 📡 API Endpoints

### `/api/chat/context` (GET)
Получение полного контекста для чата:
```bash
GET /api/chat/context?lat=51.1694&lng=71.4491&location=Astana
```

**Response:**
```json
{
  "context": {
    "weather": {
      "forecast_7day": [...],
      "current_conditions": {...},
      "week_summary": "..."
    },
    "routes": {
      "saved_routes": [...],
      "recent_routes": [...]
    },
    "behavior": {...},
    "alerts": {...},
    "contextual_prompt": "SYSTEM CONTEXT..."
  }
}
```

### `/api/chat/enhanced` (POST)
Основной чат endpoint с AI:
```typescript
POST /api/chat/enhanced
{
  "message": "Я хочу поехать в Алматы",
  "conversation_history": [...],
  "location": { lat: 51.1694, lng: 71.4491, name: "Astana" },
  "include_context": true,
  "stream": false
}
```

**Response:**
```json
{
  "message": "Конечно! Я помогу вам спланировать поездку...",
  "intent": {
    "type": "create_route",
    "confidence": 0.85,
    "entities": {
      "to_location": "Алматы"
    }
  },
  "navigation": {
    "page": "/route",
    "params": { "to": "Алматы" },
    "action_command": "CREATE_ROUTE|current|Алматы"
  },
  "suggestions": [
    "Show me weather along the route",
    "When is the best time to travel?",
    "Are there any alerts on this route?"
  ],
  "metadata": {
    "context_used": true,
    "model": "gpt-4o-mini",
    "weather_forecast": [...]
  }
}
```

### `/api/chat/scheduled` (POST)
Генерация scheduled сообщений:
```typescript
POST /api/chat/scheduled
{
  "user_id": "user_xxx",
  "trigger_time": "2025-10-05T08:00:00Z",
  "trigger_type": "daily_briefing",
  "location": { lat: 51.1694, lng: 71.4491, name: "Astana" }
}
```

**Response:**
```json
{
  "message": {
    "message_id": "scheduled-xxx",
    "greeting": "Good morning! ☀️",
    "content": {
      "summary": "...",
      "highlights": ["🌧️ High chance of rain...", "..."],
      "recommendations": ["👕 Light clothing...", "..."],
      "warnings": []
    },
    "weather_snapshot": {...},
    "quick_actions": [...],
    "conversation_starters": [...]
  }
}
```

## 🎮 Chat UI Components

### Message Types

1. **Text Message** - Обычное текстовое сообщение
2. **Weather Card** - Прогноз погоды
3. **Route Preview** - Предпросмотр маршрута
4. **Alert Summary** - Сводка alerts
5. **Navigation Prompt** - Предложение перейти на страницу
6. **Quick Actions** - Кнопки быстрых действий

### Example Usage

```typescript
import { WeatherForecastCard } from '@/components/chat/WeatherForecastCard';
import { RoutePreviewCard, AlertSummaryCard } from '@/components/chat/RouteAndAlertCards';
import { ActionButtons, NavigationPrompt, TypingIndicator } from '@/components/chat/ChatActions';

// In your chat component
<div className="message">
  <p>{message.text}</p>
  
  {message.weather && (
    <WeatherForecastCard
      forecast={message.weather}
      location={message.location}
      compact={true}
    />
  )}
  
  {message.intent?.navigation && (
    <NavigationPrompt
      page={message.intent.navigation.page}
      title="Plan Your Route"
      description="I can help you create a detailed route"
      params={message.intent.navigation.params}
    />
  )}
  
  {message.suggestions && (
    <ActionButtons
      actions={message.suggestions}
      onActionClick={(action) => handleAction(action)}
    />
  )}
</div>
```

## 🔧 Intent Detection System

### Supported Intents

| Intent Type | Trigger Patterns | Navigation |
|-------------|-----------------|------------|
| `create_route` | "хочу поехать в X", "маршрут из X в Y" | `/route?from=X&to=Y` |
| `view_forecast` | "какая погода", "прогноз на неделю" | `/forecast` |
| `check_alerts` | "проверь alerts", "есть предупреждения" | `/alerts` |
| `view_map` | "открой карту", "покажи map" | `/forecast/map` |
| `behavior_prediction` | "поведение", "prediction" | `/forecast/behavior` |
| `settings` | "настройки", "settings" | `/settings` |
| `emergency_sos` | "помощь", "emergency", "SOS" | `/sos` |

### Cities Database

Поддерживаемые города:
- Astana, Астана
- Almaty, Алматы
- Shymkent, Шымкент
- Karaganda, Караганда
- Aktobe, Актобе
- Taraz, Тараз
- Pavlodar, Павлодар
- Semey, Семей
- Atyrau, Атырау
- Kostanay, Костанай
- Kyzylorda, Кызылорда
- Aktau, Актау
- Burabay, Бурабай
- Borovoe, Боровое

## 🎯 Testing Workflow

### 1. Test Context API
```bash
curl http://localhost:3000/api/chat/context?lat=51.1694&lng=71.4491
```

### 2. Test Intent Detection
**Chat message:** "Я хочу съездить из Астаны в Алматы"

**Expected:**
- Intent: `create_route`
- Navigation: `/route?from=Астана&to=Алматы`
- Action command: `CREATE_ROUTE|Астана|Алматы`

### 3. Test Scheduled Briefing
```bash
curl -X POST http://localhost:3000/api/chat/scheduled \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "trigger_time": "2025-10-05T08:00:00Z",
    "trigger_type": "daily_briefing"
  }'
```

### 4. Test Chat UI
1. Откройте `http://localhost:3000/chat`
2. Напишите: "Я хочу поехать в Алматы"
3. Проверьте:
   - ✅ AI понял намерение
   - ✅ Показал RoutePreviewCard
   - ✅ Предложил NavigationPrompt
   - ✅ Кнопка ведет на `/route?to=Алматы`

## 🚀 Production Deployment

### Environment Variables
```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=https://your-domain.com
CLERK_SECRET_KEY=...
```

### Build & Deploy
```bash
npm run build
npm start
```

### Service Worker Integration
Для scheduled messages настройте Service Worker:

```javascript
// public/sw.js
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-briefing') {
    event.waitUntil(fetchAndShowBriefing());
  }
});

async function fetchAndShowBriefing() {
  const response = await fetch('/api/chat/scheduled', {
    method: 'POST',
    body: JSON.stringify({
      trigger_type: 'daily_briefing',
      trigger_time: new Date().toISOString()
    })
  });
  
  const { message } = await response.json();
  
  await self.registration.showNotification(message.greeting, {
    body: message.content.summary,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: { url: '/chat' }
  });
}
```

## 📊 Performance Tips

1. **Lazy Load Components**
```typescript
const WeatherForecastCard = dynamic(() => import('@/components/chat/WeatherForecastCard'));
```

2. **Debounce API Calls**
```typescript
const debouncedSendMessage = useMemo(
  () => debounce(sendMessage, 500),
  []
);
```

3. **Cache Context Data**
```typescript
const { data: context } = useSWR('/api/chat/context', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 300000 // 5 minutes
});
```

## 🐛 Troubleshooting

### Issue: No context loaded
**Solution:** Check if user is authenticated and location is set

### Issue: Intent not detected
**Solution:** Add more patterns to `intent-detector.ts`

### Issue: Navigation not working
**Solution:** Verify route exists in Next.js routing

### Issue: Streaming not working
**Solution:** Check if API route returns proper Response with `text/event-stream`

## 🎉 Success Indicators

✅ Context API returns 200 with full data
✅ Intent detection accuracy > 80%
✅ Chat responds within 2 seconds
✅ Navigation redirects work correctly
✅ Scheduled messages arrive on time
✅ Rich components render properly
✅ Build completes with 0 errors

---

**Разработано для NASA Space Apps Challenge 2024**
**ResQ - AI-Powered Disaster Prevention & Weather Intelligence System**
