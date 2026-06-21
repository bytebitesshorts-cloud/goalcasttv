# GoalCast Android App

The GoalCast mobile app built with React Native (Expo).  
Connects to your existing GoalCast backend at `https://goalcast-tv.vercel.app`.

## Features
- 🏟️ Live match cards with team logos & sport category filter
- 📺 Stream player with multiple server switcher (Server 1, 2, 3...)
- 📢 15-second interstitial ad before each match (admin-controlled)
- 📡 All Channels tab (full GoalCast website embedded)
- 🔄 Auto-refreshes every 30 seconds

## Setup

```bash
cd goalcast-app
npm install
npx expo start
```

## Build Android APK

1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Build APK: `eas build --platform android --profile preview`
4. Download and share the `.apk` file

## Admin Control (via goalcast-tv.vercel.app/admin)

- **App Matches** — Add/edit live matches with multiple stream servers
- **App Ad Settings** — Set the ad image URL, ad click URL, and auto-close duration

## API Endpoints (public)
- `GET /api/app/matches` — Live matches list
- `GET /api/app/config` — App ad configuration
