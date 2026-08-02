import { useCallback, useEffect, useMemo, useState } from "react";
import BrandLogo from "./components/BrandLogo";
import DayInMotion from "./components/DayInMotion";
import DailyForecast from "./components/DailyForecast";
import LocationSearch from "./components/LocationSearch";
import PwaPrompt from "./components/PwaPrompt";
import SavedLocations from "./components/SavedLocations";
import SectionNav from "./components/SectionNav";
import TyphoonCenter from "./components/TyphoonCenter";
import WeatherDetails from "./components/WeatherDetails";
import WeatherIcon from "./components/WeatherIcon";
import WeatherReadyGuide from "./components/WeatherReadyGuide";
import WeatherScene from "./components/WeatherScene";
import { getPagasaBulletins } from "./services/pagasaApi";
import { getCurrentWeather } from "./services/weatherApi";
import { getLocationDetails, getUserLocation } from "./services/locationService";
import { getWeatherCondition, getWeatherMeta } from "./utils/weatherCode";
import { findCurrentHourIndex, formatUpdatedAt, getDayPeriod } from "./utils/weatherTime";

const DEFAULT_LOCATION = {
  latitude: 14.5995,
  longitude: 120.9842,
  name: "Manila, Philippines",
  countryCode: "PH",
};

const STORAGE = {
  location: "climate-location",
  unit: "climate-unit",
  favourites: "climate-favourites",
  recent: "climate-recent",
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function sameLocation(first, second) {
  return first?.latitude === second?.latitude && first?.longitude === second?.longitude;
}

function App() {
  const [weather, setWeather] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Reading the sky...");
  const [error, setError] = useState("");
  const [unit, setUnit] = useState(() => localStorage.getItem(STORAGE.unit) || "C");
  const [favourites, setFavourites] = useState(() => readJson(STORAGE.favourites, []));
  const [recent, setRecent] = useState(() => readJson(STORAGE.recent, []));
  const [motionSelection, setMotionSelection] = useState(null);
  const [pagasaData, setPagasaData] = useState(null);
  const [pagasaLoading, setPagasaLoading] = useState(false);
  const [pagasaError, setPagasaError] = useState("");
  const [pagasaReloadToken, setPagasaReloadToken] = useState(0);
  const [, setClockTick] = useState(0);

  const convertTemperature = useCallback(
    (temperature) => Math.round(unit === "F" ? (temperature * 9) / 5 + 32 : temperature),
    [unit]
  );

  const loadWeather = useCallback(async (location, save = true) => {
    setLoading(true);
    setError("");
    setStatusMessage(`Checking the weather in ${location.name || "your area"}...`);

    try {
      const weatherData = await getCurrentWeather(
        location.latitude,
        location.longitude,
        location.countryCode || ""
      );
      const normalizedLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name || "Selected location",
        countryCode: location.countryCode || weatherData.region_code || "",
      };
      setWeather(weatherData);
      setCurrentLocation(normalizedLocation);

      if (save) localStorage.setItem(STORAGE.location, JSON.stringify(normalizedLocation));
      setRecent((items) => {
        const next = [normalizedLocation, ...items.filter((item) => !sameLocation(item, normalizedLocation))].slice(0, 5);
        localStorage.setItem(STORAGE.recent, JSON.stringify(next));
        return next;
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load the forecast right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedLocation = readJson(STORAGE.location, DEFAULT_LOCATION);
    const initialLocation = savedLocation?.latitude && savedLocation?.longitude ? savedLocation : DEFAULT_LOCATION;
    const timer = window.setTimeout(() => loadWeather(initialLocation, false), 0);
    return () => window.clearTimeout(timer);
  }, [loadWeather]);

  useEffect(() => localStorage.setItem(STORAGE.unit, unit), [unit]);
  useEffect(() => {
    const timer = window.setInterval(() => setClockTick((tick) => tick + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  async function useCurrentLocation() {
    setLoading(true);
    setError("");
    setStatusMessage("Finding your current location...");
    try {
      const location = await getUserLocation();
      setStatusMessage("Naming your location...");
      const details = await getLocationDetails(location.latitude, location.longitude);
      await loadWeather({
        latitude: location.latitude,
        longitude: location.longitude,
        name: details.name,
        countryCode: details.countryCode,
      });
    } catch (locationError) {
      setError(locationError instanceof Error ? locationError.message : "We could not determine your location.");
      setLoading(false);
    }
  }

  function handleSelectLocation(location) {
    const name = location.admin1 || location.country
      ? [location.name, location.admin1, location.country]
          .filter(Boolean)
          .filter((part, index, parts) => parts.indexOf(part) === index)
          .join(", ")
      : location.name;
    loadWeather({
      latitude: location.latitude,
      longitude: location.longitude,
      name,
      countryCode: location.countryCode || location.country_code || "",
    });
  }

  function toggleFavourite() {
    if (!currentLocation) return;
    setFavourites((items) => {
      const exists = items.some((item) => sameLocation(item, currentLocation));
      const next = exists ? items.filter((item) => !sameLocation(item, currentLocation)) : [currentLocation, ...items].slice(0, 6);
      localStorage.setItem(STORAGE.favourites, JSON.stringify(next));
      return next;
    });
  }

  const current = weather?.current;
  const weatherMeta = useMemo(() => getWeatherMeta(current?.weather_code), [current?.weather_code]);
  const currentCondition = useMemo(
    () => getWeatherCondition(current?.weather_code, current?.is_day !== 0),
    [current?.is_day, current?.weather_code]
  );
  const currentTemperature = current ? convertTemperature(current.temperature_2m) : null;
  const high = weather?.daily ? convertTemperature(weather.daily.temperature_2m_max[0]) : null;
  const low = weather?.daily ? convertTemperature(weather.daily.temperature_2m_min[0]) : null;
  const hourIndex = current ? findCurrentHourIndex(weather?.hourly, current.time) : 0;
  const dayPeriod = current ? getDayPeriod(
    current.time,
    weather?.daily?.sunrise?.[0],
    weather?.daily?.sunset?.[0],
    current.is_day === 1
  ) : "day";
  const isPhilippines = currentLocation?.countryCode === "PH" || weather?.region_code === "PH";
  const providerLabel = "Weather data from Open-Meteo";
  const selectedMotionIndex = motionSelection && motionSelection.baseTime === current?.time
    ? motionSelection.index
    : hourIndex;
  const timelineIndex = weather?.hourly?.time?.length
    ? Math.min(
        weather.hourly.time.length - 1,
        Math.max(hourIndex, selectedMotionIndex)
      )
    : hourIndex;
  const timelineTime = weather?.hourly?.time?.[timelineIndex] || current?.time;
  const timelineDateIndex = weather?.daily?.time?.findIndex(
    (time) => time === timelineTime?.slice(0, 10)
  );
  const safeTimelineDateIndex = timelineDateIndex >= 0 ? timelineDateIndex : 0;
  const timelineDayPeriod = current ? getDayPeriod(
    timelineTime,
    weather?.daily?.sunrise?.[safeTimelineDateIndex],
    weather?.daily?.sunset?.[safeTimelineDateIndex],
    weather?.hourly?.is_day?.[timelineIndex] === 1
  ) : dayPeriod;

  useEffect(() => {
    let cancelled = false;

    if (!isPhilippines) return undefined;

    async function loadPagasa() {
      await Promise.resolve();
      if (cancelled) return;
      setPagasaLoading(true);
      setPagasaError("");

      try {
        const data = await getPagasaBulletins({ force: pagasaReloadToken > 0 });
        if (!cancelled) setPagasaData(data);
      } catch (requestError) {
        if (!cancelled) {
          setPagasaData(null);
          setPagasaError(
            requestError instanceof Error
              ? requestError.message
              : "PAGASA bulletins could not be reached right now."
          );
        }
      } finally {
        if (!cancelled) setPagasaLoading(false);
      }
    }

    loadPagasa();

    return () => {
      cancelled = true;
    };
  }, [isPhilippines, pagasaReloadToken]);

  return (
    <div className={`app-shell weather-theme--${weatherMeta.group} time-theme--${dayPeriod}`}>
      <header className="topbar">
        <a className="brand" href="/" aria-label="CliMate home">
          <BrandLogo />
          <span className="brand-copy">
            <strong><span>Cli</span><span className="brand-mate">Mate</span></strong>
            <small>See the weather. Plan better.</small>
          </span>
        </a>

        <div className="topbar-actions">
          <PwaPrompt />
          <button className="locate-button" type="button" onClick={useCurrentLocation} disabled={loading}>
            <span aria-hidden="true">⌖</span><span>My location</span>
          </button>
          <div className="unit-switch" aria-label="Temperature unit">
            {["C", "F"].map((option) => (
              <button key={option} type="button" className={unit === option ? "is-active" : ""} onClick={() => setUnit(option)} aria-pressed={unit === option}>°{option}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="app">
        <section className="welcome-row">
          <div><span className="eyebrow">Worldwide weather</span><h1>How does today <em>feel?</em></h1></div>
          <p>Forecasts that help you decide what to wear, bring, and do.</p>
        </section>

        <LocationSearch onSelectLocation={handleSelectLocation} disabled={loading} />
        <SavedLocations favourites={favourites} recent={recent} currentLocation={currentLocation} onSelect={handleSelectLocation} onToggleFavourite={toggleFavourite} />

        {error && (
          <div className="error-message" role="alert">
            <div><strong>That forecast got away from us.</strong><p>{error}</p></div>
            <button type="button" onClick={() => loadWeather(DEFAULT_LOCATION)}>Show Manila</button>
          </div>
        )}

        {!weather && loading && (
          <section className="loading-card" aria-live="polite"><span className="loading-sky" aria-hidden="true"><i /></span><strong>{statusMessage}</strong><p>Gathering the latest conditions and forecast.</p></section>
        )}

        {weather && current && (
          <div className={`weather-content ${loading ? "is-refreshing" : ""}`}>
            {loading && <div className="refresh-note">{statusMessage}</div>}
            <SectionNav showPagasa={isPhilippines} />
            <section className="hero-grid" id="today" aria-labelledby="current-condition">
              <article className="current-card">
                <div className="location-line"><span className="location-pin" aria-hidden="true" /><div><span>Current weather</span><h2>{currentLocation?.name}</h2></div></div>
                <div className="temperature-row"><strong className="temperature">{currentTemperature}<sup>°{unit}</sup></strong><WeatherIcon code={current.weather_code} size="large" isDay={current.is_day === 1} /></div>
                <div className="condition-line">
                  <div><h3 id="current-condition">{currentCondition}</h3><p>Feels like {convertTemperature(current.apparent_temperature)}°</p></div>
                  <div className="high-low"><span>H {high}°</span><span>L {low}°</span></div>
                </div>
                <div className="current-footer"><span>{weather.timezone_abbreviation || weather.timezone}</span><span className="updated-dot">{formatUpdatedAt(weather.fetched_at)}</span></div>
              </article>

              <WeatherScene
                code={weather.hourly.weather_code?.[timelineIndex] ?? current.weather_code}
                temperature={convertTemperature(weather.hourly.temperature_2m?.[timelineIndex] ?? current.temperature_2m)}
                apparentTemperatureC={weather.hourly.apparent_temperature?.[timelineIndex] ?? current.apparent_temperature}
                unit={unit}
                windSpeed={weather.hourly.wind_speed_10m?.[timelineIndex] ?? current.wind_speed_10m}
                dayPeriod={timelineDayPeriod}
              />
            </section>

            <WeatherDetails
              humidity={Math.round(current.relative_humidity_2m)}
              windSpeed={Math.round(current.wind_speed_10m)}
              windDirection={current.wind_direction_10m}
              rainChance={current.precipitation_probability ?? weather.hourly.precipitation_probability[hourIndex] ?? 0}
              pressure={Math.round(current.pressure_msl)}
              uvIndex={Math.round(current.uv_index ?? weather.hourly.uv_index[hourIndex] ?? 0)}
            />

            <DayInMotion
              key={current.time}
              hourly={weather.hourly}
              currentTime={current.time}
              selectedIndex={timelineIndex}
              onSelectedIndexChange={(index) => setMotionSelection({ baseTime: current.time, index })}
              selectedDayPeriod={timelineDayPeriod}
              convertTemperature={convertTemperature}
              unit={unit}
            />
            <TyphoonCenter
              data={pagasaData}
              loading={pagasaLoading}
              error={pagasaError}
              isPhilippines={isPhilippines}
              onRetry={() => setPagasaReloadToken((token) => token + 1)}
            />

            <section className="forecast-layout" id="forecast">
              <WeatherReadyGuide
                hourly={weather.hourly}
                currentTime={current.time}
                selectedIndex={timelineIndex}
                selectedDayPeriod={timelineDayPeriod}
              />
              <DailyForecast daily={weather.daily} convertTemperature={convertTemperature} />
            </section>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <span className="footer-brand">Cli<span>Mate</span></span>
        {weather?.provider_url ? <a href={weather.provider_url} target="_blank" rel="noreferrer">{providerLabel}</a> : <p>{providerLabel}</p>}
        <span>Made for every forecast</span>
      </footer>
    </div>
  );
}

export default App;
