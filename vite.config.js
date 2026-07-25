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
