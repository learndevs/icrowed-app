"use client";

import type { BankDetails } from "@/lib/bank-details";

interface Props {
  details: BankDetails;
  orderNumber?: string;
  compact?: boolean;
}

export function BankDetailsCard({ details, orderNumber, compact }: Props) {
  const rows: [string, string][] = [
    ["Bank", details.bankName],
    ["Account Name", details.accountName],
    ["Account Number", details.accountNumber],
    ["Branch", details.branch],
  ];

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-gray-50 space-y-3 ${
        compact ? "p-3 text-xs" : "p-4 text-xs"
      }`}
    >
      <p className={`font-semibold text-gray-900 ${compact ? "text-xs" : "text-sm"}`}>
        Bank Account Details
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <p className="text-gray-500">{label}</p>
            <p className="font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      <p className="text-gray-600 border-t border-gray-200 pt-2">
        {orderNumber ? (
          <>
            Use <strong>{orderNumber}</strong> as your payment reference.{" "}
          </>
        ) : null}
        {details.instructions}
      </p>
    </div>
  );
}
