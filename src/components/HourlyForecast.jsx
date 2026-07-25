import WeatherIcon from "./WeatherIcon";

function HourlyForecast({ hourly, currentTime, convertTemperature }) {
  if (!hourly?.time?.length) return null;

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
    </section>
  );
}

export default HourlyForecast;
