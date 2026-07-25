import { useCallback, useEffect, useMemo, useState } from "react";
import DailyForecast from "./components/DailyForecast";
import HourlyForecast from "./components/HourlyForecast";
import LocationSearch from "./components/LocationSearch";
import WeatherDetails from "./components/WeatherDetails";
import WeatherIcon from "./components/WeatherIcon";
import WeatherScene from "./components/WeatherScene";
import { getCurrentWeather } from "./services/weatherApi";
import { getLocationName, getUserLocation } from "./services/locationService";
import { getWeatherMeta } from "./utils/weatherCode";

const DEFAULT_LOCATION = {
  latitude: 14.5995,
  longitude: 120.9842,
  name: "Manila, Philippines",
};

const STORAGE_LOCATION = "meteomood-location";
const STORAGE_UNIT = "meteomood-unit";

function App() {
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Reading the sky...");
  const [error, setError] = useState("");
  const [unit, setUnit] = useState(() => localStorage.getItem(STORAGE_UNIT) || "C");

  const convertTemperature = useCallback(
    (temperature) =>
      Math.round(unit === "F" ? (temperature * 9) / 5 + 32 : temperature),
    [unit]
  );

  const loadWeather = useCallback(async (location, save = true) => {
    setLoading(true);
    setError("");
    setStatusMessage(`Checking the weather in ${location.name || "your area"}...`);

    try {
      const weatherData = await getCurrentWeather(
        location.latitude,
        location.longitude
      );
      setWeather(weatherData);
      setLocationName(location.name || "Selected location");

      if (save) {
        localStorage.setItem(STORAGE_LOCATION, JSON.stringify(location));
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the forecast right now."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let initialLocation = DEFAULT_LOCATION;

    try {
      const savedLocation = JSON.parse(localStorage.getItem(STORAGE_LOCATION));
      if (savedLocation?.latitude && savedLocation?.longitude) {
        initialLocation = savedLocation;
      }
    } catch {
      localStorage.removeItem(STORAGE_LOCATION);
    }

    const timer = window.setTimeout(() => loadWeather(initialLocation, false), 0);
    return () => window.clearTimeout(timer);
  }, [loadWeather]);

  useEffect(() => {
    localStorage.setItem(STORAGE_UNIT, unit);
  }, [unit]);

  async function useCurrentLocation() {
    setLoading(true);
    setError("");
    setStatusMessage("Finding your current location...");

    try {
      const location = await getUserLocation();
      setStatusMessage("Naming your location...");
      const readableName = await getLocationName(
        location.latitude,
        location.longitude
      );
      await loadWeather({
        latitude: location.latitude,
        longitude: location.longitude,
        name: readableName,
      });
    } catch (locationError) {
      setError(
        locationError instanceof Error
          ? locationError.message
          : "We could not determine your location."
      );
      setLoading(false);
    }
  }

  function handleSelectLocation(location) {
    const name = [location.name, location.admin1, location.country]
      .filter(Boolean)
      .filter((part, index, parts) => parts.indexOf(part) === index)
      .join(", ");

    loadWeather({
      latitude: location.latitude,
      longitude: location.longitude,
      name,
    });
  }

  const current = weather?.current;
  const weatherMeta = useMemo(
    () => getWeatherMeta(current?.weather_code),
    [current?.weather_code]
  );
  const currentTemperature = current
    ? convertTemperature(current.temperature_2m)
    : null;
  const currentDayIndex = 0;
  const high = weather?.daily
    ? convertTemperature(weather.daily.temperature_2m_max[currentDayIndex])
    : null;
  const low = weather?.daily
    ? convertTemperature(weather.daily.temperature_2m_min[currentDayIndex])
    : null;

  return (
    <div className={`app-shell weather-theme--${weatherMeta.group}`}>
      <header className="topbar">
        <a className="brand" href="/" aria-label="MeteoMood home">
          <span className="brand-mark" aria-hidden="true">
            <i />
          </span>
          <span>
            <strong>MeteoMood</strong>
            <small>Forecasts you can feel</small>
          </span>
        </a>

        <div className="topbar-actions">
          <button
            className="locate-button"
            type="button"
            onClick={useCurrentLocation}
            disabled={loading}
          >
            <span aria-hidden="true">⌖</span>
            <span>My location</span>
          </button>
          <div className="unit-switch" aria-label="Temperature unit">
            {["C", "F"].map((option) => (
              <button
                key={option}
                type="button"
                className={unit === option ? "is-active" : ""}
                onClick={() => setUnit(option)}
                aria-pressed={unit === option}
              >
                °{option}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="app">
        <section className="welcome-row">
          <div>
            <span className="eyebrow">Worldwide weather</span>
            <h1>How does today <em>feel?</em></h1>
          </div>
          <p>Live conditions and forecasts for any city, anywhere.</p>
        </section>

        <LocationSearch
          onSelectLocation={handleSelectLocation}
          disabled={loading}
        />

        {error && (
          <div className="error-message" role="alert">
            <div>
              <strong>That forecast got away from us.</strong>
              <p>{error}</p>
            </div>
            <button type="button" onClick={() => loadWeather(DEFAULT_LOCATION)}>
              Show Manila
            </button>
          </div>
        )}

        {!weather && loading && (
          <section className="loading-card" aria-live="polite">
            <span className="loading-sky" aria-hidden="true">
              <i />
            </span>
            <strong>{statusMessage}</strong>
            <p>Gathering the latest conditions and forecast.</p>
          </section>
        )}

        {weather && current && (
          <div className={`weather-content ${loading ? "is-refreshing" : ""}`}>
            {loading && <div className="refresh-note">{statusMessage}</div>}

            <section className="hero-grid" aria-labelledby="current-condition">
              <article className="current-card">
                <div className="location-line">
                  <span className="location-pin" aria-hidden="true" />
                  <div>
                    <span>Current weather</span>
                    <h2>{locationName}</h2>
                  </div>
                </div>

                <div className="temperature-row">
                  <strong className="temperature">
                    {currentTemperature}
                    <sup>°{unit}</sup>
                  </strong>
                  <WeatherIcon code={current.weather_code} size="large" />
                </div>

                <div className="condition-line">
                  <div>
                    <h3 id="current-condition">{weatherMeta.label}</h3>
                    <p>
                      Feels like {convertTemperature(current.apparent_temperature)}°
                    </p>
                  </div>
                  <div className="high-low">
                    <span>H {high}°</span>
                    <span>L {low}°</span>
                  </div>
                </div>

                <div className="current-footer">
                  <span>{weather.timezone_abbreviation || weather.timezone}</span>
                  <span className="live-dot">Live</span>
                </div>
              </article>

              <WeatherScene
                code={current.weather_code}
                temperature={currentTemperature}
                unit={unit}
              />
            </section>

            <WeatherDetails
              humidity={Math.round(current.relative_humidity_2m)}
              windSpeed={Math.round(current.wind_speed_10m)}
              windDirection={current.wind_direction_10m}
              rainChance={weather.hourly.precipitation_probability[0] ?? 0}
              pressure={Math.round(current.pressure_msl)}
            />

            <section className="forecast-layout">
              <HourlyForecast
                hourly={weather.hourly}
                currentTime={current.time}
                convertTemperature={convertTemperature}
              />
              <DailyForecast
                daily={weather.daily}
                convertTemperature={convertTemperature}
              />
            </section>
          </div>
        )}
      </main>

      <footer>
        <span>MeteoMood</span>
        <p>Weather data refreshed from Open-Meteo.</p>
        <span>Made for every forecast</span>
      </footer>
    </div>
  );
}

export default App;
