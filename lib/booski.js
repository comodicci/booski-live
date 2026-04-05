import { appConfig } from "./config.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiModel = appConfig.geminiApiKey
  ? new GoogleGenerativeAI(appConfig.geminiApiKey).getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: appConfig.booskiSystemPrompt,
    })
  : null;

const parseRoastResponse = (text, walletAddress) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  }

  return {
    roast: `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} looks like a haunted liquidation stack.`,
    spectralScore: 71,
    spookySignOff: "Booski is done with you.",
  };
};

const buildMockWalletFacts = (prompt) => {
  const seed = prompt.length || 11;
  const balance = ((seed % 9) * 0.071 + 0.013).toFixed(4);
  const deadCoins = (seed % 13) + 3;
  const nftLosses = (seed % 7) + 1;

  return { balance, deadCoins, nftLosses };
};

export const askBooski = async ({ prompt, walletAddress }) => {
  const cleanPrompt = String(prompt ?? "").trim();
  const cleanWalletAddress = String(walletAddress ?? "").trim() || "0x0000000000000000000000000000000000000000";
  if (!cleanPrompt) {
    throw new Error("prompt is required.");
  }

  const facts = buildMockWalletFacts(cleanPrompt);

  if (!geminiModel) {
    return {
      roast: `Wallet ${cleanWalletAddress.slice(0, 6)}...${cleanWalletAddress.slice(-4)} is carrying ${facts.deadCoins} dead tokens, ${facts.nftLosses} NFT mistakes, and only ${facts.balance} ETH to defend itself.`,
      spectralScore: Math.min(99, 40 + facts.deadCoins + facts.nftLosses),
      spookySignOff: "Booski fades back into the mempool.",
    };
  }

  const result = await geminiModel.generateContent(
    [
      `Consumer prompt: ${cleanPrompt || "Roast me."}`,
      `Wallet: ${cleanWalletAddress}`,
      `Mock holdings: ${facts.balance} ETH, ${facts.deadCoins} dead coins, ${facts.nftLosses} losing NFTs.`,
    ].join(" "),
  );

  return parseRoastResponse(result.response.text(), cleanWalletAddress);
};
