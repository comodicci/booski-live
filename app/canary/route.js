import { appConfig } from "../../lib/config.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ghostgate: "ready",
    service: appConfig.serviceSlug,
  });
}
