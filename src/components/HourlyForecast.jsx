import WeatherIcon from "./WeatherIcon";
import { getWeatherCondition, getWeatherMeta } from "../utils/weatherCode";
import { findCurrentHourIndex } from "../utils/weatherTime";

function getSafetyAdvice(current, hourly, startingIndex, preferences) {
  const upcoming = Array.from({ length: 6 }, (_, offset) => startingIndex + offset);
  const maxRain = Math.max(...upcoming.map((index) => hourly.precipitation_probability?.[index] ?? 0));
  const maxUv = Math.max(...upcoming.map((index) => hourly.uv_index?.[index] ?? 0));
  const maxWind = Math.max(...upcoming.map((index) => hourly.wind_gusts_10m?.[index] ?? hourly.wind_speed_10m?.[index] ?? 0));
  const maxStorm = Math.max(...upcoming.map((index) => hourly.thunderstorm_probability?.[index] ?? 0));
  const feelsLike = current.apparent_temperature ?? current.temperature_2m;
  const group = getWeatherMeta(current.weather_code).group;

  if (group === "storm" || maxStorm >= 40) {
    return { title: "Storm safety", summary: "Thunderstorms are possible in the next few hours.", tips: ["Stay indoors when thunder is heard", "Avoid trees and open areas", "Keep devices charged"] };
  }
  if (maxRain > preferences.rainTolerance || group === "rain") {
    return { title: "Rain-ready", summary: `Rain probability reaches ${Math.round(maxRain)}% in the next six hours.`, tips: ["Bring an umbrella", "Wear grip-friendly shoes", "Never enter moving floodwater"] };
  }
  if (group === "snow" || feelsLike < preferences.coldThreshold) {
    return { title: "Cold-weather care", summary: `It currently feels like ${Math.round(feelsLike)}°C. Keep warm and dry.`, tips: ["Wear a warm jacket", "Use gloves and dry socks", "Watch for slippery paths"] };
  }
  if (maxUv > preferences.uvLimit || feelsLike > preferences.heatThreshold) {
    const summary = maxUv > preferences.uvLimit && feelsLike > preferences.heatThreshold
      ? `It feels like ${Math.round(feelsLike)}°C and UV may reach ${Math.round(maxUv)}.`
      : maxUv > preferences.uvLimit
        ? `UV may reach ${Math.round(maxUv)} in the next six hours.`
        : `It currently feels like ${Math.round(feelsLike)}°C.`;
    return { title: "Heat and sun care", summary, tips: ["Use SPF 30+ sunscreen", "Drink water regularly", "Seek shade near midday"] };
  }
  if (maxWind > preferences.windTolerance) {
    return { title: "Wind awareness", summary: `Gusts may reach ${Math.round(maxWind)} km/h.`, tips: ["Secure loose belongings", "Keep clear of weak branches", "Take care on two wheels"] };
  }
  if (group === "fog") {
    return { title: "Low visibility", summary: "Allow extra time and make sure others can see you.", tips: ["Use low-beam lights", "Slow down while travelling", "Wear something visible"] };
  }
  if ((current.relative_humidity_2m ?? 0) > 75) {
    return { title: "Humidity check", summary: "It may feel warmer and heavier than the temperature suggests.", tips: ["Choose breathable clothing", "Drink water regularly", "Take cooling breaks"] };
  }
  return { title: "Comfort check", summary: "The next few hours look generally comfortable.", tips: ["Check conditions before leaving", "Bring a light layer if needed", "Stay hydrated"] };
}

function formatTime(dateTime) {
  const hour = Number(dateTime.split("T")[1]?.slice(0, 2));
  if (Number.isNaN(hour)) return "";
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
}

function HourlyForecast({ hourly, currentTime, convertTemperature, current, preferences }) {
  if (!hourly?.time?.length) return null;
  const startingIndex = findCurrentHourIndex(hourly, currentTime);
  const advice = getSafetyAdvice(current, hourly, startingIndex, preferences);
  const upcomingHours = hourly.time.slice(startingIndex, startingIndex + 12).map((time, index) => {
    const actualIndex = startingIndex + index;
    return {
      time,
      temperature: hourly.temperature_2m[actualIndex],
      weatherCode: hourly.weather_code[actualIndex],
      isDay: hourly.is_day?.[actualIndex] !== 0,
      condition: getWeatherCondition(
        hourly.weather_code[actualIndex],
        hourly.is_day?.[actualIndex] !== 0
      ),
      rainChance: hourly.precipitation_probability[actualIndex] ?? 0,
    };
  });

  return (
    <section className="forecast-panel hourly-section" aria-labelledby="hourly-heading">
      <div className="section-heading">
        <div><span className="eyebrow">Next up</span><h2 id="hourly-heading">Hourly forecast</h2></div>
        <div className="hourly-heading-note">
          <span><strong>Rain chance</strong> shows how likely it is to rain.</span>
          <span className="swipe-hint">Scroll →</span>
        </div>
      </div>
      <div className="hourly-list">
        {upcomingHours.map((hour, index) => {
          const temperature = convertTemperature(hour.temperature);
          const rainLevel = hour.rainChance >= 60 ? "high" : hour.rainChance >= 30 ? "medium" : "low";

          return (
            <article
              className={`hourly-card ${index === 0 ? "is-now" : ""}`}
              key={hour.time}
              aria-label={`${index === 0 ? "Now" : formatTime(hour.time)}, ${hour.condition}, ${temperature} degrees, ${hour.rainChance}% chance of rain`}
            >
              <div className="hourly-card-heading">
                <p className="hourly-time">{index === 0 ? "Now" : formatTime(hour.time)}</p>
                {index === 0 && <span>Current</span>}
              </div>
              <WeatherIcon code={hour.weatherCode} size="small" isDay={hour.isDay} />
              <p className="hourly-temperature">{temperature}°</p>
              <p className="hourly-condition">{hour.condition}</p>
              <div className={`hourly-rain hourly-rain--${rainLevel}`}>
                <span>Rain chance</span>
                <strong>{hour.rainChance}%</strong>
              </div>
            </article>
          );
        })}
      </div>
      <aside className="weather-advice" aria-labelledby="advice-heading">
        <div className="advice-intro"><span className="advice-shield" aria-hidden="true"><i /></span><div><span className="eyebrow">Good to know</span><h3 id="advice-heading">{advice.title}</h3><p>{advice.summary}</p></div></div>
        <ul>{advice.tips.map((tip) => <li key={tip}><i aria-hidden="true" />{tip}</li>)}</ul>
      </aside>
    </section>
  );
}

export default HourlyForecast;
