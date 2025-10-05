# ResQ Testing Guide

## Completed Features ✅

### 1. **Emergency Alert System**
- ✅ Real USGS earthquake data integration
- ✅ Emergency alert pages with dynamic routing
- ✅ Alert details with safety instructions
- ✅ Filter alerts by type (earthquake, tsunami, fire, flood)
- ✅ Clerk authentication fixed for public access

**Test:**
```
1. Go to /dashboard
2. Click on any emergency alert
3. View details on /alerts/[id]
4. Filter by type on /alerts/type/[type]
```

### 2. **Emergency Map** 
- ✅ Green/white/black dashboard design
- ✅ Family member tracking with status indicators
- ✅ Emergency zones with severity circles
- ✅ Notification radius control (10-200km)
- ✅ Location Status with city/country + coordinates
- ✅ Integrated reverse geocoding

**Test:**
```
1. Go to /emergency/map
2. View family locations on map
3. Adjust notification radius slider
4. Check Location Status shows: "Pavlodar, Kazakhstan" + coordinates
5. Click phone/navigate buttons for family members
```

### 3. **Emergency ChatGPT** 🆕
- ✅ AI-powered emergency assistant with GPT-4
- ✅ Emergency type selector (earthquake, tsunami, fire, flood, medical, accident)
- ✅ Severity levels (extreme, severe, moderate, minor)
- ✅ Official emergency instruction sources:
  - 🔴 Red Cross guidelines
  - 🇺🇸 FEMA/Ready.gov
  - 🌍 USGS Earthquake info
  - 🇰🇿 Kazakhstan Emergency Ministry
- ✅ Emergency instructions with step-by-step actions
- ✅ Safety tips
- ✅ Video guides (YouTube links)
- ✅ Rescue call scripts for 112
- ✅ Quick actions: Call 112, Share instructions

**Test:**
```
1. Go to /emergency/chat
2. Select emergency type (e.g., earthquake)
3. AI automatically generates:
   - Emergency notification message
   - Step-by-step instructions
   - Safety tips
   - Video recommendations
   - Official source links
   - Rescue call script
4. Ask custom questions like:
   - "What should I do during aftershocks?"
   - "How to help injured person?"
   - "Where are evacuation shelters?"
5. Click "Call 112" button
6. Click "Share" to copy instructions
```

### 4. **Emergency QR Code System** 🆕
- ✅ Medical information form
- ✅ Emergency contacts management
- ✅ QR code generation with all emergency data
- ✅ Download QR as PNG
- ✅ Share QR code
- ✅ First responder scannable format

**Test:**
```
1. Go to /settings
2. Click "Emergency" tab
3. Fill in medical info:
   - Blood Type (A+, O-, etc.)
   - Passport Number
   - Medical Conditions
   - Allergies
   - Medications
4. Add emergency contacts:
   - Name, Phone, Relationship
5. Click "Save & Generate QR Code"
6. QR code appears - Download or Share
7. Scan QR with phone camera to verify data
```

### 5. **Weather Display Fixes**
- ✅ Wttr.in precipitation display fixed
- ✅ Wind speed now showing (m/s)
- ✅ Enhanced weather data: Temp + Rain + Wind + Humidity

**Test:**
```
1. Go to /forecast/map
2. Check bottom info bar shows:
   "wttr.in: 15°C • 0.5mm rain • 3.2 m/s wind • 65% RH"
3. Verify all 4 metrics are displayed
```

### 6. **Geolocation Improvements**
- ✅ Dashboard shows location name + coordinates
- ✅ Format: "Pavlodar, Kazakhstan" + "52.2873°, 76.9674°"
- ✅ Reverse geocoding via Nominatim API

**Test:**
```
1. Go to /dashboard
2. Look at "Location Status" card
3. Should show:
   - City name (e.g., "Pavlodar, Kazakhstan")
   - Coordinates below
   - "Location tracking active" badge
```

### 7. **Push Notification Fix**
- ✅ Fixed VAPID key undefined error
- ✅ Proper error handling when VAPID not configured
- ✅ Console warnings instead of crashes

**Test:**
```
1. Go to /settings
2. Click "Notifications" tab
3. Try enabling push notifications
4. Should not crash (may warn if VAPID key missing)
```

### 8. **Accessibility Fix**
- ✅ Fixed DialogTitle warning in sheet.tsx
- ✅ Added VisuallyHidden wrapper for navigation menu
- ✅ Screen reader accessible

**Test:**
```
1. Open mobile menu (hamburger icon)
2. No console warnings about DialogTitle
3. Screen readers can access menu title
```

---

## Testing Emergency Notification API

### API Endpoint: `/api/emergency/notifications`

