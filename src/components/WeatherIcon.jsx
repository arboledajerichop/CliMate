import { getWeatherMeta } from "../utils/weatherCode";

function WeatherIcon({ code, size = "medium", decorative = false }) {
  const meta = getWeatherMeta(code);

  return (
    <span
      className={`weather-icon weather-icon--${meta.group} weather-icon--${size}`}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : meta.label}
    >
      <span className="wi-sun">
        <i />
        <i />
        <i />
        <i />
      </span>
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
