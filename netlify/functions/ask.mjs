import weatherWorker from "../../worker/index.js";

const DEFAULT_MODEL = "openai/gpt-oss-20b";

export default async function handler(request) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  const model = process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;

  if (request.method === "GET") {
    return Response.json(
      {
        ok: true,
        configured: Boolean(apiKey),
        model,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    return await weatherWorker.fetch(request, {
      GROQ_API_KEY: apiKey,
      GROQ_MODEL: model,
    });
  } catch (error) {
    console.error("Meteo function failed:", error);
    return Response.json(
      {
        error:
          "Meteo's server encountered an unexpected error. Please try again.",
        code: "FUNCTION_ERROR",
      },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}

export const config = {
  path: "/api/ask",
  method: ["GET", "POST"],
};
