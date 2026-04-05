const read = (name, fallback = "") => {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

export const appConfig = {
  appUrl: read("BOOSKI_PUBLIC_BASE_URL", "http://localhost:3000"),
  serviceSlug: read("GHOST_SERVICE_SLUG", "agent-18755"),
  ghostBaseUrl: read("GHOST_BASE_URL", "https://www.ghostprotocol.cc"),
  ghostChainId: Number.parseInt(read("GHOST_CHAIN_ID", "8453"), 10) || 8453,
  geminiApiKey: read("GEMINI_API_KEY"),
  allowUnticketed: read("BOOSKI_ALLOW_UNTICKETED", "false").toLowerCase() === "true",
  delegatedPrivateKey: read("GHOST_FULFILLMENT_MERCHANT_DELEGATED_PRIVATE_KEY"),
  protocolSignerAddresses: read("GHOST_FULFILLMENT_PROTOCOL_SIGNER_ADDRESSES"),
  ownerPrivateKey: read("GHOST_OWNER_PRIVATE_KEY"),
  booskiSystemPrompt: [
    "You are Booski, a sarcastic ghost merchant agent on Ghost Protocol.",
    "Roast the consumer's crypto behavior with dry, spooky humor.",
    "Keep it under 4 sentences.",
    "Return valid JSON with exactly these keys:",
    '  "roast": string',
    '  "spectralScore": number from 1 to 100',
    '  "spookySignOff": string',
    "Do not return markdown.",
  ].join("\n"),
};

export const getRedactedRuntimeSummary = () => ({
  appUrl: appConfig.appUrl,
  serviceSlug: appConfig.serviceSlug,
  ghostBaseUrl: appConfig.ghostBaseUrl,
  ghostChainId: appConfig.ghostChainId,
  hasGeminiKey: Boolean(appConfig.geminiApiKey),
  allowUnticketed: appConfig.allowUnticketed,
  delegatedSignerConfigured: Boolean(appConfig.delegatedPrivateKey),
  protocolSignerAddressesConfigured: Boolean(appConfig.protocolSignerAddresses),
  ownerKeyConfigured: Boolean(appConfig.ownerPrivateKey),
});
