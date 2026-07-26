const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

export async function getCurrentWeather(latitude, longitude) {
  const parameters = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "weather_code",
      "wind_speed_10m",
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
      "apparent_temperature",
      "relative_humidity_2m",
      "wind_speed_10m",
      "uv_index",
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

  const response = await fetch(`${WEATHER_API_URL}?${parameters}`);

  if (!response.ok) {
    throw new Error("We could not reach the weather service. Please try again.");
  }

  return response.json();
}
