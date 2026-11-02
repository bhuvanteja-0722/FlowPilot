export type PayPalMode = "demo" | "sandbox";

export type PayPalTransactionStatus = "Paid" | "Pending" | "Refunded" | "Declined";

export interface PayPalTransactionContext {
  id: string;
  amount: number;
  currency: string;
  status: PayPalTransactionStatus;
  customer: string;
  item: string;
  date: string;
  time: string;
  fee: number;
  risk: "Low" | "Watch" | "High";
  note: string;
}

export interface PayPalSnapshot {
  mode: "sandbox";
  fetchedAt: string;
  availableBalance: number | null;
  currency: string;
  transactions: PayPalTransactionContext[];
}

export interface PayPalActionPreview {
  action: "refund" | "reminder";
  transactionId: string;
  amount: number;
  mode: PayPalMode;
  safeToExecute: boolean;
  explanation: string;
}

const PAYPAL_API = "https://api-m.sandbox.paypal.com";

export function isPayPalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim());
}

export function getPayPalMode(): PayPalMode {
  return isPayPalConfigured() ? "sandbox" : "demo";
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("PayPal Sandbox is not configured. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to the API service.");
  }

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    throw new Error(response.status === 401
      ? "PayPal Sandbox rejected the credentials. Check the sandbox app client ID and secret."
      : "PayPal Sandbox could not issue an access token. Check the app credentials and permissions.");
  }
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("PayPal Sandbox returned no access token.");
  return payload.access_token;
}

function parseAmount(value?: { value?: string }) {
  const amount = Number(value?.value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export async function fetchPayPalSnapshot(days = 7): Promise<PayPalSnapshot> {
  const accessToken = await getAccessToken();
  const boundedDays = Math.max(1, Math.min(31, Math.floor(days)));
  const end = new Date();
  const start = new Date(end.getTime() - boundedDays * 24 * 60 * 60 * 1000);
  const query = new URLSearchParams({
    start_date: start.toISOString().replace(".000Z", "Z"),
    end_date: end.toISOString().replace(".000Z", "Z"),
    fields: "transaction_info",
    balance_affecting_records_only: "Y",
    page_size: "100",
    page: "1",
  });
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "PayPal-Enforce-ISO8601-Format": "true",
  };

  const transactionsResponse = await fetch(`${PAYPAL_API}/v1/reporting/transactions?${query}`, {
    headers,
    signal: AbortSignal.timeout(15_000),
  });
  if (!transactionsResponse.ok) {
    throw new Error(transactionsResponse.status === 403
      ? "PayPal Sandbox denied Transaction Search. Enable the reporting/search read permission for this app."
      : "PayPal Sandbox could not return transaction activity. Check the sandbox app permissions and try again.");
  }
  const transactionPayload = await transactionsResponse.json() as {
    transaction_details?: Array<{
      transaction_info?: {
        transaction_id?: string;
        transaction_status?: string;
        transaction_event_code?: string;
        transaction_initiation_date?: string;
        transaction_amount?: { currency_code?: string; value?: string };
        fee_amount?: { value?: string };
        transaction_subject?: string;
        transaction_note?: string;
        invoice_id?: string;
      };
    }>;
  };

  const balanceResponse = await fetch(`${PAYPAL_API}/v1/reporting/balances`, {
    headers,
    signal: AbortSignal.timeout(12_000),
  });
  let availableBalance: number | null = null;
  let currency = "USD";
  if (balanceResponse.ok) {
    const balancePayload = await balanceResponse.json() as {
      balances?: Array<{
        primary?: boolean;
        currency?: string;
        available_balance?: { currency_code?: string; value?: string };
      }>;
    };
    const balance = balancePayload.balances?.find((item) => item.primary) ?? balancePayload.balances?.[0];
    if (balance?.available_balance) {
      availableBalance = parseAmount(balance.available_balance);
      currency = balance.available_balance.currency_code ?? balance.currency ?? currency;
    }
  }

  const records = (transactionPayload.transaction_details ?? []).flatMap(({ transaction_info: info }) => {
    if (!info?.transaction_id) return [];
    const paypalStatus = info.transaction_status ?? "P";
    const status: PayPalTransactionStatus = paypalStatus === "S"
      ? "Paid"
      : paypalStatus === "V"
        ? "Refunded"
        : paypalStatus === "D"
          ? "Declined"
          : "Pending";
    const dateValue = info.transaction_initiation_date ? new Date(info.transaction_initiation_date) : new Date();
    const amount = parseAmount(info.transaction_amount);
    const isRefund = status === "Refunded" || /refund/i.test(info.transaction_event_code ?? "");
    return [{
      id: info.transaction_id,
      amount: isRefund ? -Math.abs(amount) : amount,
      currency: info.transaction_amount?.currency_code ?? currency,
      status,
      customer: "Sandbox transaction",
      item: (info.transaction_subject || info.invoice_id || info.transaction_note || "PayPal payment").slice(0, 120),
      date: dateValue.toLocaleDateString("en-US", { month: "short", day: "2-digit", timeZone: "UTC" }),
      time: dateValue.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }),
      fee: Math.abs(parseAmount(info.fee_amount)),
      risk: status === "Declined" ? "High" as const : status === "Pending" ? "Watch" as const : "Low" as const,
      note: `PayPal Sandbox reports this transaction as ${status.toLowerCase()}. Review the payment record before taking action.`,
    }];
  });

  return {
    mode: "sandbox",
    fetchedAt: new Date().toISOString(),
    availableBalance,
    currency,
    transactions: records,
  };
}

export async function previewPayPalAction(
  action: PayPalActionPreview["action"],
  transaction: PayPalTransactionContext,
): Promise<PayPalActionPreview> {
  const mode = getPayPalMode();
  const safeToExecute = action === "reminder" || (transaction.status !== "Declined" && transaction.amount > 0);

  return {
    action,
    transactionId: transaction.id,
    amount: action === "refund" ? transaction.amount : 0,
    mode,
    safeToExecute,
    explanation: safeToExecute
      ? "This is a review-only preview. FlowPilot does not issue a refund or send a message."
      : "This payment is declined or has an invalid amount, so FlowPilot recommends review instead of an automatic action.",
  };
}
