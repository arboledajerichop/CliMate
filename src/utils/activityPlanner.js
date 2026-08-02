import { findCurrentHourIndex } from "./weatherTime";

export const ACTIVITIES = [
  { id: "commute", label: "Commute", icon: "bus", duration: 1 },
  { id: "exercise", label: "Exercise", icon: "dumbbell", duration: 2 },
  { id: "laundry", label: "Laundry", icon: "basin", duration: 3 },
  { id: "cycling", label: "Cycling", icon: "bicycle", duration: 2 },
  { id: "outdoor", label: "Outdoor plans", icon: "trees", duration: 2 },
  { id: "travel", label: "Travel", icon: "plane", duration: 3 },
];

const ACTIVITY_RULES = {
  commute: { rain: 0.55, wind: 0.45, uv: 0.1, heat: 0.25, hours: [5, 23] },
  exercise: { rain: 0.45, wind: 0.5, uv: 0.55, heat: 0.8, hours: [5, 21] },
  laundry: { rain: 1, wind: 0.2, uv: 0.05, heat: 0.1, hours: [7, 18] },
  cycling: { rain: 0.75, wind: 0.9, uv: 0.35, heat: 0.55, hours: [5, 20] },
  outdoor: { rain: 0.75, wind: 0.45, uv: 0.6, heat: 0.5, hours: [6, 20] },
  travel: { rain: 0.5, wind: 0.5, uv: 0.15, heat: 0.25, hours: [5, 23] },
};

function hourValues(hourly, index) {
  return {
    time: hourly.time[index],
    code: hourly.weather_code?.[index] ?? 3,
    temperature: hourly.temperature_2m?.[index] ?? 20,
    feelsLike: hourly.apparent_temperature?.[index] ?? hourly.temperature_2m?.[index] ?? 20,
    humidity: hourly.relative_humidity_2m?.[index] ?? 50,
    rain: hourly.precipitation_probability?.[index] ?? 0,
    wind: hourly.wind_speed_10m?.[index] ?? 0,
    gust: hourly.wind_gusts_10m?.[index] ?? hourly.wind_speed_10m?.[index] ?? 0,
    uv: hourly.uv_index?.[index] ?? 0,
    storm: hourly.thunderstorm_probability?.[index] ?? ((hourly.weather_code?.[index] ?? 0) >= 95 ? 80 : 0),
  };
}

function scoreHour(hour, activityId, preferences) {
  const rules = ACTIVITY_RULES[activityId] || ACTIVITY_RULES.outdoor;
  let score = 100;
  score -= Math.max(0, hour.rain - preferences.rainTolerance) * rules.rain;
  score -= Math.max(0, hour.wind - preferences.windTolerance) * rules.wind * 1.8;
  score -= Math.max(0, hour.gust - preferences.windTolerance - 10) * rules.wind;
  score -= Math.max(0, hour.feelsLike - preferences.heatThreshold) * rules.heat * 5;
  score -= Math.max(0, preferences.coldThreshold - hour.feelsLike) * 3;
  score -= Math.max(0, hour.uv - preferences.uvLimit) * rules.uv * 7;
  score -= hour.storm * 0.9;
  if (hour.code >= 95) score = Math.min(score, 15);
  if (activityId === "laundry" && hour.rain > 25) score -= 35;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function formatHour(dateTime) {
  const hour = Number(dateTime?.split("T")[1]?.slice(0, 2));
  if (!Number.isFinite(hour)) return "";
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
}

function rating(score) {
  if (score >= 82) return { label: "Great", tone: "great" };
  if (score >= 65) return { label: "Good", tone: "good" };
  if (score >= 45) return { label: "Mixed", tone: "mixed" };
  return { label: "Best to delay", tone: "avoid" };
}

function buildGuidance(hours, preferences) {
  const maxRain = Math.max(...hours.map((hour) => hour.rain));
  const maxUv = Math.max(...hours.map((hour) => hour.uv));
  const maxWind = Math.max(...hours.map((hour) => hour.gust));
  const maxFeels = Math.max(...hours.map((hour) => hour.feelsLike));
  const minFeels = Math.min(...hours.map((hour) => hour.feelsLike));
  const maxStorm = Math.max(...hours.map((hour) => hour.storm));
  const reasons = [];

  if (maxStorm >= 40 || hours.some((hour) => hour.code >= 95)) {
    reasons.push("Thunderstorms are possible during this window.");
  } else if (maxRain > preferences.rainTolerance) {
    reasons.push(`Rain chance reaches ${Math.round(maxRain)}%.`);
  } else {
    reasons.push(`Rain stays near or below ${Math.round(maxRain)}%.`);
  }
  if (maxUv > preferences.uvLimit) {
    reasons.push(`UV reaches ${Math.round(maxUv)}.`);
  }
  if (maxFeels > preferences.heatThreshold) {
    reasons.push(`It may feel as warm as ${Math.round(maxFeels)}°C.`);
  } else if (minFeels < preferences.coldThreshold) {
    reasons.push(`It may feel as cool as ${Math.round(minFeels)}°C.`);
  } else {
    reasons.push("The temperature should feel manageable.");
  }
  if (maxWind > preferences.windTolerance) {
    reasons.push(`Gusts may reach ${Math.round(maxWind)} km/h.`);
  }
  return {
    reasons: reasons.slice(0, 3),
    conditions: {
      feelsLike: Math.round(
        hours.reduce((total, hour) => total + hour.feelsLike, 0) / hours.length
      ),
      rainChance: Math.round(maxRain),
      wind: Math.round(
        hours.reduce((total, hour) => total + hour.wind, 0) / hours.length
      ),
      gust: Math.round(maxWind),
      uv: Math.round(maxUv * 10) / 10,
    },
  };
}

export function createActivityPlan(hourly, currentTime, activityId, preferences) {
  if (!hourly?.time?.length) return null;
  const activity = ACTIVITIES.find((item) => item.id === activityId) || ACTIVITIES[0];
  const start = findCurrentHourIndex(hourly, currentTime);
  const candidates = hourly.time
    .slice(start, start + 24)
    .map((_, index) => hourValues(hourly, start + index));
  const windowSize = activity.duration;
  const allowedHours = ACTIVITY_RULES[activityId]?.hours || [0, 24];
  let best = null;

  for (let index = 0; index <= candidates.length - windowSize; index += 1) {
    const hours = candidates.slice(index, index + windowSize);
    const isPracticalTime = hours.every((hour) => {
      const clockHour = Number(hour.time?.split("T")[1]?.slice(0, 2));
      return clockHour >= allowedHours[0] && clockHour < allowedHours[1];
    });
    if (!isPracticalTime) continue;
    const average = Math.round(
      hours.reduce((total, hour) => total + scoreHour(hour, activityId, preferences), 0) /
        hours.length
    );
    if (!best || average > best.score) best = { score: average, hours };
  }

  if (!best) return null;
  const startLabel = formatHour(best.hours[0].time);
  const endDate = new Date(`${best.hours.at(-1).time}:00`);
  endDate.setHours(endDate.getHours() + 1);
  const endLabel = formatHour(`${padDate(endDate)}T${String(endDate.getHours()).padStart(2, "0")}:00`);
  const verdict = rating(best.score);
  return {
    activity,
    score: best.score,
    verdict,
    window: `${startLabel}–${endLabel}`,
    ...buildGuidance(best.hours, preferences),
  };
}

function padDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
