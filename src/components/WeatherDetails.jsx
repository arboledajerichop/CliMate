import { getWindDirection } from "../utils/windDirection";

const details = [
  { key: "humidity", label: "Humidity", icon: "drop" },
  { key: "wind", label: "Wind", icon: "wind" },
  { key: "rain", label: "Rain this hour", icon: "rain" },
  { key: "uv", label: "UV index", icon: "sun" },
  { key: "pressure", label: "Pressure", icon: "gauge" },
];

function uvNote(uv) {
  if (uv >= 8) return "Very high protection";
  if (uv >= 6) return "High protection";
  if (uv >= 3) return "Use sun protection";
  return "Low exposure";
}

function WeatherDetails({ humidity, windSpeed, windDirection, rainChance, pressure, uvIndex }) {
  const values = { humidity: `${humidity}%`, wind: `${windSpeed} km/h`, rain: `${rainChance}%`, uv: String(uvIndex), pressure: `${pressure} hPa` };
  const notes = {
    humidity: humidity > 80 ? "Very humid" : humidity > 70 ? "Feels humid" : "Comfortable",
    wind: `From the ${getWindDirection(windDirection)}`,
    rain: rainChance > 60 ? "Umbrella recommended" : rainChance > 30 ? "Keep one nearby" : "Low chance",
    uv: uvNote(uvIndex),
    pressure: pressure < 1005 ? "Low pressure" : pressure > 1020 ? "High pressure" : "Steady",
  };

  return (
    <section className="weather-details" aria-label="Weather highlights">
      {details.map((detail) => (
        <article className="detail-card" key={detail.key}>
          <span className={`detail-icon detail-icon--${detail.icon}`} aria-hidden="true"><i /></span>
          <div><p className="detail-label">{detail.label}</p><p className="detail-value">{values[detail.key]}</p><span className="detail-note">{notes[detail.key]}</span></div>
        </article>
      ))}
    </section>
  );
}

export default WeatherDetails;
