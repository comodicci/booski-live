import { GhostFulfillmentMerchant } from "@ghostgate/sdk/fulfillment";
import { appConfig } from "./config.js";

const parseProtocolSignerAddresses = (value) =>
  value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const delegatedPrivateKey = appConfig.delegatedPrivateKey;
const protocolSignerAddresses = parseProtocolSignerAddresses(appConfig.protocolSignerAddresses);

export const merchant =
  delegatedPrivateKey && protocolSignerAddresses.length > 0
    ? new GhostFulfillmentMerchant({
        baseUrl: appConfig.ghostBaseUrl,
        chainId: appConfig.ghostChainId,
        delegatedPrivateKey,
        protocolSignerAddresses,
      })
    : null;

export const getMerchantRuntimeStatus = () => ({
  configured: Boolean(merchant),
  delegatedSignerConfigured: Boolean(delegatedPrivateKey),
  protocolSignerAddressCount: protocolSignerAddresses.length,
});

export const mapTicketError = (error) => {
  const message = error instanceof Error ? error.message : "Invalid fulfillment ticket.";
  const lower = message.toLowerCase();

  if (lower.includes("missing or invalid fulfillment ticket headers")) {
    return { status: 401, errorCode: "FULFILLMENT_TICKET_MISSING", error: message };
  }
  if (lower.includes("expired")) {
    return { status: 409, errorCode: "FULFILLMENT_TICKET_EXPIRED", error: message };
  }
  if (lower.includes("signer") || lower.includes("signature")) {
    return { status: 401, errorCode: "INVALID_FULFILLMENT_TICKET", error: message };
  }
  if (lower.includes("mismatch")) {
    return { status: 400, errorCode: "FULFILLMENT_TICKET_BINDING_MISMATCH", error: message };
  }

  return { status: 400, errorCode: "INVALID_FULFILLMENT_TICKET", error: message };
};
