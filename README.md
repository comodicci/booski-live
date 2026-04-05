# Booski Live

This is a minimal Vercel-ready runtime for keeping Booski live as a real Ghost-linked agent.

It gives you:

- a real public app you can deploy to Vercel
- the exact Ghost canary route Ghost expects
- a real `/ask` endpoint for Booski requests
- a `/health` route for your own monitoring
- the same delegated-signer / protocol-signer env shape already used in `booski-merchant-18755`
- Gemini support using the same `GEMINI_API_KEY` variable you already have
- a CLI bootstrap to register the public URL with Ghost after deployment

This is the simplest path to a live Booski without running your own VPS first.

## What this does

After deployment, Booski can serve:

- `GET /canary`
  - returns the exact JSON Ghost expects
- `GET /health`
  - returns a basic service health payload
- `POST /ask`
  - verifies Ghost fulfillment tickets and returns a Booski response

## What this does not do yet

- no `x402` monetization wrapper yet
- no queue/worker/background jobs
- no database or memory
- no rate limiting
- no durable GhostWire deliverable storage yet

That is fine for an initial live deployment whose main job is keeping Booski reachable and Ghost-ready.

## Architecture

Use Vercel for:

- the Booski runtime
- the public domain/subdomain
- environment variables
- logs and deploys

Use Ghost for:

- the public agent profile
- gateway readiness
- canary verification
- optional later monetization and trust reporting

## Step 1: Install locally

```bash
npm install
```

## Step 2: Set local environment variables

Copy `.env.example` to `.env.local` and fill in the basics:

```bash
BOOSKI_PUBLIC_BASE_URL=http://localhost:3000
GHOST_BASE_URL=https://www.ghostprotocol.cc
GHOST_CHAIN_ID=8453
GHOST_SERVICE_SLUG=agent-18755
GHOST_FULFILLMENT_MERCHANT_DELEGATED_PRIVATE_KEY=0x...
GHOST_FULFILLMENT_PROTOCOL_SIGNER_ADDRESSES=0xf879f5e26aa52663887f97a51d3444afef8df3fc
GEMINI_API_KEY=...
BOOSKI_ALLOW_UNTICKETED=true
```

`GEMINI_API_KEY` is optional. If omitted, Booski returns deterministic mock roasts.

## Step 3: Test locally

```bash
npm run dev
```

Then verify:

- [http://localhost:3000/canary](http://localhost:3000/canary)
- [http://localhost:3000/health](http://localhost:3000/health)

If `BOOSKI_ALLOW_UNTICKETED=true`, you can also test `POST /ask` directly:

```bash
curl -X POST http://localhost:3000/ask ^
  -H "Content-Type: application/json" ^
  -d "{\"prompt\":\"Roast my wallet honestly.\",\"walletAddress\":\"0x40dD75406eB154980ec17fadbFAe4C6F841ac0FC\"}"
```

## Step 4: Deploy to Vercel

1. Create a new GitHub repo for `booski-live`, or deploy the folder directly with Vercel CLI.
2. Import that project into Vercel.
3. Set the production env vars from `.env.example`.
4. Deploy.

If you want the cleanest public URL, add a custom subdomain such as:

- `booski.ghostprotocol.cc`

Then set:

```bash
BOOSKI_PUBLIC_BASE_URL=https://booski.ghostprotocol.cc
```

## Step 5: Register Booski with Ghost

After Vercel is live and the public URL works, set these locally:

```bash
BOOSKI_PUBLIC_BASE_URL=https://booski.ghostprotocol.cc
GHOST_BASE_URL=https://www.ghostprotocol.cc
GHOST_CHAIN_ID=8453
GHOST_SERVICE_SLUG=agent-18755
GHOST_OWNER_PRIVATE_KEY=0x...
```

Then run:

```bash
npm run ghost:activate
```

That will:

- save the public gateway URL
- set the canary path to `/canary`
- verify the canary
- register a delegated signer entry using the same delegated merchant key as your existing Booski merchant runtime

If you prefer, you can also do this from the Ghost merchant dashboard manually.

## Step 6: Verify live readiness

Run:

```bash
npm run check:live
```

That checks:

- `GET <BOOSKI_PUBLIC_BASE_URL>/canary`
- `GET <BOOSKI_PUBLIC_BASE_URL>/health`

You should also confirm in Ghost that:

- `Gateway Status = LIVE`
- canary verification is passing
- the selected agent profile points to the right public runtime

## Recommended production checklist

Before sending real users to Booski, do these:

1. Add a custom subdomain.
2. Keep `BOOSKI_PUBLIC_BASE_URL` stable.
3. Turn `BOOSKI_ALLOW_UNTICKETED` back to `false` after direct testing.
4. Watch Vercel logs after first traffic.
5. Add external uptime monitoring against `/health`.
6. Keep Ghost canary verification green.

## Cost expectations

Typical starter costs:

- Vercel hosting: low at first, but usage-based
- domain/subdomain: cheap annual cost
- model provider cost: usually the main variable cost

For a lightweight text Booski, hosting is not the expensive part. Model usage is.

## Important operational reality

Vercel is good for a simple request-response Booski.

If Booski later needs:

- long-running jobs
- queues/workers
- background retries
- stateful orchestration
- heavier throughput

then move the runtime to Railway, Fly, or a VPS and keep the same Ghost-facing canary contract.
