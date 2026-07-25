const WEATHER_META = {
  clear: {
    label: "Clear sky",
    shortLabel: "Sunny",
    group: "clear",
    message: "A bright day to be outside.",
  },
  partlyCloudy: {
    label: "Partly cloudy",
    shortLabel: "Partly cloudy",
    group: "partly-cloudy",
    message: "Sun and clouds are sharing the sky.",
  },
  cloudy: {
    label: "Overcast",
    shortLabel: "Cloudy",
    group: "cloudy",
    message: "Soft light and a calm, cloudy sky.",
  },
  fog: {
    label: "Foggy",
    shortLabel: "Fog",
    group: "fog",
    message: "Visibility may be limited—take it slow.",
  },
  drizzle: {
    label: "Light drizzle",
    shortLabel: "Drizzle",
    group: "rain",
    message: "A light layer is a good idea.",
  },
  rain: {
    label: "Rain",
    shortLabel: "Rainy",
    group: "rain",
    message: "Umbrella weather. Stay dry out there.",
  },
  snow: {
    label: "Snow",
    shortLabel: "Snow",
    group: "snow",
    message: "Bundle up—it is snowy outside.",
  },
  showers: {
    label: "Rain showers",
    shortLabel: "Showers",
    group: "rain",
    message: "Keep an umbrella close by.",
  },
  thunder: {
    label: "Thunderstorm",
    shortLabel: "Storm",
    group: "storm",
    message: "Best to stay sheltered until it passes.",
  },
  unknown: {
    label: "Mixed conditions",
    shortLabel: "Mixed",
    group: "cloudy",
    message: "Check the hourly outlook before heading out.",
  },
};

export function getWeatherMeta(code) {
  if (code === 0) return WEATHER_META.clear;
  if (code === 1 || code === 2) return WEATHER_META.partlyCloudy;
  if (code === 3) return WEATHER_META.cloudy;
  if (code === 45 || code === 48) return WEATHER_META.fog;
  if (code >= 51 && code <= 57) return WEATHER_META.drizzle;
  if (code >= 61 && code <= 67) return WEATHER_META.rain;
  if (code >= 71 && code <= 77) return WEATHER_META.snow;
  if (code >= 80 && code <= 82) return WEATHER_META.showers;
  if (code >= 85 && code <= 86) return WEATHER_META.snow;
  if (code >= 95 && code <= 99) return WEATHER_META.thunder;
  return WEATHER_META.unknown;
}

export function getWeatherCondition(code) {
  return getWeatherMeta(code).label;
}

export function isWetWeather(code) {
  return (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99)
  );
}
