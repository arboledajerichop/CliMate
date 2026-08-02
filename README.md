# CliMate

**See the weather. Plan better.**

CliMate is a responsive, installable weather application that combines practical forecasts with expressive animated scenes, preventive guidance, and optional ambient sound.

## Features

- Current conditions, an interactive 24-hour Day in Motion timeline, and a seven-day outlook
- City search and browser-based current location
- Celsius and Fahrenheit support
- Animated student scenes for sunny, cloudy, windy, rainy, stormy, and snowy weather
- Location-aware morning, daytime, sunset, and night scene variants
- Optional spatial weather soundscapes with moving wind and rain, environmental layers, time-aware wildlife, and volume control
- Corrected current-hour rain probability and UV information
- Condition-aware preventive measures, dos and don'ts, and suggested weather windows
- Clear rain-chance labels in the Day in Motion timeline and seven-day forecast
- Saved and recently viewed locations
- Philippine Typhoon Center with live official PAGASA bulletin, track, strength, movement, and wind-signal information
- Installable Progressive Web App with offline app-shell support
- Responsive, keyboard-accessible interface with reduced-motion support

## Tech stack

- React 19
- Vite 8
- Web Audio API
- Open-Meteo Weather and Geocoding APIs
- Official PAGASA tropical-cyclone bulletin pages through a server-side adapter
- BigDataCloud reverse geocoding

## Requirements

- Node.js `20.19+` or `22.12+`
- npm

## Local setup

1. Clone the repository and enter its directory:

   ```bash
   git clone https://github.com/arboledajerichop/JerichoMood-WeatherApp.git
   cd JerichoMood-WeatherApp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

Open the local URL printed by Vite, usually `http://localhost:5173`. No API keys or environment variables are required.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the local development server. |
| `npm run build` | Creates the production build in `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | Runs ESLint across the project. |

## Netlify deployment

Import the GitHub repository into Netlify. The included `netlify.toml` runs the production build, publishes `dist`, and redirects application routes to `index.html`.

## Vercel deployment

Import the GitHub repository into Vercel and keep the framework preset set to **Vite**. The included `vercel.json` runs `npm run build` and publishes `dist`.

## Project structure

```text
src/
  components/   Forecast, animated scene, preventive guidance, and PWA UI
  services/     Weather, geocoding, and location requests
  utils/        Activity scoring, local-time, weather-code, and wind helpers
server/
  pagasa.mjs         Official PAGASA bulletin reader and normalizer
api/
  pagasa.mjs         Vercel PAGASA function
netlify/functions/
  pagasa.mjs         Netlify PAGASA function
worker/
  index.js      Hosted app routing and geocoding proxy
public/         App icons and other public assets
```

## Data and privacy

- Forecast data comes from Open-Meteo.
- Tropical-cyclone information comes directly from PAGASA's official public bulletin and advisory pages. PAGASA does not currently publish a documented public tropical-cyclone API, so the server adapter may need maintenance if PAGASA changes its page structure.
- Every active cyclone card links to the original PAGASA page and available official PDF, track image, and wind-signal map.
- Reverse geocoding uses BigDataCloud.
- Saved locations, recent locations, temperature unit, and sound volume are stored only in the browser.
- Ambient sounds are generated locally with the Web Audio API.
- CliMate does not include AI chat, user accounts, or a database.

Weather information can change quickly and should not replace official guidance during hazardous conditions.

## License

No license is currently included in this repository.
