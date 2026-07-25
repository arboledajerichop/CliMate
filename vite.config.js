import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const staticWorker = {
  name: 'meteomood-static-worker',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'server/index.js',
      source: `export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/geocode") {
      const upstream = new URL("https://geocoding-api.open-meteo.com/v1/search");
      for (const [key, value] of url.searchParams) {
        upstream.searchParams.append(key, value);
      }

      try {
        const response = await fetch(upstream, {
          headers: { "Accept": "application/json" }
        });
        return new Response(response.body, {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=120"
          }
        });
      } catch {
        return Response.json(
          { error: "Location search is temporarily unavailable." },
          { status: 502 }
        );
      }
    }

    let response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status === 404 && request.method === "GET" && acceptsHtml) {
      response = await env.ASSETS.fetch(new Request(new URL("/", request.url), request));
    }

    return response;
  }
};
`,
    })
  },
}

export default defineConfig({
  plugins: [react(), staticWorker],
})
