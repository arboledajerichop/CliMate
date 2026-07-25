import { getWeatherMeta, isWetWeather } from "../utils/weatherCode";

const PARTICLES = Array.from({ length: 14 }, (_, index) => index);

function WeatherScene({ code, temperature, unit }) {
  const meta = getWeatherMeta(code);
  const needsUmbrella = isWetWeather(code);

  return (
    <section
      className={`weather-scene weather-scene--${meta.group}`}
      aria-label={`Illustration: ${meta.message}`}
    >
      <div className="scene-orb" aria-hidden="true" />
      <div className="scene-cloud scene-cloud--one" aria-hidden="true" />
      <div className="scene-cloud scene-cloud--two" aria-hidden="true" />

      <div className="scene-particles" aria-hidden="true">
        {PARTICLES.map((particle) => (
          <i key={particle} />
        ))}
      </div>

      <div className={`student ${needsUmbrella ? "has-umbrella" : ""}`} aria-hidden="true">
        <div className="student-shadow" />
        {needsUmbrella && (
          <div className="umbrella">
            <div className="umbrella-canopy">
              <i />
              <i />
              <i />
            </div>
            <div className="umbrella-pole" />
            <div className="umbrella-handle" />
          </div>
        )}
        <div className="student-hair" />
        <div className="student-head">
          <i className="student-ear" />
          <i className="student-eye student-eye--one" />
          <i className="student-eye student-eye--two" />
          <i className="student-smile" />
        </div>
        <div className="student-neck" />
        <div className="student-backpack" />
        <div className="student-body">
          <i className="student-collar student-collar--one" />
          <i className="student-collar student-collar--two" />
        </div>
        <div className="student-arm student-arm--left" />
        <div className="student-arm student-arm--right" />
        <div className="student-leg student-leg--left" />
        <div className="student-leg student-leg--right" />
        <div className="student-shoe student-shoe--left" />
        <div className="student-shoe student-shoe--right" />
      </div>

      <div className="scene-message">
        <span>{meta.message}</span>
        <strong>
          {temperature}°{unit}
        </strong>
      </div>
    </section>
  );
}

export default WeatherScene;
