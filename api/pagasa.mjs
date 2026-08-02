import { handlePagasaRequest } from "../server/pagasa.mjs";

export const maxDuration = 20;

export function GET(request) {
  return handlePagasaRequest(request);
}
