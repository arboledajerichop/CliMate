import { getWeatherCondition, getWeatherMeta } from "../utils/weatherCode";
import { findCurrentHourIndex } from "../utils/weatherTime";

const GUIDE_PROFILES = {
  storm: {
    label: "Storm safety",
    title: "Stay sheltered and ready",
    leadIcon: "⛈️",
    summary: "Lightning, heavy rain, and sudden gusts can become dangerous quickly.",
    dos: [
      ["🔋", "Charge essential devices", "Keep a phone, flashlight, and power bank ready."],
      ["🏠", "Stay in a sturdy shelter", "Move away from windows when thunder is close."],
      ["📻", "Follow official updates", "Check trusted weather and local authority advisories."],
      ["🐾", "Bring pets inside", "Keep children and animals away from floodwater."],
    ],
    donts: [
      ["🌊", "Never enter floodwater", "Depth and current strength are difficult to judge."],
      ["🌳", "Avoid trees and open ground", "These offer poor protection from lightning."],
      ["🔌", "Avoid wet electrical equipment", "Disconnect power only when it is safe to do so."],
    ],
  },
  rain: {
    label: "Rain-ready",
    title: "Stay dry and steady",
    leadIcon: "🌧️",
    summary: "Wet roads and surfaces need more preparation, even during lighter rain.",
    dos: [
      ["☂️", "Carry an umbrella", "Keep it accessible instead of buried in a bag."],
      ["🥾", "Wear shoes with grip", "Choose secure footwear for slick paths and stairs."],
      ["🎒", "Protect important items", "Use a waterproof pouch for devices and documents."],
      ["🐾", "Dry children and pets", "Change wet clothes and paws soon after returning."],
    ],
    donts: [
      ["🌊", "Do not cross moving water", "Even shallow floodwater can knock a person down."],
      ["🚗", "Do not rush on wet roads", "Leave more braking distance and use smooth movements."],
      ["⚡", "Avoid exposed areas in thunder", "Go indoors as soon as thunder is heard."],
    ],
  },
  hot: {
    label: "Heat and sun care",
    title: "Cool down before you overheat",
    leadIcon: "☀️",
    summary: "Heat can build gradually, especially for children, older adults, and pets.",
    dos: [
      ["💧", "Drink water regularly", "Hydrate before thirst becomes noticeable."],
      ["🧴", "Use SPF 30+ sunscreen", "Reapply after sweating or extended time outdoors."],
      ["👕", "Wear light breathable clothes", "Loose, pale fabrics help release body heat."],
      ["🐾", "Protect children and pets", "Provide shade and test hot pavement with your hand."],
    ],
    donts: [
      ["🚗", "Never wait in a parked vehicle", "Cabin temperatures can rise dangerously fast."],
      ["🏃", "Avoid strenuous midday activity", "Move exercise to a cooler forecast window."],
      ["🥤", "Do not rely on sugary drinks", "Water should remain your main source of hydration."],
    ],
  },
  cold: {
    label: "Cold-weather care",
    title: "Keep warmth close",
    leadIcon: "🧣",
    summary: "Cold and damp conditions can lower body temperature faster than expected.",
    dos: [
      ["🧥", "Wear several dry layers", "Use a warm outer layer that blocks wind and moisture."],
      ["🍲", "Sip something warm", "Soup or a warm drink can make indoor recovery more comfortable."],
      ["🧤", "Protect hands and feet", "Gloves and dry socks help prevent cold injury."],
      ["🐾", "Check children and pets", "Limit exposure and provide a warm, dry resting place."],
    ],
    donts: [
      ["👚", "Do not remain in wet clothes", "Change promptly because damp fabric loses insulation."],
      ["🔥", "Do not use unsafe indoor heaters", "Keep ventilation clear and heaters away from fabric."],
      ["🧊", "Do not ignore numbness", "Move somewhere warm if skin becomes numb or unusually pale."],
    ],
  },
  snow: {
    label: "Snow and ice safety",
    title: "Keep warm and move carefully",
    leadIcon: "❄️",
    summary: "Snow adds cold stress, slippery surfaces, and reduced visibility.",
    dos: [
      ["🧤", "Cover exposed skin", "Use gloves, warm socks, and a hat to reduce frostbite risk."],
      ["🥾", "Use traction-friendly footwear", "Take short steps and keep your hands available for balance."],
      ["🍲", "Plan a warm meal", "Warm soup and drinks make recovery breaks more comfortable."],
      ["🚘", "Prepare before driving", "Clear windows fully and carry basic winter supplies."],
    ],
    donts: [
      ["🧊", "Avoid untreated icy paths", "Choose cleared routes whenever possible."],
      ["💨", "Do not ignore wind chill", "Strong wind can make cold exposure more dangerous."],
      ["🔥", "Never block heater ventilation", "Keep fuel-burning equipment safely vented."],
    ],
  },
  wind: {
    label: "Wind awareness",
    title: "Secure first, then head out",
    leadIcon: "🍃",
    summary: "Loose objects and unstable branches can become hazards during stronger gusts.",
    dos: [
      ["🪢", "Secure loose outdoor items", "Bring in lightweight furniture, signs, and containers."],
      ["🕶️", "Protect your eyes", "Glasses can help with dust and wind-blown debris."],
      ["🚪", "Close doors and windows", "Prevent sudden gusts from damaging hinges or belongings."],
      ["🎒", "Fasten what you carry", "Keep hats, bags, and loose clothing controlled."],
    ],
    donts: [
      ["🌳", "Avoid weak trees and signs", "Branches and unsecured structures can fall suddenly."],
      ["🚲", "Do not underestimate crosswinds", "Cyclists and high-sided vehicles need extra care."],
      ["🔥", "Avoid open flames", "Wind can spread fire and sparks rapidly."],
    ],
  },
  fog: {
    label: "Low-visibility care",
    title: "Slow down and stay visible",
    leadIcon: "🌫️",
    summary: "Fog shortens the distance available to see and react to hazards.",
    dos: [
      ["💡", "Use low-beam lights", "High beams can reflect glare back through dense fog."],
      ["🦺", "Wear something visible", "Reflective or bright clothing helps other road users see you."],
      ["⏱️", "Allow more travel time", "Move slowly and leave a larger following distance."],
      ["👂", "Reduce distractions", "Keep attention available for nearby traffic and signals."],
    ],
    donts: [
      ["🚗", "Do not follow lights too closely", "The vehicle ahead may stop without warning."],
      ["⚠️", "Do not stop in a travel lane", "Move completely off the road if stopping is necessary."],
      ["🏃", "Avoid poorly lit road edges", "Choose a visible, separated route for walking or exercise."],
    ],
  },
  humid: {
    label: "Humidity care",
    title: "Help your body release heat",
    leadIcon: "💦",
    summary: "High humidity slows sweat evaporation and can make mild temperatures feel tiring.",
    dos: [
      ["💧", "Hydrate consistently", "Drink small amounts regularly during activity."],
      ["👕", "Choose breathable clothing", "Lightweight fabric helps moisture and heat escape."],
      ["🌀", "Improve indoor airflow", "Use safe ventilation or a fan when conditions allow."],
      ["🐾", "Watch for heat stress", "Check children, older adults, and pets more often."],
    ],
    donts: [
      ["🏃", "Do not ignore heavy fatigue", "Rest somewhere cooler if you feel weak or dizzy."],
      ["🧺", "Avoid storing damp fabric", "Dry towels and clothes promptly to discourage mildew."],
      ["☕", "Limit dehydrating drinks", "Balance caffeine and alcohol with additional water."],
    ],
  },
  calm: {
    label: "Everyday weather care",
    title: "A flexible day with simple preparation",
    leadIcon: "🌤️",
    summary: "Conditions look manageable, but a few small checks can keep the day comfortable.",
    dos: [
      ["🧴", "Remember daytime UV", "Clouds do not block every ultraviolet ray."],
      ["💧", "Keep water nearby", "Routine hydration still supports comfort and focus."],
      ["🧥", "Carry a light layer", "It helps if wind increases or temperatures fall later."],
      ["📱", "Check before longer trips", "Conditions may differ across your destination."],
    ],
    donts: [
      ["☁️", "Do not assume clouds mean no UV", "Use protection during extended outdoor exposure."],
      ["🗑️", "Do not leave loose litter", "Even light wind can carry it into drains and waterways."],
      ["⏰", "Do not rely on an old forecast", "Check again before weather-sensitive plans."],
    ],
  },
};

