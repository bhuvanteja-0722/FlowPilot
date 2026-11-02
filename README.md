# FlowPilot — AI Cash-Flow Copilot

FlowPilot is a demo-ready cash-flow copilot concept for independent sellers and small online businesses. It turns PayPal-shaped sample payment activity into a calm, actionable briefing: what came in, what is at risk, what will settle next, and which safe action is worth taking.

## Why it matters

Small businesses do not need another dashboard full of numbers. They need to know which payment deserves attention before a payout is delayed. FlowPilot reads PayPal payment context, explains unusual activity in plain English, and puts a review-first action flow next to the decision.

## What works in the demo

The app runs in clearly labeled sample-data mode without credentials. Once configured, it can read PayPal Sandbox transactions and balances, and generate a structured AI cash-flow briefing from that snapshot. The dashboard also includes cash-flow metrics, a searchable transaction table, filters, transaction details, and review-only action previews. No refund or customer message is sent by the app.

Select the Maya Chen dispute to open the most important scenario. Choose **Review refund** or **Send reminder**, then run the action. The app shows a loading state, a safety gate, an expected cash-flow impact, and a visible confirmation. Demo mode never sends a live request.

## Run locally

```bash
pnpm install
pnpm dev
```

Open the preview at the local port printed by the development server. The project uses the initialized React + Express + tRPC starter and runs on port 3000 by default.

Type checks and production build:

```bash
pnpm check
pnpm build
```

## Architecture

The front end lives in `client/src`. `client/src/pages/Home.tsx` contains the demo experience and seeded transaction scenarios. `client/src/index.css` owns the visual system so the layout remains responsive and easy to tune for a hackathon demo. `server/integrations/paypal.ts` is the server-only PayPal boundary, and `server/integrations/ai.ts` is the structured AI reasoning boundary. The starter server remains available for tRPC procedures and future persistence.

`public/manus-routes.json` declares the user-facing routes for the managed preview. `LICENSE` provides the repository license. `plan.md` and `TODO.md` document the implementation and outcome coverage.

## PayPal Sandbox integration

Create a PayPal developer Sandbox REST app and set `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` only on the API server. FlowPilot requests a Sandbox OAuth token, reads the last 1–31 days from Transaction Search, and attempts to read the available balance. The Sandbox app needs the reporting transaction-search and balance-read permissions. This is a read-only integration; payment actions remain previews. Never use production credentials for this demo or expose the secrets in the browser.

## AI briefing

Set `OPENAI_API_KEY` on the API server (optional `OPENAI_MODEL`, default `gpt-4o-mini`). The server calls the OpenAI Responses API with structured output, `store: false`, and a minimal transaction summary. It does not send customer email addresses. The prompt limits claims to the returned Sandbox records and labels every recommended action as a suggestion for human review. API usage may incur OpenAI charges.

## Render deployment

Keep the existing static site URL for the frontend and create a separate **Free Web Service** from this repository for the API. Configure the API service with:

| Setting | Value |
| --- | --- |
| Build command | `pnpm install --frozen-lockfile && pnpm build` |
| Start command | `pnpm start` |
| Health check path | `/api/health` |
| `FLOWPILOT_ALLOWED_ORIGIN` | `https://flowpilot-78qr.onrender.com` |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | PayPal Sandbox app credentials |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` (optional) |

On the existing Render Static Site, add `VITE_API_BASE_URL` with the API Web Service URL and redeploy the static site. The API URL is provided by Render when that service is created. Both services deploy from `main`; the API uses the free instance type. Free Web Services sleep after inactivity and the first request may take time to wake them. Keep all keys in Render's environment settings, never in Git.

## Three-minute demo script

**0:00 — Set the scene.** “FlowPilot is the calm layer between a PayPal payment and a small business decision.” Show the connected sandbox banner and the four metrics.

**0:35 — Show the intelligence.** Point to the AI briefing: the workspace has three moments, with one dispute that could delay tomorrow’s payout and one unusually large but verified wholesale order.

**1:15 — Follow the risk.** Click the Maya Chen row. Show the transaction context, the explanation, and the payout hold. Point out that the app does not hide the uncertainty.

**1:50 — Demonstrate a safe action.** Choose **Review refund** or **Send reminder** and run the preview. Show the expected cash impact, safety gate, loading state, and confirmation. “This is demo mode, so nothing leaves the browser.”

**2:20 — Close on the outcome.** Switch to Insights and show the three prioritized moments. “FlowPilot does not just show what happened — it tells a seller what to do next, with a review step before money moves.”

## Project media

The four 3:2 PNG gallery images and narrated demo video are in `outputs/`. The video is 1:18 long and uses project UI captures with the supplied narration. To regenerate it on macOS, install `imageio-ffmpeg` with `python3 -m pip install -r demo/requirements.txt`, then run `bash demo/render_demo_mac.sh`.

## License

MIT. See `LICENSE`.
