# 🚨 EMERGENCY CHAT REBUILD - COMPLETE

## ✅ ЧТО СОЗДАНО

### 1. **Zustand Store для Emergency Chat**
**Файл:** `lib/store/useEmergencyChatStore.ts`

**Функционал:**
- Управление conversations (как в forecast/ai)
- 6 типов emergency: earthquake, fire, flood, medical, accident, evacuation
- Severity levels: low, medium, high, critical
- Messages с metadata (official links, videos, emergency numbers)
- CRUD операции: create, set, add message, clear, delete

**Типы:**
```typescript
EmergencyType = 'earthquake' | 'fire' | 'flood' | 'medical' | 'accident' | 'evacuation'
EmergencyConversation = {
  id, type, title, severity, messages[], createdAt, updatedAt, location?
}
EmergencyMessage = {
  id, role, content, timestamp, metadata?
}
```

---

### 2. **Emergency Chat Hub** (Главная страница)
**Файл:** `app/chatgpt/page.new.tsx` ⚠️ **ТРЕБУЕТ ПЕРЕИМЕНОВАНИЯ в `page.tsx`**

**Дизайн:**
- 🎨 Красно-оранжевый gradient (emergency theme)
- 📞 Анимированная кнопка "CALL 112 - EMERGENCY"
- 🕒 Recent Conversations (последние 3)
- 🎯 6 Emergency Scenario Cards с:
  - Цветовыми иконками
  - Severity badges (CRITICAL, HIGH, MEDIUM, LOW)
  - Quick Tips (3 совета)
  - Emergency Numbers (кнопка звонка)
  - "Get AI Assistance" button
- ℹ️ Info Box "How It Works"

**Функционал:**
- Создание новой conversation при клике на scenario
- Переход на `/chatgpt/[type]`
- Открытие существующих conversations
- Прямой звонок на emergency numbers (tel: links)

**UX как в forecast/ai:**
- Card-based layout
- Hover эффекты
- Smooth transitions
- Responsive design

---

### 3. **Dynamic Emergency Chat Page**
**Файл:** `app/chatgpt/[type]/page.tsx` ✅ **ГОТОВ**

**Дизайн:**
- Sticky header с типом emergency
- Gradient message bubbles (цвет зависит от типа)
- Sticky input внизу
- AI response с Official Resources и Video Guides

**Функционал:**
- Auto-generate initial AI response
- Real-time chat с Emergency API
- Formatted AI responses:
  - 🚨 IMMEDIATE ACTIONS
  - ⏱️ NEXT STEPS
  - ✅ SAFETY TIPS
  - 📞 RESCUE CALL SCRIPT
- Official Links с внешними ресурсами
- Video Guides (YouTube)
- Emergency call button (112) в header

**Конфигурация для каждого типа:**
```typescript
earthquake: {
  icon: AlertTriangle,
  color: orange,
  gradient: orange-red,
  officialLinks: [Red Cross, USGS, FEMA],
  videos: ['Drop Cover Hold', 'Safety Tips']
}
// + fire, flood, medical, accident, evacuation
```

---

## 🔧 КАК УСТАНОВИТЬ

### Шаг 1: Переименуйте файлы

```powershell
# В PowerShell
cd C:\projects\nasa-challenge\resq\app\chatgpt

# Backup старого файла
Rename-Item "page.tsx" "page.backup.tsx"

# Активируйте новый файл
Rename-Item "page.new.tsx" "page.tsx"
```

### Шаг 2: Проверьте структуру

```
app/chatgpt/
  ├── page.tsx              ← NEW Hub page
  ├── page.old.tsx          ← OLD backup
  ├── page.backup.tsx       ← BACKUP старого page.tsx
  └── [type]/
      └── page.tsx          ← NEW Chat page
```

### Шаг 3: Restart dev server

```powershell
cd C:\projects\nasa-challenge\resq
npm run dev
```

---

## 🎯 КАК ИСПОЛЬЗОВАТЬ

### User Flow:

1. **Открыть** `/chatgpt` → Emergency Chat Hub
2. **Выбрать** scenario card (например, "Earthquake")
3. **Перейти** на `/chatgpt/earthquake` → AI Chat page
4. **Получить** auto-generated AI response
5. **Задать** follow-up вопросы
6. **Открыть** official links & videos
7. **Позвонить** 112 если нужно

### Преимущества:

✅ **Как forecast/ai:** Card-based UI, transitions, conversation history
✅ **Emergency-focused:** Quick actions, emergency numbers, severity badges
✅ **AI-powered:** GPT-4 responses с официальными источниками
✅ **Responsive:** Mobile-first design
✅ **Accessible:** Clear hierarchy, readable text, ARIA labels

---

## 📋 COMPARISON: Old vs New

