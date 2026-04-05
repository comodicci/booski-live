import { getRedactedRuntimeSummary } from "../lib/config.js";

const summary = getRedactedRuntimeSummary();

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "56px 24px 80px",
      }}
    >
      <div
        style={{
          border: "1px solid #151515",
          background: "#fffdf8",
          padding: 28,
          boxShadow: "8px 8px 0 #151515",
        }}
      >
        <p style={{ margin: 0, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Ghost-linked merchant runtime
        </p>
        <h1 style={{ fontSize: 56, lineHeight: 1, margin: "14px 0 18px" }}>Booski Live</h1>
        <p style={{ fontSize: 20, lineHeight: 1.5, maxWidth: 640 }}>
          This deployment keeps Booski reachable as a real public agent runtime. Ghost only needs a stable canary and
          public endpoint. This app is the actual thing staying up.
        </p>
      </div>

      <section style={{ marginTop: 32, display: "grid", gap: 18 }}>
        <div style={{ border: "1px solid #151515", background: "#fff", padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Endpoints</h2>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
            <li>
              <code>/canary</code>
            </li>
            <li>
              <code>/health</code>
            </li>
            <li>
              <code>/ask</code>
            </li>
          </ul>
        </div>

        <div style={{ border: "1px solid #151515", background: "#fff", padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Runtime Summary</h2>
          <pre
            style={{
              margin: 0,
              overflowX: "auto",
              background: "#111",
              color: "#f5f5f5",
              padding: 16,
              fontSize: 13,
            }}
          >
            {JSON.stringify(summary, null, 2)}
          </pre>
        </div>

        <div style={{ border: "1px solid #151515", background: "#fff", padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Next Step</h2>
          <p style={{ marginBottom: 0, lineHeight: 1.7 }}>
            Deploy this app to Vercel, point a stable subdomain at it, then run <code>npm run ghost:activate</code> so
            Ghost can verify the canary and mark agent <code>18755</code> live.
          </p>
        </div>
      </section>
    </main>
  );
}
