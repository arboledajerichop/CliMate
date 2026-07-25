const GEOCODING_API_URL =
  "https://geocoding-api.open-meteo.com/v1/search";

export async function searchLocations(searchText) {
  const cleanSearchText = searchText.trim();

  if (cleanSearchText.length < 2) {
    return [];
  }

  const parameters = new URLSearchParams({
    name: cleanSearchText,
    count: "8",
    language: "en",
    format: "json",
  });

  const response = await fetch(
    `${GEOCODING_API_URL}?${parameters}`
  );

  if (!response.ok) {
    throw new Error("Unable to search for locations.");
  }

  const data = await response.json();

  return data.results ?? [];
}