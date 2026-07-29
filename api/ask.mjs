import weatherWorker from "../worker/index.js";

const DEFAULT_MODEL = "openai/gpt-oss-20b";

function getRuntimeSettings() {
  return {
    GROQ_API_KEY: process.env.GROQ_API_KEY?.trim(),
    GROQ_MODEL: process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL,
  };
}

export function GET() {
  const settings = getRuntimeSettings();

  return Response.json(
    {
      ok: true,
      configured: Boolean(settings.GROQ_API_KEY),
      model: settings.GROQ_MODEL,
      platform: "vercel",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request) {
  try {
    return await weatherWorker.fetch(request, getRuntimeSettings());
  } catch (error) {
    console.error("Meteo Vercel Function failed:", error);

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
