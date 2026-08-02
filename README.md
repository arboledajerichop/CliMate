# CliMate

**See the weather. Plan better.**

CliMate is a responsive, installable weather app that turns live forecasts into animated scenes, immersive ambient sound, and practical guidance for the day ahead. It works worldwide, with an additional official PAGASA tropical-cyclone section for locations in the Philippines.

## Highlights

- Live current conditions powered by Open-Meteo
- Search for cities worldwide or use the device's current location
- Interactive 24-hour **Day in Motion** timeline and seven-day outlook
- Weather- and time-aware animated student scenes for clear, cloudy, windy, rainy, stormy, and snowy conditions
- Morning, daytime, sunset, and night scenery
- Optional Web Audio soundscapes with rain intensity, wind, leaves, birds, crickets, owls, frogs, and other environmental details
- Condition-aware preventive measures, dos and don'ts, and useful reminders
- Saved and recently viewed locations
- Celsius and Fahrenheit support
- Official PAGASA tropical-cyclone bulletins for the Philippines, including movement, strength, track images, wind signals, and source links when available
- Installable Progressive Web App with an offline app shell
- Responsive layout, keyboard support, and reduced-motion support

## Technology and data sources

- React 19 and Vite 8
- Web Audio API for locally generated ambient sound
- [Open-Meteo](https://open-meteo.com/) for worldwide weather forecasts and location search
- [PAGASA](https://www.pagasa.dost.gov.ph/) public tropical-cyclone bulletin pages through a server-side adapter
- BigDataCloud for reverse geocoding
- Vercel for the production site and PAGASA serverless function

CliMate does not use AI chat, user accounts, a database, or private API keys.

## Requirements

- Node.js 20.19 or newer, or Node.js 22.12 or newer
- npm

## Run locally

```bash
git clone https://github.com/arboledajerichop/CliMate.git
cd CliMate
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. The local Vite middleware also provides `/api/pagasa`, so the Philippine bulletin section can be tested without Vercel CLI or environment variables.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Create the production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Check the source with ESLint. |

## Deploy to Vercel

1. Import the `CliMate` GitHub repository into Vercel.
2. Keep the framework preset set to **Vite**.
3. Deploy. No environment variables are required.

The included [`vercel.json`](./vercel.json) builds the Vite app into `dist`. Vercel automatically serves [`api/pagasa.mjs`](./api/pagasa.mjs) as `/api/pagasa`.

## Project structure

```text
api/
  pagasa.mjs          Vercel serverless entry point
server/
  pagasa.mjs          PAGASA reader, normalizer, cache, and fallback handling
src/
  components/         Forecasts, animated scenery, guidance, navigation, and PWA UI
  services/           Weather, location search, reverse geocoding, and PAGASA requests
  utils/              Weather-code, local-time, scene, and wind helpers
public/                CliMate logo and installable-app icons
vite.config.js         Vite, PWA, and local PAGASA middleware configuration
vercel.json            Vercel build configuration
```

## Data, privacy, and limitations

- Saved locations, recent locations, temperature units, and sound volume stay in the user's browser.
- Ambient sounds are synthesized locally and do not stream audio files.
- PAGASA does not currently provide a documented public tropical-cyclone API. The server adapter reads its official public pages and may need maintenance if PAGASA changes their structure.
- Active PAGASA cards link back to the available official bulletin, PDF, track image, and wind-signal map.
- Weather conditions can change quickly. During hazardous weather, follow the latest instructions from local authorities and official agencies.

## License

No license has been added yet. By default, all rights are reserved by the repository owner.
