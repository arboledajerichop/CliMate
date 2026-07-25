import { getWeatherMeta, isWetWeather } from "../utils/weatherCode";

const PARTICLES = Array.from({ length: 14 }, (_, index) => index);

function WeatherScene({ code, temperature, unit, windSpeed = 0 }) {
  const meta = getWeatherMeta(code);
  const needsUmbrella = isWetWeather(code);
  const isSunny = meta.group === "clear";
  const isStormy = meta.group === "storm";
  const isSnowy = meta.group === "snow";
  const isWindy = windSpeed >= 25 && !needsUmbrella && !isSnowy;
  const sceneMessage = isWindy
    ? "Breezy out there—hold onto your cap."
    : meta.message;

  return (
    <section
      className={[
        "weather-scene",
        `weather-scene--${meta.group}`,
        isSunny ? "is-sunny" : "",
        isWindy ? "is-windy" : "",
        isStormy ? "is-stormy" : "",
        isSnowy ? "is-snowy" : "",
      ].filter(Boolean).join(" ")}
      aria-label={`Illustration: ${sceneMessage}`}
    >
      <div className="scene-orb" aria-hidden="true" />
      <div className="scene-cloud scene-cloud--one" aria-hidden="true" />
      <div className="scene-cloud scene-cloud--two" aria-hidden="true" />
      <div className="scene-lightning scene-lightning--one" aria-hidden="true" />
      <div className="scene-lightning scene-lightning--two" aria-hidden="true" />

      <div className="scene-particles" aria-hidden="true">
        {PARTICLES.map((particle) => (
          <i key={particle} />
        ))}
      </div>

      <div
        className={[
          "student",
          needsUmbrella ? "has-umbrella" : "",
          isSunny ? "student--sunny" : "",
          isWindy ? "student--windy" : "",
          isStormy ? "student--stormy" : "",
          isSnowy ? "student--snowy" : "",
        ].filter(Boolean).join(" ")}
        aria-hidden="true"
      >
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
        {isSunny && (
          <>
            <div className="student-cap">
              <i />
            </div>
            <div className="sweat-drop" />
          </>
        )}
        {isWindy && <div className="student-scarf"><i /></div>}
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
        <span>{sceneMessage}</span>
        <strong>
          {temperature}°{unit}
        </strong>
      </div>
    </section>
  );
}

export default WeatherScene;
