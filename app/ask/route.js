import { askBooski } from "../../lib/booski.js";
import { appConfig } from "../../lib/config.js";
import { mapTicketError, merchant } from "../../lib/merchant.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const json = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
    },
  });

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json(
      {
        code: 400,
        error: "Invalid JSON body.",
        errorCode: "INVALID_MERCHANT_REQUEST_BODY",
      },
      400,
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json(
      {
        code: 400,
        error: "Invalid JSON body.",
        errorCode: "INVALID_MERCHANT_REQUEST_BODY",
      },
      400,
    );
  }

  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const walletAddress =
    typeof body.walletAddress === "string" ? body.walletAddress : "0x0000000000000000000000000000000000000000";

  if (!prompt.trim()) {
    return json(
      {
        code: 400,
        error: "prompt is required.",
        errorCode: "BOOSKI_PROMPT_REQUIRED",
      },
      400,
    );
  }

  if (!merchant && !appConfig.allowUnticketed) {
    return json(
      {
        code: 500,
        error: "Merchant runtime is not configured.",
        errorCode: "MERCHANT_RUNTIME_NOT_CONFIGURED",
        details:
          "Set GHOST_FULFILLMENT_MERCHANT_DELEGATED_PRIVATE_KEY and GHOST_FULFILLMENT_PROTOCOL_SIGNER_ADDRESSES.",
      },
      500,
    );
  }

  let verifiedTicket = null;
  if (!appConfig.allowUnticketed) {
    try {
      verifiedTicket = await merchant.requireFulfillmentTicket({
        headers: request.headers,
        expected: {
          serviceSlug: appConfig.serviceSlug,
          method: "POST",
          path: "/ask",
          query: new URL(request.url).search,
          body,
        },
      });
    } catch (error) {
      const mapped = mapTicketError(error);
      return json(
        {
          code: mapped.status,
          error: mapped.error,
          errorCode: mapped.errorCode,
        },
        mapped.status,
      );
    }
  }

  const startedAt = Date.now();

  try {
    const roast = await askBooski({ prompt, walletAddress });
    const responseBody = {
      ok: true,
      agent: "Booski",
      service: appConfig.serviceSlug,
      prompt,
      walletAddress,
      ticketId: verifiedTicket?.ticketId ?? null,
      roast,
      timestamp: new Date().toISOString(),
      mode: appConfig.allowUnticketed ? "unticketed-test" : "ghost-fulfillment",
    };

    if (appConfig.allowUnticketed) {
      return json(responseBody, 200);
    }

    const captureResult = await merchant.captureCompletion({
      ticketId: verifiedTicket.ticketId,
      serviceSlug: appConfig.serviceSlug,
      statusCode: 200,
      latencyMs: Math.max(0, Date.now() - startedAt),
      responseBodyJson: responseBody,
    });

    if (!captureResult.ok) {
      return json(
        {
          code: 502,
          error: "Fulfillment capture API rejected merchant completion.",
          errorCode: "FULFILLMENT_CAPTURE_REJECTED",
          captureStatus: captureResult.status,
          capturePayload: captureResult.payload,
        },
        502,
      );
    }

    return json(
      {
        ...responseBody,
        fulfillment: {
          captureStatus: captureResult.status,
          capturePayload: captureResult.payload,
          debug: captureResult.debug,
        },
      },
      200,
    );
  } catch (error) {
    return json(
      {
        code: 500,
        error: "Booski failed to complete the request.",
        errorCode: "BOOSKI_RUNTIME_FAILURE",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
}
