import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getOrCreateStoreSettings,
  getOrCreateShippingRates,
  getOrCreateNotificationPrefs,
} from "@icrowed/database";
import { StoreInfoTab } from "./tabs/StoreInfoTab";
import { ShippingTab } from "./tabs/ShippingTab";
import { TaxTab } from "./tabs/TaxTab";
import { PoliciesTab } from "./tabs/PoliciesTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { PaymentTab } from "./tabs/PaymentTab";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "store", label: "Store Info" },
  { key: "shipping", label: "Shipping" },
  { key: "tax", label: "Tax" },
  { key: "policies", label: "Policies" },
  { key: "notifications", label: "Notifications" },
  { key: "payment", label: "Payment" },
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const active = sp.tab && TABS.some((t) => t.key === sp.tab) ? sp.tab : "store";

  const [store, shipping, notif] = await Promise.all([
    getOrCreateStoreSettings(),
    getOrCreateShippingRates(),
    getOrCreateNotificationPrefs(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Configure your store, payments, shipping, and notifications.
        </p>
      </div>

      <div className="border-b border-[var(--border)] flex flex-wrap gap-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/settings?tab=${t.key}`}
            className={cn(
              "px-4 py-2 text-sm border-b-2 -mb-px transition-colors",
              active === t.key
                ? "border-[var(--color-primary)] text-[var(--color-primary)] font-medium"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="max-w-3xl">
        {active === "store" && <StoreInfoTab initial={store} />}
        {active === "shipping" && (
          <ShippingTab
            initial={{
              standardLkr: Number(shipping.standardLkr),
              expressLkr: Number(shipping.expressLkr),
              freeShippingMinSubtotal: Number(shipping.freeShippingMinSubtotal),
            }}
          />
        )}
        {active === "tax" && <TaxTab initial={store} />}
        {active === "policies" && <PoliciesTab initial={store} />}
        {active === "notifications" && <NotificationsTab initial={notif} />}
        {active === "payment" && <PaymentTab />}
      </div>
    </div>
  );
}
