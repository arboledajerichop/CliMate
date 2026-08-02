import AmbientSound from "./AmbientSound";
import { resolveWeatherScene } from "../utils/weatherScene";

const PARTICLES = Array.from({ length: 18 }, (_, index) => index);
const BUILDINGS = Array.from({ length: 6 }, (_, index) => index);
const TREES = Array.from({ length: 5 }, (_, index) => index);
const LEAVES = Array.from({ length: 8 }, (_, index) => index);

function WeatherScene({
  code,
  temperature,
  apparentTemperatureC,
  unit,
  windSpeed = 0,
  dayPeriod = "day",
  activity = "commute",
}) {
  const previewParameters =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const requestedPreview =
    import.meta.env.DEV && previewParameters?.get("preview") === "1"
      ? previewParameters.get("scene")
      : null;
  const previewState = ["sunny", "rainy", "cloudy", "windy", "stormy"].includes(
    requestedPreview
  )
    ? requestedPreview
    : null;
  const {
    sceneState,
    visualGroup,
    sceneMessage,
    needsUmbrella,
    isSunny,
    isHot,
    isStormy,
    isSnowy,
    isWindy,
    isCloudy,
  } = resolveWeatherScene({
    code,
    windSpeed,
    dayPeriod,
    apparentTemperatureC,
    previewState,
  });

  return (
    <section
      data-weather-state={sceneState}
      className={[
        "weather-scene",
        `weather-scene--${visualGroup}`,
        `weather-scene--state-${sceneState}`,
        `weather-scene--time-${dayPeriod}`,
        isSunny ? "is-sunny" : "",
        isWindy ? "is-windy" : "",
        isStormy ? "is-stormy" : "",
        isSnowy ? "is-snowy" : "",
      ].filter(Boolean).join(" ")}
      aria-label={`Illustration: ${sceneMessage}`}
    >
      <AmbientSound
        sceneState={sceneState}
        dayPeriod={dayPeriod}
        weatherCode={code}
      />

      <div className="scene-atmosphere" aria-hidden="true">
        <i className="scene-glow" />
        <i className="scene-haze" />
        <i className="scene-mist" />
      </div>

      <div className="scene-time-sky" aria-hidden="true">
        <i className="scene-moon" />
        <span className="scene-stars">
          <i /><i /><i /><i /><i /><i /><i /><i />
        </span>
      </div>

      <div className="scene-landscape" aria-hidden="true">
        <i className="scene-hill scene-hill--back" />
        <i className="scene-hill scene-hill--front" />
        <div className="scene-town">
          {BUILDINGS.map((building) => (
            <i key={building} />
          ))}
        </div>
        <div className="scene-trees">
          {TREES.map((tree) => (
            <i key={tree} />
          ))}
        </div>
      </div>

      <div className="scene-ground" aria-hidden="true">
        <i className="scene-path" />
        <i className="scene-ground-shine" />
      </div>

      <div className="scene-night-life" aria-hidden="true">
        <i className="scene-owl"><b /><b /></i>
        <i className="scene-firefly scene-firefly--one" />
        <i className="scene-firefly scene-firefly--two" />
        <i className="scene-firefly scene-firefly--three" />
        <i className="scene-firefly scene-firefly--four" />
      </div>

      <div className="scene-orb" aria-hidden="true" />
      <div className="scene-cloud scene-cloud--one" aria-hidden="true" />
      <div className="scene-cloud scene-cloud--two" aria-hidden="true" />
      <div className="scene-birds" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="scene-grass" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="scene-leaves" aria-hidden="true">
        {LEAVES.map((leaf) => (
          <i key={leaf} />
        ))}
      </div>
      <div className="scene-lightning scene-lightning--one" aria-hidden="true" />
      <div className="scene-lightning scene-lightning--two" aria-hidden="true" />
      <div className="wind-streaks" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="rain-puddle" aria-hidden="true">
        <i />
        <i />
      </div>

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
          isHot ? "student--hot" : "",
          isCloudy ? "student--cloudy" : "",
          isWindy ? "student--windy" : "",
          isStormy ? "student--stormy" : "",
          isSnowy ? "student--snowy" : "",
        ].filter(Boolean).join(" ")}
        data-activity={activity}
        aria-hidden="true"
      >
        <div className="student-shadow" />
        {needsUmbrella && (
          <div className="umbrella">
            <svg
              className="umbrella-canopy"
              viewBox="0 0 220 100"
              focusable="false"
            >
              <defs>
                <linearGradient id="umbrella-blue" x1="0" y1="0" x2="0.8" y2="1">
                  <stop offset="0" stopColor="#4d91cf" />
                  <stop offset="0.48" stopColor="#276baa" />
                  <stop offset="1" stopColor="#174b82" />
                </linearGradient>
                <linearGradient id="umbrella-shine" x1="0" y1="0" x2="1" y2="0.9">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
                  <stop offset="0.62" stopColor="#bfe5ff" stopOpacity="0.08" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                className="umbrella-shell"
                d="M5 84C17 37 58 10 110 9C162 10 203 37 215 84Q188 68 162 87Q136 69 110 88Q84 69 58 87Q32 68 5 84Z"
              />
              <path
                className="umbrella-highlight"
                d="M19 70C34 37 68 18 108 16C78 28 59 48 53 72C42 68 30 67 19 70Z"
              />
              <path className="umbrella-rib" d="M110 10Q77 39 58 87" />
              <path className="umbrella-rib" d="M110 10Q95 43 110 88" />
              <path className="umbrella-rib" d="M110 10Q143 39 162 87" />
              <path className="umbrella-top-cap" d="M106 10V4Q110 0 114 4V10Z" />
              <g className="umbrella-water">
                <circle className="umbrella-bead umbrella-bead--left" cx="78" cy="36" r="2.8" />
                <circle className="umbrella-bead umbrella-bead--center" cx="112" cy="28" r="2.4" />
                <circle className="umbrella-bead umbrella-bead--right" cx="151" cy="40" r="3" />
                <path className="umbrella-drip umbrella-drip--left" d="M58 86C54 92 55 97 58 99C61 97 62 92 58 86Z" />
                <path className="umbrella-drip umbrella-drip--center" d="M110 87C106 93 107 98 110 100C113 98 114 93 110 87Z" />
                <path className="umbrella-drip umbrella-drip--right" d="M162 86C158 92 159 97 162 99C165 97 166 92 162 86Z" />
              </g>
            </svg>
            <div className="umbrella-pole" />
            <svg className="umbrella-handle" viewBox="0 0 40 56" focusable="false">
              <path d="M29 2V30C29 45 23 53 14 53C7 53 3 48 3 41" />
            </svg>
          </div>
        )}
        {isSunny && (
          <>
            <div className="student-cap">
              <i />
            </div>
            {isHot && <div className="sweat-drop" />}
          </>
        )}
        <svg className="student-hair" viewBox="0 0 100 70" focusable="false">
          <path
            className="student-hair-back"
            d="M10 58C5 46 7 30 15 18C24 7 38 3 50 7C63 3 79 9 88 20C95 31 95 47 89 58L82 53C83 44 80 36 74 30C66 23 56 21 48 25C39 21 29 24 22 31C17 37 16 46 18 55Z"
          />
          <path
            className="student-hair-fill"
            d="M13 25C24 13 39 10 51 16C64 11 80 16 89 28L86 46C77 41 66 37 55 35C43 39 30 38 17 33Z"
          />
          <path
            className="student-hair-tuft student-hair-tuft--left"
            d="M39 16C33 13 28 8 28 3C36 6 42 10 46 17Z"
          />
          <path
            className="student-hair-tuft student-hair-tuft--center"
            d="M45 14C48 9 50 4 50 0C55 7 56 14 52 21Z"
          />
          <path
            className="student-hair-tuft student-hair-tuft--right"
            d="M51 19C64 8 80 9 92 17C79 16 68 20 57 26Z"
          />
          <path
            className="student-hair-fringe student-hair-fringe--left"
            d="M17 30C27 17 41 15 53 22C49 25 46 29 44 33C39 41 32 48 22 55C17 48 14 38 17 30Z"
          />
          <path
            className="student-hair-fringe student-hair-fringe--right"
            d="M49 22C61 15 76 19 87 29C80 27 73 28 68 32C74 35 80 39 85 45C75 41 65 38 54 34C52 30 50 26 49 22Z"
          />
          <path
            className="student-hair-part"
            d="M50 21C52 24 53 27 53 31"
          />
          <path
            className="student-hair-texture"
            d="M23 27C31 21 40 20 47 23M58 23C67 21 75 24 81 29"
          />
        </svg>
        <div className="student-head">
          <i className="student-ear student-ear--left" />
          <i className="student-ear student-ear--right" />
          <i className="student-brow student-brow--one" />
          <i className="student-brow student-brow--two" />
          <i className="student-eye student-eye--one" />
          <i className="student-eye student-eye--two" />
          <i className="student-nose" />
          <i className="student-cheek student-cheek--one" />
          <i className="student-cheek student-cheek--two" />
          <i className="student-smile" />
        </div>
        <div className="student-neck" />
        <div className="student-backpack" />
        <div className="student-body">
          <i className="student-collar student-collar--one" />
          <i className="student-collar student-collar--two" />
          <i className="student-shirt-seam" />
          {isWindy && <i className="student-jacket-flap" />}
        </div>
        <div className="student-arm student-arm--left"><i /></div>
        <div className="student-arm student-arm--right"><i /></div>
        {isHot && (
          <div className="sun-wipe">
            <i className="sun-wipe-upper" />
            <i className="sun-wipe-forearm" />
            <i className="sun-wipe-hand" />
            <span />
          </div>
        )}
        {isStormy && (
          <div className="storm-grip">
            <i />
            <i />
          </div>
        )}
        {needsUmbrella && !isStormy && (
          <div className="rain-grip">
            <i />
          </div>
        )}
        <div className="student-leg student-leg--left" />
        <div className="student-leg student-leg--right" />
        <div className="student-shoe student-shoe--left" />
        <div className="student-shoe student-shoe--right" />
        <div className={`activity-prop activity-prop--${activity}`}>
          <i /><span />
        </div>
      </div>

      <span className="scene-time-label">{dayPeriod === "day" ? "Daytime" : dayPeriod}</span>

      <div className="scene-message">
        <span>{sceneMessage}</span>
        <strong>
          {temperature}&deg;{unit}
        </strong>
      </div>
    </section>
  );
}

export default WeatherScene;
