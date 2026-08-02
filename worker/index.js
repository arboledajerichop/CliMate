function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function handleGeocode(request) {
  const url = new URL(request.url);
  const upstream = new URL("https://geocoding-api.open-meteo.com/v1/search");

  for (const [key, value] of url.searchParams) {
    upstream.searchParams.append(key, value);
  }

  try {
    const response = await fetch(upstream, {
      headers: { Accept: "application/json" },
    });
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=120",
      },
    });
  } catch {
    return jsonResponse(
      { error: "Location search is temporarily unavailable." },
      502
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/geocode") {
      return handleGeocode(request);
    }

    let response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status === 404 && request.method === "GET" && acceptsHtml) {
      response = await env.ASSETS.fetch(
        new Request(new URL("/", request.url), request)
      );
    }

    return response;
  },
};
