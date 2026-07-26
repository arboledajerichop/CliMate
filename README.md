# JerichoMood

**Forecasts you can feel.**

JerichoMood is a responsive weather application that combines practical forecasts with animated weather scenes, optional ambient sound, and a forecast-grounded activity assistant.

## Features

- Current conditions, hourly forecasts, and a seven-day outlook
- City search and browser-based current location
- Celsius and Fahrenheit support
- Animated scenes for sunny, cloudy, windy, rainy, stormy, and snowy weather
- Optional weather-matched ambient sound with volume control
- Weather details including humidity, wind, rain probability, pressure, and UV index
- Optional AI assistant for weather and activity questions
- Installable Progressive Web App with offline app-shell support
- Responsive and keyboard-accessible interface

## Tech stack

- React 19
- Vite 8
- Web Audio API
- Open-Meteo Weather and Geocoding APIs
- BigDataCloud reverse geocoding
- Groq API for the optional weather assistant

## Requirements

- Node.js `20.19+` or `22.12+`
- npm
- A Groq API key only if you want to use the AI assistant

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

3. Optional: create `.env.local` to enable the weather assistant:

   ```env
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=openai/gpt-oss-20b
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Open the local URL printed by Vite.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `GROQ_API_KEY` | Optional | Enables the weather assistant. |
| `GROQ_MODEL` | Optional | Overrides the default `openai/gpt-oss-20b` model. |

Weather forecasts and location search do not require API keys.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the local development server. |
| `npm run build` | Creates the production build in `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run lint` | Runs ESLint across the project. |

## Project structure

```text
src/
  components/   Interface, forecast, scene, sound, and assistant components
  services/     Weather, geocoding, location, and assistant requests
  utils/        Weather-code and wind-direction helpers
worker/
  index.js      API handlers for the optional assistant and hosted geocoding
public/         App icons, manifest, social preview, and service worker
```

## Data and privacy

- Forecast data comes from Open-Meteo.
- Reverse geocoding uses BigDataCloud.
- If enabled, assistant questions and the displayed forecast are sent to Groq through `/api/ask`.
- Location, temperature-unit, and sound-volume preferences are stored only in the browser.
- Ambient sounds are generated locally with the Web Audio API.
- JerichoMood does not include user accounts or a database.

Weather information can change quickly and should not replace official guidance during hazardous conditions.

## License

No license is currently included in this repository.
