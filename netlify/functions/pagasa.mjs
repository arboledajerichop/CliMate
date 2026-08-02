import { handlePagasaRequest } from "../../server/pagasa.mjs";

export default function handler(request) {
  return handlePagasaRequest(request);
}

export const config = {
  path: "/api/pagasa",
  method: ["GET"],
};
