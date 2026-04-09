import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { GhostMerchant } from "@ghostgate/sdk";

const envPath = fs.existsSync(path.resolve(".env.local")) ? ".env.local" : ".env";
loadEnv({ path: envPath });

const appUrl = process.env.BOOSKI_PUBLIC_BASE_URL?.trim();
const agentId = "18755";
const serviceSlug = process.env.GHOST_SERVICE_SLUG?.trim() || `agent-${agentId}`;
const ghostBaseUrl = process.env.GHOST_BASE_URL?.trim() || "https://www.ghostprotocol.cc";
const ownerPrivateKey = process.env.GHOST_OWNER_PRIVATE_KEY?.trim();
const delegatedPrivateKey =
  process.env.GHOST_FULFILLMENT_MERCHANT_DELEGATED_PRIVATE_KEY?.trim() || undefined;

if (!appUrl) {
  throw new Error("BOOSKI_PUBLIC_BASE_URL is required.");
}

if (!ownerPrivateKey) {
  throw new Error("GHOST_OWNER_PRIVATE_KEY is required.");
}

const merchant = new GhostMerchant({
  baseUrl: ghostBaseUrl,
  serviceSlug,
  ownerPrivateKey,
  ...(delegatedPrivateKey ? { delegatedPrivateKey } : {}),
});

console.log("Activating Ghost gateway...");
console.log({ agentId, serviceSlug, endpointUrl: appUrl, ghostBaseUrl });

const result = await merchant.activate({
  agentId,
  serviceSlug,
  endpointUrl: appUrl,
  canaryPath: "/canary",
});

console.log("Ghost activation complete.");
console.log(JSON.stringify({
  status: result.status,
  readiness: result.readiness,
  canaryPath: result.config?.canaryPath ?? "/canary",
  endpointUrl: result.config?.endpointUrl ?? appUrl,
}, null, 2));

// `activate()` starts a heartbeat timer; stop it so this CLI command can exit cleanly.
result.heartbeat?.stop?.();
