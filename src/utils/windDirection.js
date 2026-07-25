export function getWindDirection(degrees) {
  if (
    degrees === null ||
    degrees === undefined ||
    Number.isNaN(Number(degrees))
  ) {
    return "Unknown";
  }

  const directions = [
    "North",
    "Northeast",
    "East",
    "Southeast",
    "South",
    "Southwest",
    "West",
    "Northwest",
  ];

  const normalizedDegrees =
    ((Number(degrees) % 360) + 360) % 360;

  const index = Math.round(normalizedDegrees / 45) % 8;

  return directions[index];
}