# FlowPilot — AI Cash-Flow Copilot

FlowPilot is a judge-ready PayPal + AI prototype for independent sellers and small online businesses. It turns payment activity into a calm, actionable briefing: what came in, what is at risk, what will settle next, and which safe action is worth taking.

## Why it matters

Small businesses do not need another dashboard full of numbers. They need to know which payment deserves attention before a payout is delayed. FlowPilot reads PayPal payment context, explains unusual activity in plain English, and puts a review-first action flow next to the decision.

## What works in the demo

The app runs in deterministic demo mode without credentials. It includes a PayPal-connected workspace banner, executive cash metrics, an AI briefing panel, a cash-flow chart, a searchable transaction intelligence table, filters for inflow/outflow/risk, responsive navigation, transaction detail context, and a guided action drawer.

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

## PayPal integration path

The prototype intentionally defaults to a safe local demo so judges can run it immediately. For PayPal Sandbox wiring, add server-side environment variables named `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`, then replace the adapter implementation in `server/integrations/paypal.ts` with PayPal REST SDK calls for transactions, capture/refund, disputes, and payout status. Never expose these values to the browser. The `PayPalTransactionContext` type is the handoff contract from PayPal data to the AI reasoning layer.

## AI tool path

The product experience is designed around an AI reasoning layer: summarize inflows, detect risk, explain anomalies, prioritize follow-ups, and recommend a safe next action. The `generateCashFlowBrief` function is the structured adapter boundary. In production, it can call a server-side model provider or PayPal-approved AI sponsor tool and return the same `AIInsight[]` shape. Keep model credentials server-side and pass only the minimum transaction context needed for the explanation.

## Three-minute demo script

**0:00 — Set the scene.** “FlowPilot is the calm layer between a PayPal payment and a small business decision.” Show the connected sandbox banner and the four metrics.

**0:35 — Show the intelligence.** Point to the AI briefing: the workspace has three moments, with one dispute that could delay tomorrow’s payout and one unusually large but verified wholesale order.

**1:15 — Follow the risk.** Click the Maya Chen row. Show the transaction context, the explanation, and the payout hold. Point out that the app does not hide the uncertainty.

**1:50 — Demonstrate a safe action.** Choose **Review refund** or **Send reminder** and run the preview. Show the expected cash impact, safety gate, loading state, and confirmation. “This is demo mode, so nothing leaves the browser.”

**2:20 — Close on the outcome.** Switch to Insights and show the three prioritized moments. “FlowPilot does not just show what happened — it tells a seller what to do next, with a review step before money moves.”

## License

MIT. See `LICENSE`.
