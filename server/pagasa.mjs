const PAGASA_BASE_URL = "https://www.pagasa.dost.gov.ph";
const FETCH_TIMEOUT = 8_500;
const STALE_CACHE_DURATION = 6 * 60 * 60 * 1000;
const REQUEST_HEADERS = {
  Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-PH,en;q=0.9",
  "Cache-Control": "no-cache",
  Referer: `${PAGASA_BASE_URL}/`,
  "User-Agent":
    "Mozilla/5.0 (compatible; CliMate/1.0; +https://vercel.app)",
};

let lastSuccessfulData = null;
let lastSuccessfulAt = 0;

const PAGASA_PAGES = [
  {
    scope: "inside-par",
    label: "Inside the Philippine Area of Responsibility",
    url: `${PAGASA_BASE_URL}/tropical-cyclone/severe-weather-bulletin`,
    fallback_urls: [
      `${PAGASA_BASE_URL}/tropical-cyclone-bulletin-iframe`,
    ],
  },
  {
    scope: "outside-par",
    label: "Outside the Philippine Area of Responsibility",
    url: `${PAGASA_BASE_URL}/tropical-cyclone-advisory-iframe`,
  },
];

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": status >= 400
        ? "no-store"
        : "public, max-age=60, s-maxage=300, stale-while-revalidate=1800",
      ...extraHeaders,
    },
  });
}

function decodeHtml(value = "") {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(/&(#x?[\da-f]+|[a-z]+);/gi, (entity, code) => {
    if (code[0] === "#") {
      const hex = code[1]?.toLowerCase() === "x";
      const number = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
    }
    return named[code.toLowerCase()] ?? entity;
  });
}

function cleanText(value = "") {
  return decodeHtml(
    value
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<\/\s*(?:p|li|h\d|div|td|tr)\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function safeOfficialUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(decodeHtml(value), PAGASA_BASE_URL);
    const allowed =
      url.protocol === "https:" &&
      (url.hostname === "pagasa.dost.gov.ph" ||
        url.hostname === "www.pagasa.dost.gov.ph" ||
        url.hostname === "pubfiles.pagasa.dost.gov.ph");
    return allowed ? url.href : "";
  } catch {
    return "";
  }
}

function firstMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? cleanText(match[1]) : "";
}

function firstUrl(html, pattern) {
  const match = html.match(pattern);
  return match ? safeOfficialUrl(match[1]) : "";
}

function extractList(html) {
  return [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => cleanText(match[1]))
    .filter(Boolean);
}

function extractPanel(html, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(
    new RegExp(
      `<div[^>]*class=["'][^"']*panel-heading[^"']*["'][^>]*>\\s*${escaped}[\\s\\S]{0,180}?<\\/div>\\s*<div[^>]*class=["'][^"']*panel-body[^"']*["'][^>]*>([\\s\\S]*?)<\\/div>`,
      "i"
    )
  );
  return match?.[1] || "";
}

function extractOutlook(html) {
  const items = extractList(html);
  const start = items.findIndex((item) => /track and intensity outlook/i.test(item));
  if (start < 0) return [];
  return items.slice(start + 1, start + 4).filter((item) => item.length > 35);
}

function truncate(value, length = 900) {
  if (!value || value.length <= length) return value;
  return `${value.slice(0, length).trim()}…`;
}

