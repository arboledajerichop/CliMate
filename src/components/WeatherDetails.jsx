import { getWindDirection } from "../utils/windDirection";

const details = [
  { key: "humidity", label: "Humidity", icon: "drop" },
  { key: "wind", label: "Wind", icon: "wind" },
  { key: "rain", label: "Chance of rain", icon: "rain" },
  { key: "pressure", label: "Pressure", icon: "gauge" },
];

function WeatherDetails({
  humidity,
  windSpeed,
  windDirection,
  rainChance,
  pressure,
}) {
  const values = {
    humidity: `${humidity}%`,
    wind: `${windSpeed} km/h`,
    rain: `${rainChance}%`,
    pressure: `${pressure} hPa`,
  };

  const notes = {
    humidity: humidity > 70 ? "Feels humid" : "Comfortable",
    wind: `${getWindDirection(windDirection)} direction`,
    rain: rainChance > 45 ? "Umbrella advised" : "Low chance",
    pressure: pressure < 1005 ? "Low pressure" : "Steady",
  };

  return (
    <section className="weather-details" aria-label="Weather highlights">
      {details.map((detail) => (
        <article className="detail-card" key={detail.key}>
          <span className={`detail-icon detail-icon--${detail.icon}`} aria-hidden="true">
            <i />
          </span>
          <div>
            <p className="detail-label">{detail.label}</p>
            <p className="detail-value">{values[detail.key]}</p>
            <span className="detail-note">{notes[detail.key]}</span>
          </div>
        </article>
      ))}
    </section>
  );
}

export default WeatherDetails;
