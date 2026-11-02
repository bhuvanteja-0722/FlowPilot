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
  provider: "NVIDIA NIM";
  model: string;
}

interface NVIDIAChatPayload {
  choices?: Array<{ message?: { content?: string | null } }>;
}

const getNVIDIAKey = () => process.env.NVIDIA_API_KEY?.trim() || process.env.nvidia_api_key?.trim();

export function isAIConfigured(): boolean {
  return Boolean(getNVIDIAKey());
}

export async function generateCashFlowBrief(snapshot: PayPalSnapshot): Promise<AIBrief> {
  const apiKey = getNVIDIAKey();
  if (!apiKey) throw new Error("NVIDIA AI is not configured. Add NVIDIA_API_KEY to the FlowPilot API service.");

  const model = process.env.NVIDIA_MODEL?.trim() || "meta/llama-3.1-8b-instruct";
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1100,
      messages: [
        {
          role: "system",
          content: [
            "You are FlowPilot, a cautious cash-flow copilot for a small business owner.",
            "Analyze only the PayPal Sandbox transaction summary in the input.",
            "Do not infer disputes, payout dates, fraud, customer identity, or account history unless the data explicitly contains it.",
            "State uncertainty plainly. Recommend human review for declined or pending payments.",
            'Return only valid JSON with keys "summary" and "insights". Each insight must contain "title", "summary", "priority" (high, medium, or low), and "recommendedAction" (review, capture, or remind). Return at most three insights.',
            "Every recommended action is a suggestion only; do not imply money moved.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            currency: snapshot.currency,
            availableBalance: snapshot.availableBalance,
            transactionCount: snapshot.transactions.length,
            transactions: snapshot.transactions.map(({ id, amount, currency, status, item, date, risk }) => ({ id, amount, currency, status, item, date, risk })),
          }),
        },
      ],
    }),
    signal: AbortSignal.timeout(25_000),
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error("NVIDIA rejected the API key. Check NVIDIA_API_KEY in Render.");
    if (response.status === 429) throw new Error("NVIDIA rate limit or account quota reached. Check NVIDIA API access and try again.");
    throw new Error("NVIDIA could not generate the briefing. Check NVIDIA_MODEL and API access.");
  }

  const payload = await response.json() as NVIDIAChatPayload;
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new Error("NVIDIA returned no briefing text.");
  let result: { summary?: unknown; insights?: unknown };
  try {
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    result = JSON.parse(json) as { summary?: unknown; insights?: unknown };
  } catch {
    throw new Error("NVIDIA returned a briefing that could not be read. Try again.");
  }
  if (typeof result.summary !== "string" || !Array.isArray(result.insights)) {
    throw new Error("NVIDIA returned an incomplete briefing. Try again.");
  }

  return {
    summary: result.summary,
    insights: result.insights as AIInsight[],
    provider: "NVIDIA NIM",
    model,
  };
}