function parseBulletinSegment(segment, entry, title, id) {
  const heading = cleanText(title);
  const h5Values = [...segment.matchAll(/<h5\b[^>]*>([\s\S]*?)<\/h5>/gi)]
    .map((match) => cleanText(match[1]))
    .filter(Boolean);
  const signalNumbers = [...segment.matchAll(/signalno(\d)/gi)].map((match) => Number(match[1]));
  const forecastPanel = extractPanel(segment, "Forecast Position");
  const affectedMatch = segment.match(
    /Affected Areas[\s\S]{0,300}?<td\b[^>]*>([\s\S]*?)<\/td>/i
  );

  return {
    id: `${entry.scope}-${id}`,
    scope: entry.scope,
    scope_label: entry.label,
    title: heading,
    bulletin_number:
      firstMatch(segment, /Tropical Cyclone (?:Bulletin|Advisory)\s*#?\s*(\d+)/i) || "",
    issued_at: h5Values.find((value) => /^Issued at/i.test(value))?.replace(/^Issued at\s*/i, "") || "",
    valid_until:
      h5Values.find((value) => /Valid for broadcast/i.test(value))?.replace(/^\(|\)$/g, "") || "",
    summary:
      h5Values.find((value) => !/^Issued at/i.test(value) && !/Valid for broadcast/i.test(value)) || "",
    location: cleanText(extractPanel(segment, "Location of Eye/center")),
    movement: cleanText(extractPanel(segment, "Movement")),
    strength: cleanText(extractPanel(segment, "Strength")),
    forecast_positions: extractList(forecastPanel).slice(0, 8),
    track_outlook: extractOutlook(segment),
    wind_signal: signalNumbers.length ? Math.max(...signalNumbers) : null,
    affected_areas: truncate(cleanText(affectedMatch?.[1] || "")),
    bulletin_url: firstUrl(
      segment,
      /href=["'](https:\/\/pubfiles\.pagasa\.dost\.gov\.ph\/[^"']*bulletin[^"']*\.pdf)["']/i
    ),
    track_image_url: firstUrl(
      segment,
      /src=["'](https:\/\/pubfiles\.pagasa\.dost\.gov\.ph\/[^"']*\/track_[^"']+\.(?:png|jpe?g))["']/i
    ),
    signals_image_url: firstUrl(
      segment,
      /href\s*=\s*["'](https:\/\/pubfiles\.pagasa\.dost\.gov\.ph\/[^"']*\/signals_[^"']+\.(?:png|jpe?g))["']/i
    ),
    source_url: entry.url,
  };
}

function parsePage(html, entry) {
  const plainText = cleanText(html);
  const noActive = /No Active Tropical Cyclone/i.test(plainText);
  if (noActive) {
    const message = entry.scope === "inside-par"
      ? "No active tropical cyclone within the Philippine Area of Responsibility."
      : "No active tropical cyclone outside the Philippine Area of Responsibility.";
    return { ...entry, active: false, message, bulletins: [] };
  }

  const tabs = [...html.matchAll(
    /<a\b[^>]*href=["']#([^"']+)["'][^>]*class=["'][^"']*swb[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi
  )];
  const seen = new Set();
  const bulletins = [];

  for (const tab of tabs) {
    const [, id, title] = tab;
    if (seen.has(id)) continue;
    seen.add(id);
    const markerPattern = new RegExp(`<div\\b[^>]*id=["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i");
    const marker = markerPattern.exec(html);
    if (!marker) continue;
    const start = marker.index;
    const next = html.slice(start + marker[0].length).search(/<div\b[^>]*role=["']tabpanel["'][^>]*id=["']/i);
    const end = next >= 0 ? start + marker[0].length + next : html.length;
    const bulletin = parseBulletinSegment(html.slice(start, end), entry, title, id);
    bulletin.bulletin_number =
      firstMatch(tab[0], /data-header=["'][^"']*#\s*(\d+)["']/i) ||
      bulletin.bulletin_number;
    bulletins.push(bulletin);
  }

  return {
    ...entry,
    active: bulletins.length > 0,
    message: bulletins.length
      ? `${bulletins.length} active PAGASA tropical cyclone product${bulletins.length === 1 ? "" : "s"}`
      : "PAGASA did not publish a machine-readable bulletin on this page.",
    bulletins,
  };
}

async function fetchPage(entry) {
  const candidates = [entry.url, ...(entry.fallback_urls || [])];
  const failures = [];

  for (const url of candidates) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: REQUEST_HEADERS,
        redirect: "follow",
        cache: "no-store",
      });
      if (!response.ok) {
        failures.push(`HTTP ${response.status}`);
        continue;
      }

      const html = await response.text();
      if (html.length < 2_000 || !/PAGASA|Tropical Cyclone/i.test(html)) {
        failures.push("unexpected response");
        continue;
      }

      return parsePage(html, { ...entry, url });
    } catch (error) {
      failures.push(error instanceof Error && error.name === "AbortError" ? "timeout" : "connection failed");
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`${entry.scope}: ${failures.join(", ") || "unavailable"}`);
}

export async function getPagasaBulletins() {
  const results = await Promise.allSettled(PAGASA_PAGES.map(fetchPage));
  const pages = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  const failures = results
    .map((result, index) => result.status === "rejected"
      ? {
          scope: PAGASA_PAGES[index].scope,
          label: PAGASA_PAGES[index].label,
          message: "This PAGASA bulletin page could not be reached.",
        }
      : null)
    .filter(Boolean);

  if (!pages.length) {
    if (lastSuccessfulData && Date.now() - lastSuccessfulAt < STALE_CACHE_DURATION) {
      return {
        ...lastSuccessfulData,
        stale: true,
        partial: true,
        served_at: new Date().toISOString(),
        failures,
      };
    }
    throw new Error("PAGASA bulletin pages are temporarily unavailable.");
  }

  const bulletins = pages.flatMap((page) => page.bulletins);
  const data = {
    provider: "PAGASA",
    source_url: PAGASA_BASE_URL,
    fetched_at: new Date().toISOString(),
    active: bulletins.length > 0,
    stale: false,
    partial: pages.length !== PAGASA_PAGES.length,
    failures,
    bulletins,
    pages: PAGASA_PAGES.map((entry) => {
      const page = pages.find((candidate) => candidate.scope === entry.scope);
      return page
        ? {
            scope: page.scope,
            label: page.label,
            url: page.url,
            active: page.active,
            available: true,
            message: page.message,
          }
        : {
            scope: entry.scope,
            label: entry.label,
            url: entry.url,
            active: false,
            available: false,
            message: "Temporarily unavailable; use the official PAGASA link below.",
          };
    }),
  };

  lastSuccessfulData = data;
  lastSuccessfulAt = Date.now();
  return data;
}

export async function handlePagasaRequest(request) {
  if (request.method && request.method !== "GET") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const data = await getPagasaBulletins();
    return jsonResponse(data, 200, {
      "X-PAGASA-Status": data.stale ? "stale" : data.partial ? "partial" : "fresh",
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "PAGASA bulletins are temporarily unavailable.",
        code: "PAGASA_UNAVAILABLE",
        retryable: true,
        official_url: `${PAGASA_BASE_URL}/tropical-cyclone/severe-weather-bulletin`,
      },
      503,
      { "Retry-After": "30" }
    );
  }
}