### OLD /chatgpt:
- ❌ Single page chat
- ❌ Generic AI assistant
- ❌ No emergency context
- ❌ No scenario selection
- ❌ No official resources
- ❌ No emergency numbers

### NEW /chatgpt:
- ✅ Hub + Dynamic pages
- ✅ Emergency specialist
- ✅ 6 emergency types
- ✅ Scenario cards with tips
- ✅ Official links & videos
- ✅ Emergency call buttons
- ✅ Severity badges
- ✅ Recent conversations
- ✅ Formatted AI responses

---

## 🎨 DESIGN SYSTEM

### Colors:
- **Earthquake:** Orange `#EA580C`
- **Fire:** Red `#DC2626`
- **Flood:** Blue `#2563EB`
- **Medical:** Pink `#DB2777`
- **Accident:** Purple `#9333EA`
- **Evacuation:** Green `#16A34A`

### Components:
- **Cards:** `rounded-2xl shadow-sm border-2`
- **Buttons:** `rounded-xl font-bold`
- **Badges:** `rounded-full px-3 py-1`
- **Gradients:** `bg-gradient-to-r from-{color}-500 to-{color2}-500`

### Icons (lucide-react):
- AlertTriangle (earthquake)
- Flame (fire)
- Droplets (flood)
- Heart (medical)
- Car (accident)
- MapPin (evacuation)

---

## 🔗 API INTEGRATION

### Endpoint:
`POST /api/emergency/notifications`

### Request:
```json
{
  "emergencyType": "earthquake",
  "severity": "critical",
  "location": { "lat": 51.1694, "lng": 71.4491, "name": "Astana" },
  "language": "en",
  "customQuestion": "What should I do during an earthquake?"
}
```

### Response:
```json
{
  "emergencyInstructions": ["Drop", "Cover", "Hold On", ...],
  "safetyTips": ["Stay away from windows", ...],
  "rescueCallInfo": {
    "script": "Tell dispatcher: earthquake, location, injuries"
  },
  "officialInstructions": {
    "sources": [{ "title": "Red Cross", "url": "..." }]
  },
  "videos": [{ "title": "Drop Cover Hold", "url": "..." }]
}
```

---

## 🚀 NEXT STEPS (Optional Enhancements)

### 1. **Voice Input** 🎤
- Add Web Speech API
- Voice-to-text for hands-free emergency
- Useful when typing is difficult

### 2. **Location Auto-detect** 📍
- Use navigator.geolocation
- Auto-fill location in API calls
- Show nearest shelters

### 3. **Offline Mode** 📴
- Cache emergency instructions
- Service Worker с offline responses
- Critical для real emergencies

### 4. **Share Conversation** 📤
- Export chat as PDF
- Share via WhatsApp/SMS
- Send to family members

### 5. **Multi-language** 🌍
- Russian translation
- Kazakh translation
- Auto-detect from browser

### 6. **Emergency Contacts** 📞
- Add custom contacts from Settings
- Quick call buttons per scenario
- Auto-notify family when emergency starts

---

## 📞 EMERGENCY NUMBERS (Kazakhstan)

- **112** - Unified Emergency Number
- **101** - Fire Service
- **102** - Police
- **103** - Ambulance
- **104** - Gas Service

---

## ✅ TESTING CHECKLIST

### Manual Testing:

- [ ] Open `/chatgpt` → Hub loads
- [ ] Click "Earthquake" → Creates conversation
- [ ] Navigate to `/chatgpt/earthquake` → Chat page loads
- [ ] Auto AI response appears
- [ ] Type follow-up question → AI responds
- [ ] Click "CALL 112" → Opens tel: link
- [ ] Click official link → Opens in new tab
- [ ] Click video → Opens YouTube
- [ ] Go back → Recent conversations shows
- [ ] Click recent → Reopens same conversation
- [ ] Responsive on mobile

### Error Scenarios:

- [ ] No OPENAI_API_KEY → Shows error message
- [ ] API fails → Shows fallback message
- [ ] Navigate without conversation → Shows "No Active Emergency"
- [ ] Invalid emergency type → Shows error

---

## 📝 NOTES

1. **Store is persistent** - conversations сохраняются в памяти (Zustand)
2. **Auto-response** - первое AI сообщение генерируется автоматически
3. **Severity affects prompt** - GPT получает severity для контекста
4. **Official sources** - links к Red Cross, FEMA, USGS, WHO
5. **Videos** - placeholder URLs (замените на реальные)

---

## 🎉 RESULT

Теперь `/chatgpt` это полноценный **Emergency Chat Hub** с:
- Красивым UI как в forecast/ai
- 6 типами emergencies
- AI-powered guidance
- Official resources
- Emergency call buttons
- Conversation history
- Dynamic routing

**Готово к использованию!** 🚨
