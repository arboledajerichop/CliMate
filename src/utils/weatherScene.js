import { getWeatherMeta, isWetWeather } from "./weatherCode.js";

const PREVIEW_GROUPS = {
  sunny: "clear",
  rainy: "rain",
  cloudy: "cloudy",
  windy: "cloudy",
  stormy: "storm",
};

export function resolveWeatherScene({
  code,
  windSpeed = 0,
  dayPeriod = "day",
  apparentTemperatureC = null,
  previewState = null,
}) {
  const meta = getWeatherMeta(code);
  const isNight = dayPeriod === "night";
  const preview = previewState && PREVIEW_GROUPS[previewState] ? previewState : null;
  const isStormy = preview ? preview === "stormy" : meta.group === "storm";
  const isSnowy = !preview && meta.group === "snow";
  const needsUmbrella = preview
    ? ["rainy", "stormy"].includes(preview)
    : isWetWeather(code);
  const isWindy = preview
    ? preview === "windy"
    : windSpeed >= 25 && !needsUmbrella && !isSnowy;
  const isSunny = preview
    ? preview === "sunny"
    : meta.group === "clear" && !isNight;

  const sceneState =
    preview ||
    (isStormy
      ? "stormy"
      : isSnowy
        ? "snowy"
        : needsUmbrella
          ? "rainy"
          : isWindy
            ? "windy"
            : isSunny
              ? "sunny"
              : "cloudy");

  const isHot =
    isSunny &&
    (preview === "sunny" ||
      (Number.isFinite(apparentTemperatureC) && apparentTemperatureC >= 30));

  let sceneMessage = meta.message;
  if (sceneState === "sunny") {
    sceneMessage = isHot
      ? "Sunny and hot - hydrate and take cooling breaks."
      : dayPeriod === "morning"
        ? "A clear morning with gentle daylight."
        : dayPeriod === "sunset"
          ? "Clear skies as the daylight begins to fade."
          : "Clear daylight - sun protection is still a good idea.";
  } else if (sceneState === "windy") {
    sceneMessage = "Breezy out there - keep loose belongings close.";
  } else if (meta.group === "clear" && isNight) {
    sceneMessage = "A clear, calm night under the moon.";
  } else if (sceneState === "cloudy" && isNight && meta.group !== "fog") {
    sceneMessage = "A calm night under a cloudy sky.";
  }

  return {
    sceneState,
    visualGroup: preview ? PREVIEW_GROUPS[preview] : meta.group,
    sceneMessage,
    needsUmbrella,
    isSunny,
    isHot,
    isStormy,
    isSnowy,
    isWindy,
    isCloudy: sceneState === "cloudy",
  };
}
