const CACHE_DURATION = 5 * 60 * 1000;
const STALE_CACHE_DURATION = 60 * 60 * 1000;

let cachedData = null;
let cachedAt = 0;

export async function getPagasaBulletins({ force = false } = {}) {
  if (!force && cachedData && Date.now() - cachedAt < CACHE_DURATION) {
    return cachedData;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 22_000);

  try {
    const response = await fetch("/api/pagasa", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok || !payload) {
      if (cachedData && Date.now() - cachedAt < STALE_CACHE_DURATION) {
        return {
          ...cachedData,
          stale: true,
          partial: true,
          client_fallback: true,
        };
      }
      throw new Error(
        payload?.error || "PAGASA bulletins could not be reached right now."
      );
    }

    cachedData = payload;
    cachedAt = Date.now();
    return payload;
  } catch (error) {
    if (cachedData && Date.now() - cachedAt < STALE_CACHE_DURATION) {
      return {
        ...cachedData,
        stale: true,
        partial: true,
        client_fallback: true,
      };
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("PAGASA took too long to respond. Please try again.", {
        cause: error,
      });
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