**POST Request Example:**
```json
{
  "emergencyType": "earthquake",
  "severity": "severe",
  "location": {
    "lat": 52.2873,
    "lng": 76.9674,
    "address": "Pavlodar, Kazakhstan"
  },
  "language": "en",
  "autoCallRescue": true,
  "customPrompt": "What should I do right now?"
}
```

**Response Includes:**
- `notificationMessage`: Urgent SMS-length message
- `emergencyInstructions`: 5-7 step-by-step actions
- `safetyTips`: Critical safety information
- `videos`: YouTube tutorial links
- `officialInstructions`: Links to Red Cross, FEMA, USGS, Kazakhstan Ministry
- `rescueCallInfo`: Phone number (112) + script + alternative numbers
- `locationSharing`: Google Maps, WhatsApp, SMS links
- `emergencyContacts`: Auto-generated notification messages

**GET Request:**
```
GET /api/emergency/notifications
```

Returns configuration with:
- Emergency types list
- Severity levels
- Supported languages (en, ru, kk)
- Emergency numbers
- Available videos
- Official sources
- Feature flags

---

## Manual Testing Checklist

### Emergency Chat Testing
- [ ] Load /emergency/chat
- [ ] Select earthquake type
- [ ] Initial AI message appears with instructions
- [ ] Ask "What should I pack in emergency bag?"
- [ ] Verify response includes:
  - [ ] Emergency instructions list
  - [ ] Safety tips
  - [ ] Video links (clickable)
  - [ ] Official sources (Red Cross, FEMA, etc.)
- [ ] Click official source links - open in new tab
- [ ] Click "Call 112" button - initiates call
- [ ] Click "Share" button - copies/shares instructions
- [ ] Switch to "tsunami" type
- [ ] Verify instructions change appropriately

### QR Code Testing
- [ ] Go to Settings > Emergency tab
- [ ] Select blood type "O+"
- [ ] Enter passport "N12345678"
- [ ] Enter conditions "Diabetes"
- [ ] Enter allergies "Penicillin"
- [ ] Enter medications "Insulin"
- [ ] Add emergency contact:
  - Name: "John Doe"
  - Phone: "+77771234567"
  - Relationship: "Brother"
- [ ] Click "Save & Generate QR Code"
- [ ] QR code appears
- [ ] Click "Download" - saves as PNG
- [ ] Click "Share" - opens share dialog
- [ ] Scan QR with phone camera
- [ ] Verify JSON data contains all fields

### Emergency Map Testing
- [ ] Go to /emergency/map
- [ ] Verify design: white cards, green accents, black text
- [ ] Check statistics cards: Tracked, Safe, At Risk, Zones
- [ ] Move notification radius slider
- [ ] Verify Location Status shows city name + coordinates
- [ ] Click family member phone icon - initiates call
- [ ] Click navigate icon - map centers on member
- [ ] Verify emergency zones (red circles) on map
- [ ] Check legend colors match severity

### Weather Display Testing
- [ ] Go to /forecast/map
- [ ] Wait for wttr.in data to load
- [ ] Check info bar at bottom
- [ ] Verify shows: "wttr.in: [temp]°C • [rain]mm rain • [wind] m/s wind • [humidity]% RH"
- [ ] All 4 metrics should be visible

---

## Known Issues / Limitations

1. **VAPID Key**: Push notifications require `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in `.env.local`
2. **OpenAI Key**: Emergency Chat requires `OPENAI_API_KEY` in `.env.local`
3. **Rate Limits**: wttr.in has rate limits, may fail with many requests
4. **QR Code**: Works best with scanning apps that support JSON in QR codes
5. **Geolocation**: Requires browser permission for location access

---

## Environment Variables Required

```env
# .env.local

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenAI (for Emergency Chat)
OPENAI_API_KEY=sk-proj-...

# Push Notifications (optional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...

# Database (if using)
DATABASE_URL=postgresql://...
```

---

## Emergency Numbers Reference

### Kazakhstan
- **112** - Unified Emergency Service
- **101** - Fire Service
- **102** - Police
- **103** - Ambulance
- **104** - Gas Emergency

### Official Sources
- **Red Cross**: https://www.redcross.org
- **FEMA**: https://www.ready.gov
- **USGS**: https://www.usgs.gov/programs/earthquake-hazards
- **Kazakhstan Ministry**: https://emer.gov.kz

---

## Next Steps

1. **Test all emergency features** with real data
2. **Configure OpenAI API** for Emergency Chat
3. **Test QR codes** with multiple devices
4. **Verify geocoding** works in different locations
5. **Test push notifications** with VAPID keys
6. **Performance testing** for map with many alerts
7. **Localization testing** (English, Russian, Kazakh)

---

## Support

For issues or questions:
- Check console for errors
- Verify environment variables are set
- Test with different browsers
- Clear localStorage if seeing cached data
- Check network tab for API failures
