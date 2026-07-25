function CurrentWeather({
  location,
  condition,
  temperature,
  feelsLike,
}) {
  return (
    <section className="current-weather">
      <p className="location">{location}</p>

      <div className="weather-summary">
        <div>
          <p className="weather-condition">{condition}</p>

          <h2 className="temperature">
            {temperature}°C
          </h2>

          <p className="feels-like">
            Feels like {feelsLike}°C
          </p>
        </div>

        <div className="weather-placeholder" aria-label={condition}>
          ☀️
        </div>
      </div>
    </section>
  );
}

export default CurrentWeather;