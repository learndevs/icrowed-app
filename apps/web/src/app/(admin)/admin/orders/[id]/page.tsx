import { notFound } from "next/navigation";
import Link from "next/link";
import { db, orders } from "@icrowed/database";
import { eq } from "drizzle-orm";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Package, User, MapPin, CreditCard, Truck } from "lucide-react";
import { OrderActions } from "./OrderActions";

const STATUS_BADGE: Record<string, "default" | "primary" | "success" | "warning" | "error"> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "default",
  delivered: "success",
  cancelled: "error",
  refunded: "error",
};

const COURIERS = ["Domex", "Kapruka", "Lanka Sathosa Express", "Sendbiz", "PickMe Delivery"];
const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: true,
      statusHistory: { orderBy: (h, { asc }) => [asc(h.createdAt)] },
    },
  });

  if (!order) notFound();

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders">
          <Button type="button" size="icon" variant="outline">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-mono">{order.orderNumber}</h2>
            <Badge variant={STATUS_BADGE[order.status] ?? "default"}>{order.status}</Badge>
            <Badge variant={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "failed" ? "error" : "warning"}>
              {order.paymentStatus}
            </Badge>
          </div>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — order info */}
        <div className="lg:col-span-2 space-y-5">

          {/* Items */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-[var(--muted)]" />
                <h3 className="font-semibold">Items ({order.items.length})</h3>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-xs text-[var(--muted)]">{item.variantName}</p>
                      )}
                      {item.sku && (
                        <p className="text-xs font-mono text-[var(--muted)]">{item.sku}</p>
                      )}
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        {formatPrice(Number(item.unitPrice))} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(Number(item.subtotal))}</p>
                  </div>
                ))}
              </div>
              <div className="pt-3 mt-1 border-t border-[var(--border)] space-y-1.5 text-sm">
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Shipping</span>
                  <span>
                    {Number(order.shippingCost) === 0
                      ? "Free"
                      : formatPrice(Number(order.shippingCost))}
                  </span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−{formatPrice(Number(order.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-1 border-t border-[var(--border)]">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status history timeline */}
          <Card>
            <CardContent>
              <h3 className="font-semibold mb-4">Status History</h3>
              {order.statusHistory.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No history yet.</p>
              ) : (
                <ol className="relative ml-2 space-y-0">
                  {order.statusHistory.map((h, i) => (
                    <li key={h.id} className="relative pl-7 pb-5 last:pb-0">
                      <div className="absolute left-0 top-0.5 w-3.5 h-3.5 rounded-full bg-[var(--color-primary)] border-2 border-white ring-1 ring-[var(--color-primary)]" />
                      {i < order.statusHistory.length - 1 && (
                        <div className="absolute left-[6px] top-4 bottom-0 w-px bg-[var(--border)]" />
                      )}
                      <div className="flex items-start gap-2 flex-wrap">
                        <Badge variant={STATUS_BADGE[h.status] ?? "default"} className="capitalize">
                          {h.status}
                        </Badge>
                        <span className="text-xs text-[var(--muted)] mt-0.5">
                          {formatDate(h.createdAt)}
                        </span>
                      </div>
                      {h.note && (
                        <p className="text-xs text-[var(--muted)] mt-1">{h.note}</p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          {/* Update form */}
          <OrderActions
            orderId={order.id}
            currentStatus={order.status}
            currentTracking={order.trackingNumber ?? ""}
            currentCourier={order.courierName ?? ""}
            currentAdminNote={order.adminNote ?? ""}
            statuses={STATUSES}
            couriers={COURIERS}
          />
        </div>

        {/* Right column — customer + payment + shipping */}
        <div className="space-y-5">
          {/* Customer */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--muted)]" />
                <h3 className="font-semibold">Customer</h3>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-[var(--muted)]">{order.customerEmail}</p>
                <p className="text-[var(--muted)]">{order.customerPhone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--muted)]" />
                <h3 className="font-semibold">Shipping Address</h3>
              </div>
              <div className="text-sm space-y-0.5 text-[var(--muted)]">
                <p>{order.shippingAddressLine1}</p>
                {order.shippingAddressLine2 && <p>{order.shippingAddressLine2}</p>}
                <p>
                  {order.shippingCity}, {order.shippingDistrict}
                  {order.shippingProvince ? `, ${order.shippingProvince}` : ""}
                </p>
                {order.shippingPostalCode && <p>{order.shippingPostalCode}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[var(--muted)]" />
                <h3 className="font-semibold">Payment</h3>
              </div>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Method</span>
                  <Badge variant={order.paymentMethod === "stripe" ? "primary" : "warning"}>
                    {order.paymentMethod === "stripe" ? "Card" : "Bank Transfer"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">Status</span>
                  <Badge variant={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "failed" ? "error" : "warning"}>
                    {order.paymentStatus}
                  </Badge>
                </div>
                {order.stripePaymentIntentId && (
                  <p className="text-xs font-mono text-[var(--muted)] break-all">
                    {order.stripePaymentIntentId}
                  </p>
                )}
                {order.bankTransferReference && (
                  <p className="text-xs text-[var(--muted)]">
                    Ref: {order.bankTransferReference}
                  </p>
                )}
                {order.paidAt && (
                  <p className="text-xs text-[var(--muted)]">
                    Paid {formatDate(order.paidAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery */}
          {(order.courierName || order.trackingNumber) && (
            <Card>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[var(--muted)]" />
                  <h3 className="font-semibold">Delivery</h3>
                </div>
                <div className="text-sm space-y-1">
                  {order.courierName && (
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Courier</span>
                      <span className="font-medium">{order.courierName}</span>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Tracking #</span>
                      <span className="font-mono text-xs">{order.trackingNumber}</span>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="flex justify-between">
                      <span className="text-[var(--muted)]">Delivered</span>
                      <span>{formatDate(order.deliveredAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer note */}
          {order.customerNote && (
            <Card>
              <CardContent>
                <h3 className="font-semibold mb-2">Customer Note</h3>
                <p className="text-sm text-[var(--muted)]">{order.customerNote}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
