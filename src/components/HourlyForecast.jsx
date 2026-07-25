import WeatherIcon from "./WeatherIcon";
import { getWeatherMeta } from "../utils/weatherCode";

function getSafetyAdvice(code, temperature, windSpeed) {
  const group = getWeatherMeta(code).group;

  if (group === "storm") {
    return {
      title: "Storm safety",
      summary: "Wait for the storm to pass when you can.",
      tips: ["Stay indoors", "Avoid trees and open areas", "Keep devices charged"],
    };
  }

  if (group === "rain") {
    return {
      title: "Rain-ready",
      summary: "A few small precautions can keep the trip comfortable.",
      tips: ["Bring an umbrella", "Wear grip-friendly shoes", "Avoid moving floodwater"],
    };
  }

  if (group === "snow") {
    return {
      title: "Cold-weather care",
      summary: "Keep warm and dry to reduce cold exposure.",
      tips: ["Wear an insulated jacket", "Use gloves and dry socks", "Watch for slippery paths"],
    };
  }

  if (group === "clear" || temperature >= 30) {
    return {
      title: "Sun protection",
      summary: "Protect your skin and take regular cool-down breaks.",
      tips: ["Use SPF 30+ sunscreen", "Drink water regularly", "Seek shade at midday"],
    };
  }

  if (windSpeed >= 25) {
    return {
      title: "Wind awareness",
      summary: "Strong gusts can make travel and loose objects less predictable.",
      tips: ["Secure loose belongings", "Keep clear of weak branches", "Take care on two wheels"],
    };
  }

  if (group === "fog") {
    return {
      title: "Low visibility",
      summary: "Give yourself more time and make sure others can see you.",
      tips: ["Use low-beam lights", "Slow down while travelling", "Wear something visible"],
    };
  }

  return {
    title: "Comfort check",
    summary: "Conditions are mild, but the weather can still shift.",
    tips: ["Carry a light layer", "Check the next few hours", "Stay hydrated"],
  };
}

function HourlyForecast({
  hourly,
  currentTime,
  convertTemperature,
  currentCode,
  currentTemperature,
  windSpeed,
}) {
  if (!hourly?.time?.length) return null;
  const advice = getSafetyAdvice(currentCode, currentTemperature, windSpeed);

  let startingIndex = hourly.time.findIndex((time) => time >= currentTime);
  if (startingIndex === -1) startingIndex = 0;

  const upcomingHours = hourly.time
    .slice(startingIndex, startingIndex + 12)
    .map((time, index) => {
      const actualIndex = startingIndex + index;
      return {
        time,
        temperature: hourly.temperature_2m[actualIndex],
        weatherCode: hourly.weather_code[actualIndex],
        rainChance: hourly.precipitation_probability[actualIndex],
      };
    });

  function formatTime(dateTime) {
    const hour = Number(dateTime.split("T")[1]?.slice(0, 2));
    if (Number.isNaN(hour)) return "";
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
  }

  return (
    <section className="forecast-panel hourly-section" aria-labelledby="hourly-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Next up</span>
          <h2 id="hourly-heading">Hourly forecast</h2>
        </div>
        <span className="swipe-hint">Scroll →</span>
      </div>

      <div className="hourly-list">
        {upcomingHours.map((hour, index) => (
          <article className={`hourly-card ${index === 0 ? "is-now" : ""}`} key={hour.time}>
            <p className="hourly-time">{index === 0 ? "Now" : formatTime(hour.time)}</p>
            <WeatherIcon code={hour.weatherCode} size="small" />
            <p className="hourly-temperature">{convertTemperature(hour.temperature)}°</p>
            <p className="hourly-rain">
              <i aria-hidden="true" /> {hour.rainChance ?? 0}%
            </p>
          </article>
        ))}
      </div>

      <aside className="weather-advice" aria-labelledby="advice-heading">
        <div className="advice-intro">
          <span className="advice-shield" aria-hidden="true"><i /></span>
          <div>
            <span className="eyebrow">Good to know</span>
            <h3 id="advice-heading">{advice.title}</h3>
            <p>{advice.summary}</p>
          </div>
        </div>
        <ul>
          {advice.tips.map((tip) => (
            <li key={tip}>
              <i aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

export default HourlyForecast;
