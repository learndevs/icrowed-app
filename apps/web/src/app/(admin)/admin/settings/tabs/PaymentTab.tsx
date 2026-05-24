import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function mask(value: string | undefined | null): string {
  if (!value) return "Not configured";
  if (value.length <= 8) return "•••• " + value.slice(-4);
  return value.slice(0, 4) + "•••" + value.slice(-4);
}

export function PaymentTab() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripePub = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const payhereId = process.env.PAYHERE_MERCHANT_ID;
  const payhereSecret = process.env.PAYHERE_MERCHANT_SECRET;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Stripe (cards)</h3>
            <Badge variant={stripeKey ? "success" : "warning"}>
              {stripeKey ? "Configured" : "Missing"}
            </Badge>
          </div>
          <KeyRow label="Secret key" value={mask(stripeKey)} />
          <KeyRow label="Publishable key" value={mask(stripePub)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">PayHere</h3>
            <Badge variant={payhereId ? "success" : "warning"}>
              {payhereId ? "Configured" : "Missing"}
            </Badge>
          </div>
          <KeyRow label="Merchant ID" value={mask(payhereId)} />
          <KeyRow label="Merchant secret" value={mask(payhereSecret)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 text-xs text-[var(--muted)] space-y-2">
          <p className="font-medium text-[var(--foreground)]">
            How to update payment credentials
          </p>
          <p>
            Payment gateway secrets are stored in the server&apos;s environment
            (<code>.env.local</code>) — never in the database.
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Edit <code>apps/web/.env</code> on your deployment.
            </li>
            <li>
              Update <code>STRIPE_SECRET_KEY</code>,{" "}
              <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>,{" "}
              <code>PAYHERE_MERCHANT_ID</code>, or{" "}
              <code>PAYHERE_MERCHANT_SECRET</code> as needed.
            </li>
            <li>Restart the application for changes to take effect.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function KeyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
