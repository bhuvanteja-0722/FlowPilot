import type { PayPalSnapshot } from "./paypal";

export interface AIInsight {
  title: string;
  summary: string;
  priority: "high" | "medium" | "low";
  recommendedAction: "review" | "capture" | "remind";
}

export interface AIBrief {
  summary: string;
  insights: AIInsight[];
  provider: "OpenAI Responses API";
  model: string;
}

interface ResponsesApiPayload {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string; refusal?: string }>;
  }>;
}

export async function generateCashFlowBrief(snapshot: PayPalSnapshot): Promise<AIBrief> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OpenAI is not configured. Add OPENAI_API_KEY to the FlowPilot API service.");

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions: [
        "You are FlowPilot, a cautious cash-flow copilot for a small business owner.",
        "Analyze only the PayPal Sandbox transaction summary in the input.",
        "Do not infer disputes, payout dates, fraud, customer identity, or account history unless the data explicitly contains it.",
        "State uncertainty plainly. Recommend human review for declined or pending payments.",
        "Return a short overall summary and up to three useful insights. Every recommended action is a suggestion only; do not imply money moved.",
      ].join(" "),
      input: JSON.stringify({
        currency: snapshot.currency,
        availableBalance: snapshot.availableBalance,
        transactionCount: snapshot.transactions.length,
        transactions: snapshot.transactions.map(({ id, amount, currency, status, item, date, risk }) => ({ id, amount, currency, status, item, date, risk })),
      }),
      text: {
        format: {
          type: "json_schema",
          name: "flowpilot_cash_flow_brief",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              insights: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    title: { type: "string" },
                    summary: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium", "low"] },
                    recommendedAction: { type: "string", enum: ["review", "capture", "remind"] },
                  },
                  required: ["title", "summary", "priority", "recommendedAction"],
                },
              },
            },
            required: ["summary", "insights"],
          },
        },
      },
    }),
    signal: AbortSignal.timeout(25_000),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("OpenAI rejected the API key. Check OPENAI_API_KEY in Render.");
    if (response.status === 429) throw new Error("OpenAI rate limit or account quota reached. Check API billing and try again.");
    throw new Error("OpenAI could not generate the briefing. Check the model setting and API account.");
  }

  const payload = await response.json() as ResponsesApiPayload;
  const text = payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text")?.text;
  if (!text) throw new Error("OpenAI returned no briefing text.");
  let result: { summary?: unknown; insights?: unknown };
  try {
    result = JSON.parse(text) as { summary?: unknown; insights?: unknown };
  } catch {
    throw new Error("OpenAI returned a briefing that could not be read. Try again.");
  }
  if (typeof result.summary !== "string" || !Array.isArray(result.insights)) {
    throw new Error("OpenAI returned an incomplete briefing. Try again.");
  }

  return {
    summary: result.summary,
    insights: result.insights as AIInsight[],
    provider: "OpenAI Responses API",
    model,
  };
}
