import weatherWorker from "../../worker/index.js";

export default async function handler(request) {
  const workerRequest = new Request(new URL("/api/ask", request.url), request);

  return weatherWorker.fetch(workerRequest, {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL,
  });
}
