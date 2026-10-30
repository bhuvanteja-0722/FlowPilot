export type PayPalMode = "demo" | "sandbox";

export interface PayPalTransactionContext {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail?: string;
  dispute?: boolean;
  payoutStatus?: string;
}

export interface PayPalActionPreview {
  action: "refund" | "reminder";
  transactionId: string;
  amount: number;
  mode: PayPalMode;
  safeToExecute: boolean;
  explanation: string;
}

/**
 * Server-only boundary for PayPal REST SDK/API integration.
 * The public prototype uses demo mode; live sandbox credentials should be
 * provided through PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET on the server.
 */
export function getPayPalMode(): PayPalMode {
  return process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET ? "sandbox" : "demo";
}

export async function previewPayPalAction(
  action: PayPalActionPreview["action"],
  transaction: PayPalTransactionContext,
): Promise<PayPalActionPreview> {
  const mode = getPayPalMode();
  const safeToExecute = action === "reminder" || (!transaction.dispute && transaction.amount > 0);

  return {
    action,
    transactionId: transaction.id,
    amount: action === "refund" ? transaction.amount : 0,
    mode,
    safeToExecute,
    explanation: safeToExecute
      ? "The action passed the demo safety gate and is ready for explicit user confirmation."
      : "This payment has an open dispute or invalid amount, so FlowPilot recommends review instead of an automatic action.",
  };
}
