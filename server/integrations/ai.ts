export interface AIInsightInput {
  transactions: Array<{
    id: string;
    amount: number;
    status: string;
    risk: string;
    note?: string;
  }>;
  availableCash: number;
}

export interface AIInsight {
  title: string;
  summary: string;
  priority: "high" | "medium" | "low";
  recommendedAction: "review" | "capture" | "remind";
}

/**
 * Adapter boundary for the AI reasoning layer. In a production build this is
 * where PayPal transaction context would be sent to a model through a
 * server-side provider, returning structured insight cards for the client.
 */
export async function generateCashFlowBrief(input: AIInsightInput): Promise<AIInsight[]> {
  const highRisk = input.transactions.filter((transaction) => transaction.risk === "High");
  const pending = input.transactions.filter((transaction) => transaction.status === "Pending");

  return [
    {
      title: highRisk.length ? "Protect the next payout" : "Cash position is healthy",
      summary: highRisk.length
        ? `${highRisk.length} transaction${highRisk.length > 1 ? "s" : ""} need review before funds settle.`
        : `Available cash is $${input.availableCash.toLocaleString()} with no urgent blockers.`,
      priority: highRisk.length ? "high" : "low",
      recommendedAction: "review",
    },
    {
      title: pending.length ? "A payment is waiting to move" : "Payouts are moving on schedule",
      summary: pending.length ? `${pending.length} pending payment${pending.length > 1 ? "s" : ""} can change this week's forecast.` : "No pending capture is changing the forecast.",
      priority: pending.length ? "medium" : "low",
      recommendedAction: "capture",
    },
  ];
}
