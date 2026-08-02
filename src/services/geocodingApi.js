const GEOCODING_API_URL =
  "https://geocoding-api.open-meteo.com/v1/search";

async function fetchWithTimeout(url, timeout = 9000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The search took too long. Please try again.", {
        cause: error,
      });
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

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

  const response = await fetchWithTimeout(`${GEOCODING_API_URL}?${parameters}`);

  if (!response.ok) {
    throw new Error("Unable to search for locations.");
  }

  const data = await response.json();

  return data.results ?? [];
}
