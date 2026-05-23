import { ReactNode } from "react";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return <div className="font-inter min-h-full checkout-flow-bg">{children}</div>;
}
