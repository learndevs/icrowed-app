import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  getOrCreateStoreSettings,
  getOrCreateShippingRates,
  getOrCreateNotificationPrefs,
  getAllDeliveryTypes,
} from "@icrowd/database";
import { StoreInfoTab } from "./tabs/StoreInfoTab";
import { ContactTab } from "./tabs/ContactTab";
import { ShippingTab } from "./tabs/ShippingTab";
import { TaxTab } from "./tabs/TaxTab";
import { PoliciesTab } from "./tabs/PoliciesTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { BankDetailsTab } from "./tabs/BankDetailsTab";
import { PaymentTab } from "./tabs/PaymentTab";
import { parseBankDetails } from "@/lib/bank-details";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "store", label: "Store Info" },
  { key: "contact", label: "Contact Page" },
  { key: "shipping", label: "Shipping" },
  { key: "tax", label: "Tax" },
  { key: "policies", label: "Policies" },
  { key: "notifications", label: "Notifications" },
  { key: "bank", label: "Bank Deposit" },
  { key: "payment", label: "Payment" },
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const active = sp.tab && TABS.some((t) => t.key === sp.tab) ? sp.tab : "store";

  const [store, shipping, notif, deliveryTypesList] = await Promise.all([
    getOrCreateStoreSettings(),
    getOrCreateShippingRates(),
    getOrCreateNotificationPrefs(),
    getAllDeliveryTypes(),
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
        {active === "contact" && <ContactTab initial={store} />}
        {active === "shipping" && (
          <ShippingTab
            initialFreeShippingMin={Number(shipping.freeShippingMinSubtotal)}
            initialDeliveryTypes={deliveryTypesList
              .filter((t) => t.isActive)
              .map((t) => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                description: t.description ?? "",
                priceLkr: Number(t.priceLkr),
                eligibleForFreeShipping: t.eligibleForFreeShipping,
                sortOrder: t.sortOrder,
                isActive: t.isActive,
              }))}
          />
        )}
        {active === "tax" && <TaxTab initial={store} />}
        {active === "policies" && <PoliciesTab initial={store} />}
        {active === "notifications" && <NotificationsTab initial={notif} />}
        {active === "bank" && (
          <BankDetailsTab initial={parseBankDetails(store.bankDetails)} />
        )}
        {active === "payment" && <PaymentTab />}
      </div>
    </div>
  );
}
