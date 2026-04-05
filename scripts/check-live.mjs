import "dotenv/config";

const appUrl = process.env.BOOSKI_PUBLIC_BASE_URL?.trim();
if (!appUrl) {
  throw new Error("BOOSKI_PUBLIC_BASE_URL is required.");
}

const ensureOk = async (path) => {
  const response = await fetch(new URL(path, appUrl));
  const text = await response.text();
  console.log(`${response.status} ${path}`);
  console.log(text);
  console.log("");
  if (!response.ok) {
    process.exitCode = 1;
  }
};

await ensureOk("/canary");
await ensureOk("/health");
