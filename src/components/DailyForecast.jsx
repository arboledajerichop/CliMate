import WeatherIcon from "./WeatherIcon";

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
        {daily.time.map((date, index) => (
          <article className="daily-row" key={date}>
            <p>{formatDay(date, index)}</p>
            <WeatherIcon code={daily.weather_code[index]} size="small" />
            <span className="daily-rain" aria-label={`${daily.precipitation_probability_max[index] ?? 0}% chance of rain`}>
              <i aria-hidden="true" /> {daily.precipitation_probability_max[index] ?? 0}%
            </span>
            <div className="daily-temps">
              <strong>{convertTemperature(daily.temperature_2m_max[index])}°</strong>
              <span>{convertTemperature(daily.temperature_2m_min[index])}°</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DailyForecast;
