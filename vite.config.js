import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { handlePagasaRequest } from "./server/pagasa.mjs";

const workerSource = readFileSync(
  new URL("./worker/index.js", import.meta.url),
  "utf8"
);

const hostedAppBundle = {
  name: "jerichomood-hosted-app-bundle",
  configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      if (!request.url?.startsWith("/api/pagasa")) {
        next();
        return;
      }
      const webRequest = new Request(
        new URL(request.url, `http://${request.headers.host || "localhost"}`),
        { method: request.method, headers: request.headers }
      );
      const webResponse = await handlePagasaRequest(webRequest);
      response.statusCode = webResponse.status;
      webResponse.headers.forEach((value, key) => response.setHeader(key, value));
      response.end(Buffer.from(await webResponse.arrayBuffer()));
    });
  },
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "server/index.js",
      source: workerSource,
    });
  },
};

export default defineConfig({
  plugins: [
    react(),
    hostedAppBundle,

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "CliMate Weather App",
        short_name: "CliMate",
        description:
          "Animated worldwide forecasts, practical reminders, and a clearer plan for your day.",

        theme_color: "#173847",
        background_color: "#f4f8f5",
        display: "standalone",
        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/climate-mark.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/climate-maskable.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
        categories: ["weather", "lifestyle", "utilities"],
      },
    }),
  ],
});
