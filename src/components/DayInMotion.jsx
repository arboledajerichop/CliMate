import { useEffect, useMemo, useState } from "react";
import { findCurrentHourIndex } from "../utils/weatherTime";
import { getWeatherCondition, getWeatherMeta } from "../utils/weatherCode";
import WeatherIcon from "./WeatherIcon";

const WET_GROUPS = new Set(["drizzle", "rain", "storm"]);

function formatHour(dateTime) {
  const hour = Number(dateTime?.split("T")[1]?.slice(0, 2));
  if (!Number.isFinite(hour)) return "";
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
}

function dateNumber(dateTime) {
  const [year, month, day] = (dateTime?.slice(0, 10) || "").split("-").map(Number);
  return year && month && day ? Date.UTC(year, month - 1, day) : 0;
}

function formatDay(dateTime, currentTime) {
  const difference = Math.round((dateNumber(dateTime) - dateNumber(currentTime)) / 86_400_000);
  if (difference === 0) return "Today";
  if (difference === 1) return "Tomorrow";

  const [year, month, day] = dateTime.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(
    new Date(Date.UTC(year, month - 1, day))
  );
}

function valueAt(hourly, field, index, fallback = 0) {
  return hourly?.[field]?.[index] ?? fallback;
}

function createHeadline(hourly, index, endIndex) {
  const code = valueAt(hourly, "weather_code", index, 3);
  const meta = getWeatherMeta(code);
  const rain = Math.round(valueAt(hourly, "precipitation_probability", index));
  const gust = Math.round(valueAt(hourly, "wind_gusts_10m", index));
  const uv = Math.round(valueAt(hourly, "uv_index", index) * 10) / 10;
  const temperature = valueAt(hourly, "apparent_temperature", index, valueAt(hourly, "temperature_2m", index));

  if (meta.group === "storm") {
    return {
      title: "Thunderstorms could affect this hour",
      detail: `Rain chance is ${rain}%. Stay near shelter and follow official warnings.`,
      tone: "danger",
    };
  }

  if (meta.group === "snow") {
    return {
      title: "Snow is expected around this time",
      detail: "Allow extra travel time and protect exposed skin from the cold.",
      tone: "cold",
    };
  }

  if (WET_GROUPS.has(meta.group) || rain >= 60) {
    return {
      title: `Rain is likely around ${formatHour(hourly.time[index])}`,
      detail: `${rain}% chance of rain. Keep an umbrella within reach.`,
      tone: "rain",
    };
  }

  const searchEnd = Math.min(endIndex, index + 12);
  for (let nextIndex = index + 1; nextIndex <= searchEnd; nextIndex += 1) {
    const nextMeta = getWeatherMeta(valueAt(hourly, "weather_code", nextIndex, 3));
    const nextRain = valueAt(hourly, "precipitation_probability", nextIndex);
    if (WET_GROUPS.has(nextMeta.group) || nextRain >= 60) {
      return {
        title: `Rain may arrive around ${formatHour(hourly.time[nextIndex])}`,
        detail: `${Math.round(nextRain)}% chance at its next likely arrival. Conditions are dry before then.`,
        tone: "rain",
      };
    }
  }

  if (gust >= 40) {
    return {
      title: "Strong gusts are possible",
      detail: `Gusts may reach ${gust} km/h. Secure loose outdoor items.`,
      tone: "wind",
    };
  }

  if (uv >= 6 && valueAt(hourly, "is_day", index, 1) === 1) {
    return {
      title: "Sun protection will matter",
      detail: `UV reaches ${uv}. Use shade, sunscreen, and a hat outdoors.`,
      tone: "sun",
    };
  }

  const laterIndex = Math.min(endIndex, index + 6);
  const laterTemperature = valueAt(hourly, "apparent_temperature", laterIndex, temperature);
  const temperatureChange = Math.round(laterTemperature - temperature);
  if (Math.abs(temperatureChange) >= 4) {
    return {
      title: `It will feel ${temperatureChange > 0 ? "warmer" : "cooler"} later`,
      detail: `The feels-like temperature changes by about ${Math.abs(temperatureChange)}° over the next six hours.`,
      tone: temperatureChange > 0 ? "sun" : "cold",
    };
  }

  return {
    title: "Conditions stay fairly steady",
    detail: "No major change stands out during the next several hours.",
    tone: "calm",
  };
}

