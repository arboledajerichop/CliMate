export function findCurrentHourIndex(hourly, currentTime) {
  if (!hourly?.time?.length) return 0;
  const currentHour = currentTime?.slice(0, 13);
  const sameHour = hourly.time.findIndex((time) => time.slice(0, 13) === currentHour);
  if (sameHour >= 0) return sameHour;
  const nextHour = hourly.time.findIndex((time) => time >= currentTime);
  return nextHour >= 0 ? nextHour : hourly.time.length - 1;
}

function minutesOfDay(dateTime) {
  const time = dateTime?.split("T")[1]?.slice(0, 5);
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getDayPeriod(currentTime, sunrise, sunset, isDay = true) {
  const current = minutesOfDay(currentTime);
  const rise = minutesOfDay(sunrise);
  const set = minutesOfDay(sunset);

  if (current == null || rise == null || set == null) {
    return isDay ? "day" : "night";
  }
  if (current < rise || current >= set) return "night";
  if (current <= rise + 150) return "morning";
  if (current >= set - 80) return "sunset";
  return "day";
}

export function formatUpdatedAt(isoTime) {
  if (!isoTime) return "Updated recently";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(isoTime).getTime()) / 60000));
  if (minutes < 1) return "Updated just now";
  if (minutes === 1) return "Updated 1 minute ago";
  if (minutes < 60) return `Updated ${minutes} minutes ago`;
  return `Updated ${Math.floor(minutes / 60)}h ago`;
}
