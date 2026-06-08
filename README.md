# NYOMNYOM — Mobile

Expo (React Native) mobile client for the NYOMNYOM personal dashboard. CRT terminal aesthetic with swappable phosphor palettes, horizontal section pager, and bottom tab navigation. Talks to the same Flask backend as the web app (`nyomnyom_server/`).

## Stack

- Expo ~54 / React Native 0.81 / TypeScript
- Zustand for state (auth, palette, font, hydrated flag)
- `expo-secure-store` for session token persistence
- `expo-haptics` for tactile feedback
- `expo-image-picker` for climbing photo uploads
- `react-native-svg` for charts (AreaSpark, Bars, GradePyramid)
- `expo-font` — JetBrains Mono, IBM Plex Mono, Fira Code
- EAS Build for production `.aab` / Play Store delivery

## Running locally

```bash
# from nyomnyom_mobile/
npm install
npm start        # opens Expo Go QR code
```

Point a physical device at the QR code using the Expo Go app, or press `a` for Android emulator.

**Dev server URL**: update `BASE_URL` in `src/api/config.ts` to your machine's LAN IP (e.g. `http://192.168.1.x:5000`) — the phone cannot reach `localhost`.

## Building for production

```bash
# requires EAS CLI + Expo account
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

EAS builds in the cloud and produces a signed `.aab` ready for Play Store upload. Keystore is managed by Expo (stored securely on EAS servers).

## Project structure

```
nyomnyom_mobile/
├── App.tsx                        # Entry — font loading, splash, SectionPager root, sheet state
├── app.json                       # Expo config: bundle ID com.nyomnyom.app, fonts plugin, splash
├── eas.json                       # EAS build profiles (development / preview / production)
├── assets/
│   ├── fonts/                     # JetBrainsMono, IBMPlexMono, FiraCode
│   ├── icon.png                   # 1024×1024 app icon
│   ├── adaptive-icon.png          # Android adaptive icon foreground
│   └── splash.png                 # Splash screen
└── src/
    ├── api/
    │   ├── config.ts              # BASE_URL constant
    │   ├── client.ts              # apiFetch wrapper with session token header
    │   ├── index.ts               # typed API calls for all endpoints
    │   └── mappers.ts             # API response → typed domain objects
    ├── components/crt/
    │   ├── Box.tsx                # CRT panel with phosphor border + glow
    │   ├── BlockBar.tsx           # progress bar component
    │   ├── CRTScreen.tsx          # full-screen CRT wrapper with scanlines
    │   ├── Fab.tsx                # floating action button
    │   ├── PixelIcon.tsx          # icon renderer (text-based pixel icons)
    │   ├── PullToRefresh.tsx      # pull-to-refresh wrapper
    │   ├── Sheet.tsx              # bottom sheet modal
    │   ├── SubTabs.tsx            # tab row
    │   ├── Toasts.tsx             # toast notification overlay
    │   └── charts/
    │       ├── AreaSpark.tsx      # SVG area sparkline
    │       ├── Bars.tsx           # SVG bar chart
    │       └── GradePyramid.tsx   # climbing grade pyramid chart
    ├── data/
    │   └── types.ts               # all domain types (Expense, Workout, Climb, etc.)
    ├── native/
    │   └── haptics.ts             # expo-haptics wrappers (light / medium / success)
    ├── navigation/
    │   ├── SectionPager.tsx       # horizontal swipe pager between sections
    │   ├── TabBar.tsx             # bottom tab bar with section indicators
    │   ├── MoreSheet.tsx          # overflow sheet (profile, settings)
    │   ├── CommandStrip.tsx       # command shortcut strip
    │   └── CommandTerminal.tsx    # slash-command terminal launcher
    ├── screens/
    │   ├── LoginScreen.tsx        # auth form with boot-sequence animation
    │   ├── HomeScreen.tsx         # dashboard: stats, hydro live, jobs pipeline
    │   ├── SpendingScreen.tsx     # dashboard + expense list + categories
    │   ├── FitnessScreen.tsx      # workouts + body metrics + running log
    │   ├── ClimbingScreen.tsx     # climb log with grade pyramid
    │   ├── HydroScreen.tsx        # sensor readings, pump control, plants
    │   ├── JobsScreen.tsx         # kanban pipeline + contacts
    │   ├── PortfolioScreen.tsx    # projects, skills, experience, about
    │   ├── ProjectsScreen.tsx     # dev projects + kanban board
    │   ├── ProfileScreen.tsx      # profile settings sheet
    │   └── sheets/
    │       ├── AddExpenseSheet.tsx
    │       ├── LogWorkoutSheet.tsx
    │       ├── LogSendSheet.tsx        # log a climb send
    │       ├── AddApplicationSheet.tsx
    │       ├── AddTaskSheet.tsx
    │       └── LogDoseSheet.tsx        # log a hydro dose
    ├── state/
    │   ├── store.ts               # Zustand store: auth, palette, font, hydrated
    │   └── seed.ts                # initial state seeds
    ├── theme/
    │   ├── palettes.ts            # green / amber / cyan phosphor palettes
    │   ├── ThemeProvider.tsx      # context + CSS-var equivalent (StyleSheet vars)
    │   └── type.ts                # theme type definitions
    └── utils/
        └── format.ts              # fmt, fmtDate, fmtDuration helpers
```

## API

All calls go to `BASE_URL/api/` — same endpoints as the web frontend. Auth uses a session token stored in `expo-secure-store`, sent as a header on every request. See `src/api/client.ts` for the fetch wrapper.