function DayInMotion({
  hourly,
  currentTime,
  selectedIndex,
  onSelectedIndexChange,
  selectedDayPeriod,
  convertTemperature,
  unit,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const startIndex = findCurrentHourIndex(hourly, currentTime);
  const endIndex = Math.min(startIndex + 23, (hourly?.time?.length || 1) - 1);
  const safeIndex = Math.min(endIndex, Math.max(startIndex, selectedIndex ?? startIndex));
  const offset = safeIndex - startIndex;
  const totalSteps = Math.max(1, endIndex - startIndex);
  const progress = (offset / totalSteps) * 100;

  useEffect(() => {
    if (!isPlaying) return undefined;
    if (safeIndex >= endIndex) {
      const stopTimer = window.setTimeout(() => setIsPlaying(false), 0);
      return () => window.clearTimeout(stopTimer);
    }

    const timer = window.setTimeout(
      () => onSelectedIndexChange(safeIndex + 1),
      1350
    );
    return () => window.clearTimeout(timer);
  }, [endIndex, isPlaying, onSelectedIndexChange, safeIndex]);

  const moment = useMemo(() => {
    const code = valueAt(hourly, "weather_code", safeIndex, 3);
    const isDay = valueAt(hourly, "is_day", safeIndex, 1) === 1;
    return {
      code,
      isDay,
      condition: getWeatherCondition(code, isDay),
      temperature: convertTemperature(valueAt(hourly, "temperature_2m", safeIndex)),
      feelsLike: convertTemperature(
        valueAt(hourly, "apparent_temperature", safeIndex, valueAt(hourly, "temperature_2m", safeIndex))
      ),
      rain: Math.round(valueAt(hourly, "precipitation_probability", safeIndex)),
      wind: Math.round(valueAt(hourly, "wind_speed_10m", safeIndex)),
      gust: Math.round(valueAt(hourly, "wind_gusts_10m", safeIndex)),
      uv: Math.round(valueAt(hourly, "uv_index", safeIndex) * 10) / 10,
      time: hourly.time[safeIndex],
    };
  }, [convertTemperature, hourly, safeIndex]);

  const headline = useMemo(
    () => createHeadline(hourly, safeIndex, endIndex),
    [endIndex, hourly, safeIndex]
  );

  const milestoneIndexes = useMemo(() => {
    return Array.from(
      { length: endIndex - startIndex + 1 },
      (_, offsetIndex) => startIndex + offsetIndex
    );
  }, [endIndex, startIndex]);

  function selectHour(index) {
    setIsPlaying(false);
    onSelectedIndexChange(index);
  }

  function togglePlayback() {
    if (!isPlaying && safeIndex >= endIndex) onSelectedIndexChange(startIndex);
    setIsPlaying((playing) => !playing);
  }

  return (
    <section className="day-motion" id="motion" aria-labelledby="motion-heading">
      <div className="motion-heading">
        <div>
          <span className="eyebrow">Your next 24 hours</span>
          <h2 id="motion-heading">See your day unfold</h2>
          <p>Move through the forecast and watch the scene prepare for every change.</p>
        </div>
        <div className="motion-controls">
          {safeIndex !== startIndex && (
            <button type="button" className="motion-now" onClick={() => selectHour(startIndex)}>
              Return to now
            </button>
          )}
          <button
            type="button"
            className={`motion-play ${isPlaying ? "is-playing" : ""}`}
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause forecast playback" : "Play forecast playback"}
            aria-pressed={isPlaying}
          >
            <i aria-hidden="true" />
            {isPlaying ? "Pause" : "Play the day"}
          </button>
        </div>
      </div>

      <div className="motion-overview">
        <article className={`motion-story motion-story--${headline.tone}`} aria-live="polite">
          <div className="motion-selected-time">
            <span>{formatDay(moment.time, currentTime)}</span>
            <strong>{formatHour(moment.time)}</strong>
            <small>{selectedDayPeriod === "day" ? "Daytime" : selectedDayPeriod}</small>
          </div>
          <div className="motion-story-copy">
            <span>{moment.condition}</span>
            <h3>{headline.title}</h3>
            <p>{headline.detail}</p>
          </div>
          <WeatherIcon code={moment.code} isDay={moment.isDay} size="large" />
        </article>

        <div className="motion-readings" aria-label={`Forecast details for ${formatHour(moment.time)}`}>
          <span><small>Temperature</small><strong>{moment.temperature}°{unit}</strong></span>
          <span><small>Feels like</small><strong>{moment.feelsLike}°{unit}</strong></span>
          <span><small>Rain chance</small><strong>{moment.rain}%</strong></span>
          <span><small>Wind</small><strong>{moment.wind} km/h</strong></span>
          <span><small>Gusts</small><strong>{moment.gust} km/h</strong></span>
          <span><small>UV index</small><strong>{moment.uv}</strong></span>
        </div>
      </div>

      <div className="motion-timeline">
        <div className="motion-range-labels">
          <span>Now</span>
          <strong>{formatDay(hourly.time[endIndex], currentTime)}, {formatHour(hourly.time[endIndex])}</strong>
        </div>
        <input
          type="range"
          min="0"
          max={totalSteps}
          step="1"
          value={offset}
          aria-label="Forecast hour"
          style={{ "--motion-progress": `${progress}%` }}
          onChange={(event) => selectHour(startIndex + Number(event.target.value))}
        />
        <p>Drag the timeline or use the arrow keys to change the animated forecast.</p>
      </div>

      <div className="motion-hours" aria-label="Forecast hours">
        {milestoneIndexes.map((index) => {
          const code = valueAt(hourly, "weather_code", index, 3);
          const isDay = valueAt(hourly, "is_day", index, 1) === 1;
          const selected = index === safeIndex;
          return (
            <button
              key={hourly.time[index]}
              type="button"
              className={selected ? "is-selected" : ""}
              aria-pressed={selected}
              aria-label={`Show ${formatDay(hourly.time[index], currentTime)} at ${formatHour(hourly.time[index])}`}
              onClick={() => selectHour(index)}
            >
              <span>{index === startIndex ? "Now" : formatHour(hourly.time[index])}</span>
              <WeatherIcon code={code} isDay={isDay} />
              <strong>{convertTemperature(valueAt(hourly, "temperature_2m", index))}°</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default DayInMotion;
