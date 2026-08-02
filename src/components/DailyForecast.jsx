import WeatherIcon from "./WeatherIcon";
import { getWeatherMeta } from "../utils/weatherCode";

function DailyForecast({ daily, convertTemperature }) {
  if (!daily?.time?.length) return null;

  const formatDay = (date, index) => {
    if (index === 0) return "Today";
    return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(
      new Date(`${date}T12:00:00`)
    );
  };

  return (
    <section className="forecast-panel" aria-labelledby="week-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Plan ahead</span>
          <h2 id="week-heading">7-day outlook</h2>
        </div>
      </div>

      <div className="daily-list">
        {daily.time.map((date, index) => {
          const rainChance = daily.precipitation_probability_max[index] ?? 0;
          const condition = getWeatherMeta(daily.weather_code[index]).label;
          const high = convertTemperature(daily.temperature_2m_max[index]);
          const low = convertTemperature(daily.temperature_2m_min[index]);

          return (
            <article
              className="daily-row"
              key={date}
              aria-label={`${formatDay(date, index)}, ${condition}, ${rainChance}% chance of rain, high ${high} degrees, low ${low} degrees`}
            >
              <div className="daily-day">
                <strong>{formatDay(date, index)}</strong>
                <span>{condition}</span>
              </div>
              <WeatherIcon code={daily.weather_code[index]} size="small" />
              <div className="daily-rain">
                <span>Rain chance</span>
                <strong>{rainChance}%</strong>
              </div>
              <div className="daily-temps">
                <strong><small>H</small>{high}°</strong>
                <span><small>L</small>{low}°</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default DailyForecast;
