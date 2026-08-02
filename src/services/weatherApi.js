const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

function currentHourIndex(hourly, currentTime) {
  if (!hourly?.time?.length) return 0;
  const currentHour = currentTime?.slice(0, 13);
  const sameHour = hourly.time.findIndex((time) => time.slice(0, 13) === currentHour);
  if (sameHour >= 0) return sameHour;
  const nextHour = hourly.time.findIndex((time) => time >= currentTime);
  return nextHour >= 0 ? nextHour : hourly.time.length - 1;
}

async function getOpenMeteoWeather(latitude, longitude, regionCode) {
  const parameters = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "weather_code",
      "wind_speed_10m",
      "wind_gusts_10m",
      "wind_direction_10m",
      "is_day",
      "precipitation",
      "cloud_cover",
      "pressure_msl",
    ].join(","),
    hourly: [
      "temperature_2m",
      "weather_code",
      "precipitation_probability",
      "precipitation",
      "apparent_temperature",
      "relative_humidity_2m",
      "wind_speed_10m",
      "wind_gusts_10m",
      "uv_index",
      "is_day",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
      "uv_index_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
    wind_speed_unit: "kmh",
  });

  const response = await fetch(`${OPEN_METEO_URL}?${parameters}`);
  if (!response.ok) {
    throw new Error("We could not reach the weather service. Please try again.");
  }

  const weather = await response.json();
  const index = currentHourIndex(weather.hourly, weather.current?.time);
  weather.provider = "open-meteo";
  weather.provider_name = "Open-Meteo";
  weather.provider_url = "https://open-meteo.com/";
  weather.fetched_at = new Date().toISOString();
  weather.region_code = regionCode || "";
  weather.current.precipitation_probability =
    weather.hourly.precipitation_probability?.[index] ?? 0;
  weather.current.uv_index = weather.hourly.uv_index?.[index] ?? 0;
  weather.current.thunderstorm_probability =
    weather.current.weather_code >= 95 ? 80 : 0;
  weather.hourly.thunderstorm_probability = weather.hourly.weather_code.map(
    (code) => (code >= 95 ? 80 : 0)
  );
  return weather;
}

export function getCurrentWeather(latitude, longitude, regionCode = "") {
  return getOpenMeteoWeather(latitude, longitude, regionCode);
}
