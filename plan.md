# FlowPilot implementation plan

## Product direction
FlowPilot is an AI-native cash-flow copilot for independent sellers. The demo makes PayPal the source of truth for payment inflows, refunds, disputes, payout timing, and safe follow-up actions. It is intentionally useful without credentials through deterministic demo data, while keeping the server boundary ready for live PayPal REST and AI-provider adapters.

## Architecture
- `client/src/pages/Home.tsx`: single responsive workspace with navigation, KPI strip, AI briefing, cash-flow visual, transaction intelligence table, detail drawer, and simulated action state.
- `client/src/index.css`: visual system, layout primitives, responsive behavior, tables, drawer, micro-interactions, and chart styling.
- `server/integrations/paypal.ts`: typed PayPal adapter boundary; demo mode is the default and live mode reads server-only env values.
- `server/integrations/ai.ts`: typed reasoning boundary for summaries, anomaly explanations, and action recommendations.
- `server/routers.ts`: preserves starter auth/system routes and adds a public demo summary procedure for future client/server wiring.
- `public/manus-routes.json`: route declaration for the root dashboard and 404 fallback.
- `README.md`: setup, architecture, PayPal/AI integration notes, and the under-three-minute demo script.

## Design

### Unselected directions
- Neo-banking command center — 0.08
- Soft SaaS dashboard — 0.06
- Editorial operations cockpit — 0.05

### Chosen direction: Editorial operations cockpit
**Design Movement:** premium fintech editorialism: a dark ink workspace anchored by warm paper surfaces and electric blue system highlights.

**Core Principles:** (1) surface the next decision, not just the metric; (2) pair every risk with an explanation; (3) use generous whitespace around dense operational data; (4) make safety visible before action.

**Color Philosophy:** ink (#111416) creates trust and focus, cream (#f7f4ed) makes the app feel human and legible, blue (#2367ff) marks system intelligence and PayPal-connected states, and orange (#f18a39) signals attention without panic.

**Layout Paradigm:** an asymmetric command rail, a wide AI-first main column, and a contextual right drawer that opens only when the user is making a decision. Avoid a generic centered card grid by letting the briefing and transaction table carry the page.

**Signature Elements:** a hand-drawn-style signal line inside the cash-flow panel, monospaced data labels, and a blue “pilot light” pulse on AI-generated recommendations.

**Interaction Philosophy:** every click reduces ambiguity: selecting a transaction updates the insight context, opening an action shows expected cash-flow impact, and completing a simulation turns risk into a visible resolution.

**Animation:** use short 180–240ms easing for cards, drawer, and selection states; use a subtle shimmer on AI status; never animate financial values aggressively.

**Typography System:** Inter for operational UI, Space Grotesk for display headlines, and IBM Plex Mono for IDs, dates, and numeric labels.

**Brand Essence:** “The calm layer between a PayPal payment and your next business decision.” Personality: vigilant, plainspoken, quietly bold.

**Brand Voice:** headlines are direct and specific; CTAs are verbs with a safety cue. Example lines: “Three payments need your attention.” “Review impact before you send.”

**Wordmark & Logo:** a compact two-stroke mark: an electric-blue pilot dot followed by a cream directional slash, suggesting an agent guiding a cash-flow path.

**Signature Brand Color:** Pilot Blue #2367FF.
