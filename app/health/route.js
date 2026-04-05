import { getRedactedRuntimeSummary } from "../../lib/config.js";
import { getMerchantRuntimeStatus } from "../../lib/merchant.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    service: "booski-live",
    time: new Date().toISOString(),
    runtime: getRedactedRuntimeSummary(),
    merchant: getMerchantRuntimeStatus(),
  });
}
