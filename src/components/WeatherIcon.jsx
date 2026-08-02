import { getWeatherCondition, getWeatherMeta } from "../utils/weatherCode";

function WeatherIcon({ code, size = "medium", decorative = false, isDay = true }) {
  const meta = getWeatherMeta(code);
  const condition = getWeatherCondition(code, isDay);

  return (
    <span
      className={`weather-icon weather-icon--${meta.group} weather-icon--${size} weather-icon--${isDay ? "day" : "night"}`}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : condition}
    >
      <span className="wi-sun">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="wi-moon"><i /></span>
      <span className="wi-cloud">
        <i />
      </span>
      <span className="wi-rain">
        <i />
        <i />
        <i />
      </span>
      <span className="wi-snow">
        <i>•</i>
        <i>•</i>
        <i>•</i>
      </span>
      <span className="wi-bolt" />
      <span className="wi-fog">
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

export default WeatherIcon;
