import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ManualOrderForm } from "./ManualOrderForm";

export const dynamic = "force-dynamic";

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ChevronLeft className="w-4 h-4" /> Back to orders
      </Link>
      <div>
        <h2 className="text-xl font-bold">Create order manually</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          For phone or in-person orders. Customer email triggers the regular
          confirmation flow.
        </p>
      </div>
      <ManualOrderForm />
    </div>
  );
}
