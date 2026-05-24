# NYOMNYOM — Mobile

Expo (React Native) mobile client for the NYOMNYOM personal dashboard.
Talks to the same Flask backend as the web app (`nyomnyom_server/`).

## Stack

- Expo ~52 / React Native 0.76
- React Navigation 6 (bottom tabs + native stack)
- Same API surface as `nyomnyom_server/` — all routes under `/api/`

## Running

```bash
# from nyomnyom_mobile/
npm install
npm start        # opens Expo Go QR code
```

Point a physical device at the QR code using the Expo Go app, or press
`a` / `i` for Android/iOS simulator.

**Dev server URL**: update `BASE_URL` in `src/api.js` to your machine's LAN IP
(e.g. `http://192.168.1.x:5000`) — the phone cannot reach `localhost`.

## Before implementing screens

### 1. Resolve auth / cookie handling
Flask uses server-side session cookies. React Native's `fetch` with
`credentials: "include"` does not persist cookies between requests on native.
Pick one approach before touching any screen:

- **Option A** — `react-native-cookies` (cookie jar that works with fetch)
- **Option B** — Switch to token-based auth on the server (add a
  `/api/auth/token` endpoint returning a JWT, send as `Authorization` header)
- **Option C** — `expo-secure-store` to manually save and re-send the cookie

### 2. Choose an icon library
The web app uses pixelarticons (SVG via vite-plugin-svgr — not portable to RN).
Options for mobile:
- `@expo/vector-icons` — already bundled with Expo, many icon sets
- `react-native-vector-icons` — wider selection, needs native linking

### 3. Charts
The web uses a hand-rolled SVG `AreaChart`. On native use one of:
- `react-native-svg` + custom paths (closest to the web version)
- `victory-native` — higher-level, easier

### 4. Design direction
No mountain map or CRT terminal on mobile. Decide on:
- Light vs dark theme (or system-adaptive)
- Type: the web uses Share Tech Mono / Press Start 2P — both work on mobile
  via `expo-font`, but consider readability on small screens

## Structure

```
nyomnyom_mobile/
├── App.jsx                  # Entry — wraps all context providers + Navigation
├── src/
│   ├── api.js               # apiFetch wrapper (update BASE_URL for dev)
│   ├── navigation/index.jsx # Auth stack + bottom tab navigator
│   ├── context/
│   │   ├── AuthContext.jsx      # Done (needs cookie/token TODO resolved)
│   │   ├── AppContext.jsx       # TODO — adapt from nyomnyom_web
│   │   ├── JobContext.jsx       # TODO
│   │   ├── FitnessContext.jsx   # TODO
│   │   ├── PortfolioContext.jsx # TODO
│   │   ├── ClimbingContext.jsx  # TODO
│   │   ├── ProjectsContext.jsx  # TODO
│   │   └── HydroContext.jsx     # TODO
│   └── screens/
│       ├── SignIn.jsx                         # Stub — needs design + register flow
│       ├── spending/SpendingScreen.jsx        # Stub
│       ├── jobs/JobsScreen.jsx                # Stub
│       ├── fitness/FitnessScreen.jsx          # Stub
│       ├── portfolio/PortfolioScreen.jsx      # Stub
│       ├── climbing/ClimbingScreen.jsx        # Stub
│       ├── projects/ProjectsScreen.jsx        # Stub
│       └── hydro/HydroScreen.jsx              # Stub
```
