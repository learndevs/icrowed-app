import crypto from "crypto";

export const PAYHERE_SANDBOX_URL = "https://sandbox.payhere.lk/pay/checkout";
export const PAYHERE_LIVE_URL = "https://www.payhere.lk/pay/checkout";

function md5(str: string): string {
  return crypto.createHash("md5").update(str).digest("hex");
}

/** Generate the PayHere payment hash for initiating a checkout. */
export function generatePayHereHash(
  merchantId: string,
  orderId: string,
  amount: string,
  currency: string,
  merchantSecret: string
): string {
  const secretHash = md5(merchantSecret).toUpperCase();
  return md5(merchantId + orderId + amount + currency + secretHash).toUpperCase();
}

/** Verify the MD5 signature from a PayHere notify callback. */
export function verifyPayHereNotify(params: {
  merchantId: string;
  orderId: string;
  payhereAmount: string;
  payhereCurrency: string;
  statusCode: string;
  md5sig: string;
  merchantSecret: string;
}): boolean {
  const { merchantId, orderId, payhereAmount, payhereCurrency, statusCode, md5sig, merchantSecret } = params;
  const secretHash = md5(merchantSecret).toUpperCase();
  const localHash = md5(merchantId + orderId + payhereAmount + payhereCurrency + statusCode + secretHash).toUpperCase();
  return localHash === md5sig.toUpperCase();
}

/** Format an amount (in app units) as a PayHere-compatible decimal string. */
export function formatPayHereAmount(amount: number): string {
  return amount.toFixed(2);
}
