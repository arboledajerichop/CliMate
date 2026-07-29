import { getWeatherMeta } from "../utils/weatherCode";

function convertTemperature(temperature, unit) {
  if (typeof temperature !== "number") return null;
  return Math.round(unit === "F" ? (temperature * 9) / 5 + 32 : temperature);
}

function findStartingHour(hourly, currentTime) {
  const index = hourly?.time?.findIndex((time) => time >= currentTime);
  return index >= 0 ? index : 0;
}

export function buildForecastSnapshot(weather, location, unit) {
  const current = weather?.current;
  const hourly = weather?.hourly;
  const daily = weather?.daily;
  const startingHour = findStartingHour(hourly, current?.time);

  const nextHours = (hourly?.time || [])
    .slice(startingHour, startingHour + 24)
    .map((time, index) => {
      const actualIndex = startingHour + index;
      const code = hourly.weather_code?.[actualIndex];

      return {
        time,
        condition: getWeatherMeta(code).label,
        temperature: convertTemperature(
          hourly.temperature_2m?.[actualIndex],
          unit
        ),
        feels_like: convertTemperature(
          hourly.apparent_temperature?.[actualIndex],
          unit
        ),
        rain_chance_percent:
          hourly.precipitation_probability?.[actualIndex] ?? null,
        humidity_percent:
          hourly.relative_humidity_2m?.[actualIndex] ?? null,
        wind_kmh: hourly.wind_speed_10m?.[actualIndex] ?? null,
        uv_index: hourly.uv_index?.[actualIndex] ?? null,
      };
    });

  const nextDays = (daily?.time || []).slice(0, 7).map((date, index) => ({
    date,
    condition: getWeatherMeta(daily.weather_code?.[index]).label,
    high: convertTemperature(daily.temperature_2m_max?.[index], unit),
    low: convertTemperature(daily.temperature_2m_min?.[index], unit),
    rain_chance_percent:
      daily.precipitation_probability_max?.[index] ?? null,
    uv_index_max: daily.uv_index_max?.[index] ?? null,
    sunrise: daily.sunrise?.[index] ?? null,
    sunset: daily.sunset?.[index] ?? null,
  }));

  return {
    location,
    timezone: weather?.timezone || "",
    unit,
    current: {
      time: current?.time,
      condition: getWeatherMeta(current?.weather_code).label,
      temperature: convertTemperature(current?.temperature_2m, unit),
      feels_like: convertTemperature(current?.apparent_temperature, unit),
      humidity_percent: current?.relative_humidity_2m ?? null,
      precipitation_mm: current?.precipitation ?? null,
      cloud_cover_percent: current?.cloud_cover ?? null,
      wind_kmh: current?.wind_speed_10m ?? null,
    },
    next_hours: nextHours,
    next_days: nextDays,
  };
}

export async function askWeatherAssistant({
  question,
  history,
  forecast,
}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 25_000);
  let response;

  try {
    response = await fetch("/api/ask", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, history, forecast }),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Meteo took too long to respond. Please try again.", {
        cause: error,
      });
    }

    throw new Error(
      "Meteo could not reach its server. Please check your connection and try again.",
      { cause: error }
    );
  } finally {
    window.clearTimeout(timeout);
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      "The Meteo server function is missing from this deployment. Deploy the complete repository through Netlify, not only the dist folder."
    );
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      result.error || "Meteo could not answer that right now."
    );
    error.code = result.code;
    throw error;
  }

  return result.answer;
}
