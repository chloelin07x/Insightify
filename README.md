# Insightify

A Spotify-connected web app that turns your listening activity into mood insights — built for **BathHack**.

Log in with Spotify and get a dashboard of your recent listening, visual breakdowns of your mood trends, and a forecast of where your mood's headed next.

## Features

**Dashboard**
- Spotify OAuth login
- Live profile info (name, photo, follower count) and your 5 most recent unique tracks
- In-browser playback via the Spotify Web Playback SDK — play/pause, skip forward/back, right from the track list
- At-a-glance listening stats: tracks played today, your most active time of day, and top artist

**Mood Chart**
- Line chart of happiness and energy over time (Chart.js), toggleable between weekly and monthly views
- Hover tooltips surface the top tracks behind each data point
- Summary cards for happiest day, most energetic day, and tracks analysed

**Mood Summary**
- A happiness × energy quadrant scatter plot, splitting your tracks into Happy, Intense, Calm, and Melancholic
- Dominant mood card with a plain-language description
- Percentage breakdown across all four quadrants

**Mood Predict**
- Forecasts your next happiness/energy reading using a weighted moving average, with oscillation detection to catch swingy listening patterns
- Recharts line graph showing the trend plus the predicted next point
- Genre and artist recommendations matched to the predicted mood (9 mood combinations, from "Energised & Happy" to "Melancholic")

**Throughout**
- Smooth page transitions via Framer Motion

## Tech stack

- **Frontend**: React 19, React Router
- **Charts**: Chart.js + react-chartjs-2 (line, scatter), Recharts (prediction chart)
- **Animation**: Framer Motion
- **Playback**: Spotify Web Playback SDK
- **Auth**: Spotify OAuth
- **Build tooling**: Vite
- **Deployment**: Netlify

## Pages

| Route | Description |
|---|---|
| `/login`, `/callback` | Spotify OAuth flow |
| `/dashboard` | Profile, recent tracks, playback, listening stats (protected route) |
| `/moodchart` | Happiness/energy trend over time |
| `/moodsummary` | Mood quadrant breakdown |
| `/moodpredict` | Forecast + music recommendations |

## Current status

The Dashboard is fully live — profile and recently-played data come straight from the Spotify API. The Mood Chart, Summary, and Predict pages are currently running on sample data (`MoodTestData.jsx`) rather than audio features pulled per-track from Spotify, so the next step is wiring those up to Spotify's audio-features endpoint (valence, energy, tempo) for real listening history.

## Getting started

```bash
git clone <repo-url>
cd bathHack2026
npm install
npm run dev
```

The dev server runs at `http://127.0.0.1:5173`.

You'll need a [Spotify Developer](https://developer.spotify.com/dashboard) app for a client ID/secret and registered redirect URI, plus Spotify Premium for Web Playback SDK support.

Other scripts:

```bash
npm run build     # production build
npm run lint       # eslint
npm run preview    # preview the production build locally
npm run deploy     # build and deploy to Netlify
```

## Team

Built at BathHack by [add teammates' names/GitHub handles here].
