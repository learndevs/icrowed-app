export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  instructions: string;
}

export const DEFAULT_BANK_DETAILS: BankDetails = {
  bankName: "Commercial Bank of Ceylon",
  accountName: "iCrowd (Pvt) Ltd",
  accountNumber: "8002-XXXXXXXX",
  branch: "Colombo 03",
  instructions:
    "Use your order number as the payment reference. Your order will be confirmed within 24 hours after we verify your deposit.",
};

export function parseBankDetails(raw: unknown): BankDetails {
  if (!raw || typeof raw !== "object") return DEFAULT_BANK_DETAILS;
  const o = raw as Record<string, unknown>;
  return {
    bankName: String(o.bankName ?? DEFAULT_BANK_DETAILS.bankName),
    accountName: String(o.accountName ?? DEFAULT_BANK_DETAILS.accountName),
    accountNumber: String(o.accountNumber ?? DEFAULT_BANK_DETAILS.accountNumber),
    branch: String(o.branch ?? DEFAULT_BANK_DETAILS.branch),
    instructions: String(o.instructions ?? DEFAULT_BANK_DETAILS.instructions),
  };
}