function formatHour(dateTime) {
  const hour = Number(dateTime?.split("T")[1]?.slice(0, 2));
  if (!Number.isFinite(hour)) return "";
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
}

function formatMoment(dateTime, currentTime) {
  const day = dateTime?.slice(0, 10) === currentTime?.slice(0, 10) ? "Today" : "Tomorrow";
  return `${day}, ${formatHour(dateTime)}`;
}

function numberAt(hourly, field, index, fallback = 0) {
  return Number(hourly?.[field]?.[index] ?? fallback);
}

function findBestIndex(startIndex, endIndex, score) {
  let bestIndex = startIndex;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let index = startIndex; index <= endIndex; index += 1) {
    const nextScore = score(index);
    if (nextScore < bestScore) {
      bestScore = nextScore;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function guideType(hourly, index) {
  const code = numberAt(hourly, "weather_code", index, 3);
  const meta = getWeatherMeta(code);
  const feelsLike = numberAt(hourly, "apparent_temperature", index, numberAt(hourly, "temperature_2m", index, 20));
  const rain = numberAt(hourly, "precipitation_probability", index);
  const uv = numberAt(hourly, "uv_index", index);
  const gust = numberAt(hourly, "wind_gusts_10m", index, numberAt(hourly, "wind_speed_10m", index));
  const humidity = numberAt(hourly, "relative_humidity_2m", index);
  const isDay = numberAt(hourly, "is_day", index, 1) === 1;

  if (meta.group === "storm") return "storm";
  if (meta.group === "snow") return "snow";
  if (meta.group === "fog") return "fog";
  if (["rain", "drizzle"].includes(meta.group) || rain >= 60) return "rain";
  if (feelsLike <= 15) return "cold";
  if ((feelsLike >= 31 || uv >= 6) && isDay) return "hot";
  if (gust >= 35) return "wind";
  if (humidity >= 82 && feelsLike >= 27) return "humid";
  return "calm";
}

function createGoodMoments(hourly, currentTime, type) {
  const startIndex = findCurrentHourIndex(hourly, currentTime);
  const endIndex = Math.min(startIndex + 23, hourly.time.length - 1);
  const dryIndex = findBestIndex(startIndex, endIndex, (index) => {
    const rain = numberAt(hourly, "precipitation_probability", index);
    const precipitation = numberAt(hourly, "precipitation", index);
    const gust = numberAt(hourly, "wind_gusts_10m", index);
    const nightPenalty = numberAt(hourly, "is_day", index, 1) === 1 ? 0 : 28;
    return rain * 1.6 + precipitation * 25 + Math.max(0, gust - 30) + nightPenalty;
  });
  const coolestIndex = findBestIndex(startIndex, endIndex, (index) => {
    const feelsLike = numberAt(hourly, "apparent_temperature", index, 24);
    const rain = numberAt(hourly, "precipitation_probability", index);
    const nightPenalty = numberAt(hourly, "is_day", index, 1) === 1 ? 0 : 35;
    return Math.abs(feelsLike - 24) * 4 + rain + nightPenalty;
  });
  const calmIndex = findBestIndex(startIndex, endIndex, (index) => {
    const gust = numberAt(hourly, "wind_gusts_10m", index);
    const rain = numberAt(hourly, "precipitation_probability", index);
    return gust * 2 + rain;
  });
  const warmIndex = findBestIndex(startIndex, endIndex, (index) =>
    -numberAt(hourly, "apparent_temperature", index, 20)
  );
  const driestRain = Math.round(numberAt(hourly, "precipitation_probability", dryIndex));

  if (["hot", "calm", "humid"].includes(type)) {
    return [
      ["🧺", "Laundry window", `${formatMoment(hourly.time[dryIndex], currentTime)} has the lowest rain risk at ${driestRain}%.`],
      ["🚶", "Comfortable outdoor window", `${formatMoment(hourly.time[coolestIndex], currentTime)} should feel closest to comfortable.`],
      ["🍧", "Cool-down break", "A cool shower, chilled fruit, or a homemade cold dessert can make the warmest part of the day easier."],
    ];
  }

  if (["cold", "snow"].includes(type)) {
    return [
      ["🌡️", "Warmest forecast window", `${formatMoment(hourly.time[warmIndex], currentTime)} should be the least cold period ahead.`],
      ["🍲", "Warm meal break", "Plan soup, porridge, or a warm drink after time outdoors."],
      ["🧺", "Dry damp clothing", "Use a safe indoor drying area so the next set of layers stays warm."],
    ];
  }

  if (type === "wind") {
    return [
      ["🍃", "Calmest available window", `${formatMoment(hourly.time[calmIndex], currentTime)} has the gentlest forecast gusts.`],
      ["🏠", "Secure the surroundings", "Use the quieter period to bring loose outdoor items inside."],
      ["🫖", "Indoor reset", "Choose an indoor meal or drink break while stronger gusts pass."],
    ];
  }

  if (type === "fog") {
    return [
      ["🚗", "Better travel window", `${formatMoment(hourly.time[dryIndex], currentTime)} offers the best overall rain and daylight balance.`],
      ["☕", "Wait somewhere safe", "If visibility is very poor, pause in a safe location rather than rushing."],
      ["🧼", "Indoor tasks", "Use the low-visibility period for cleaning, cooking, or preparation indoors."],
    ];
  }

  return [
    ["☂️", driestRain < 60 ? "Driest available window" : "No reliably dry window", `${formatMoment(hourly.time[dryIndex], currentTime)} has the lowest rain chance at ${driestRain}%.`],
    ["🔋", "Preparation break", "Charge devices, review routes, and place rain gear near the door."],
    ["🍲", "Comfort indoors", "A warm shower, soup, or an indoor project suits the wet period."],
  ];
}

function ReminderList({ title, tone, reminders }) {
  return (
    <div className={`ready-reminders ready-reminders--${tone}`}>
      <h3>{title}</h3>
      <ul>
        {reminders.map(([icon, label, detail], index) => (
          <li key={label} style={{ "--sticker-delay": `${index * -0.55}s` }}>
            <span className="ready-sticker" aria-hidden="true">{icon}</span>
            <div><strong>{label}</strong><p>{detail}</p></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeatherReadyGuide({ hourly, currentTime, selectedIndex, selectedDayPeriod }) {
  if (!hourly?.time?.length) return null;
  const safeIndex = Math.min(hourly.time.length - 1, Math.max(0, selectedIndex));
  const type = guideType(hourly, safeIndex);
  const profile = GUIDE_PROFILES[type];
  const code = numberAt(hourly, "weather_code", safeIndex, 3);
  const isDay = numberAt(hourly, "is_day", safeIndex, 1) === 1;
  const condition = getWeatherCondition(code, isDay);
  const goodMoments = createGoodMoments(hourly, currentTime, type);

  return (
    <section className={`forecast-panel weather-ready weather-ready--${type}`} aria-labelledby="ready-heading">
      <div className="ready-heading">
        <div>
          <span className="eyebrow">Preventive measures and reminders</span>
          <h2 id="ready-heading">Your weather-ready guide</h2>
          <p>Practical steps for the forecast hour selected in Day in Motion.</p>
        </div>
        <div className="ready-selected-hour">
          <span>{formatMoment(hourly.time[safeIndex], currentTime)}</span>
          <strong>{condition}</strong>
          <small>{selectedDayPeriod === "day" ? "Daytime" : selectedDayPeriod}</small>
        </div>
      </div>

      <article className="ready-lead">
        <span className="ready-lead-sticker" aria-hidden="true">{profile.leadIcon}</span>
        <div><span>{profile.label}</span><h3>{profile.title}</h3><p>{profile.summary}</p></div>
      </article>

      <div className="ready-guide-grid">
        <ReminderList title="Do this" tone="do" reminders={profile.dos} />
        <ReminderList title="Avoid this" tone="avoid" reminders={profile.donts} />
        <ReminderList title="Good moments" tone="moments" reminders={goodMoments} />
      </div>
    </section>
  );
}

export default WeatherReadyGuide;
