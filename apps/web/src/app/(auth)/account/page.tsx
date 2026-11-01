import { LOYALTY_NAME, LOYALTY_POINTS } from "@/lib/loyalty-brand";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db, orders, wishlists } from "@icrowd/database";
import { getLoyaltySummary } from "@icrowd/database/queries";
import { count, desc, eq } from "drizzle-orm";
import {
  ArrowRight,
  Award,
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

const STATUS_CHIP: Record<string, string> = {
  pending: "acct-chip-neutral",
  confirmed: "acct-chip-blue",
  processing: "acct-chip-blue",
  shipped: "acct-chip-solid",
  delivered: "acct-chip-dark",
  cancelled: "acct-chip-outline",
  refunded: "acct-chip-outline",
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const [loyalty, [orderCount], [wishCount], recent] = await Promise.all([
    getLoyaltySummary(user.id),
    db.select({ n: count() }).from(orders).where(eq(orders.userId, user.id)),
    db.select({ n: count() }).from(wishlists).where(eq(wishlists.userId, user.id)),
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        total: orders.total,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt))
      .limit(3),
  ]);

  const firstName = (user.name || user.email.split("@")[0]).split(" ")[0];
  const progress = loyalty.nextTier
    ? Math.min(100, (loyalty.lifetimeSpend / Number(loyalty.nextTier.minSpend)) * 100)
    : 100;

  const stats = [
    { href: "/account/orders", label: "Orders", value: orderCount.n, icon: Package },
    { href: "/wishlist", label: "Wishlist", value: wishCount.n, icon: Heart },
    { href: "/account/addresses", label: "Addresses", value: "Manage", icon: MapPin },
    { href: "/account/profile", label: "Profile", value: "Edit", icon: User },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="acct-rise">
        <p className="text-[11px] font-extrabold tracking-[0.16em] text-[var(--brand-600)] uppercase mb-1">
          Welcome back
        </p>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
          Hi, {firstName}
        </h1>
      </div>

      {/* Loyalty hero */}
      {loyalty.settings.enabled && (
        <section className="acct-glass-dark p-6 sm:p-8 acct-rise" style={{ animationDelay: "60ms" }}>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur">
                  <Award className="w-4 h-4 text-sky-300" />
                </span>
                <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-sky-200">
                  {LOYALTY_NAME} · {loyalty.tier?.name ?? "Member"}
                </span>
              </div>
              <p className="text-5xl sm:text-6xl font-black tracking-tight leading-none">
                {loyalty.balance.toLocaleString()}
                <span className="text-base font-semibold text-sky-200/80 ml-2">{LOYALTY_POINTS}</span>
              </p>
              <p className="text-sm text-white/60 mt-3">
                Worth {formatPrice(loyalty.balance * Number(loyalty.settings.pointValue))} off your next order
              </p>
            </div>

            <div className="sm:w-64">
              {loyalty.nextTier ? (
                <>
                  <div className="flex justify-between text-xs text-white/70 mb-2">
                    <span>{loyalty.tier?.name ?? "Member"}</span>
                    <span>{loyalty.nextTier.name}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-white"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    Spend {formatPrice(loyalty.spendToNextTier)} more to reach {loyalty.nextTier.name}
                  </p>
                </>
              ) : (
                <p className="text-sm text-sky-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> You&apos;re at the highest tier
                </p>
              )}
            </div>
          </div>

          <p className="relative z-10 text-xs text-white/50 mt-6 pt-5 border-t border-white/10">
            Earn {+(Number(loyalty.settings.earnRate) * 100).toFixed(2)}% back in {LOYALTY_NAME} points on orders of{" "}
            {formatPrice(Number(loyalty.settings.earnThreshold))} or more, credited when your order is delivered.
          </p>
        </section>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ href, label, value, icon: Icon }, i) => (
          <Link
            key={label}
            href={href}
            className="acct-glass acct-glass-hover p-5 group acct-rise"
            style={{ animationDelay: `${120 + i * 50}ms` }}
          >
            <span className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center mb-4 group-hover:bg-[var(--brand-600)] transition-colors">
              <Icon className="w-5 h-5 text-white" />
            </span>
            <p className="text-2xl font-black text-neutral-900 leading-none">{value}</p>
            <p className="text-xs font-semibold text-neutral-500 mt-1.5 flex items-center gap-1">
              {label}
              <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
        {/* Recent orders */}
        <section className="acct-glass p-6 xl:col-span-3 acct-rise" style={{ animationDelay: "340ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-neutral-900 text-lg">Recent orders</h2>
            <Link href="/account/orders" className="text-xs font-bold text-[var(--brand-600)] hover:underline">
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-10">
              <span className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-[var(--brand-600)]" />
              </span>
              <p className="text-sm text-neutral-500 mb-4">You haven&apos;t placed an order yet.</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white text-sm font-bold px-5 py-2.5 hover:bg-[var(--brand-600)] transition-colors"
              >
                Start shopping <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {recent.map((o) => (
                <li key={o.id}>
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-4 py-3.5 group"
                  >
                    <span className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-[var(--brand-600)]" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-bold text-sm text-neutral-900 truncate">{o.orderNumber}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(o.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span className={`acct-chip ${STATUS_CHIP[o.status] ?? "acct-chip-neutral"}`}>{o.status}</span>
                    <span className="font-black text-sm text-neutral-900 w-28 text-right">{formatPrice(Number(o.total))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Points activity */}
        <section className="acct-glass p-6 xl:col-span-2 acct-rise" style={{ animationDelay: "400ms" }}>
          <h2 className="font-black text-neutral-900 text-lg mb-4">{LOYALTY_NAME} activity</h2>
          {loyalty.history.length === 0 ? (
            <p className="text-sm text-neutral-500 py-6 text-center">
              Your points history will appear here after your first delivered order.
            </p>
          ) : (
            <ul className="space-y-3">
              {loyalty.history.slice(0, 6).map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-neutral-800 font-medium truncate">{h.note ?? h.type}</p>
                    <p className="text-[11px] text-neutral-400">
                      {new Date(h.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span
                    className={
                      h.points >= 0
                        ? "acct-chip acct-chip-blue"
                        : "acct-chip acct-chip-neutral"
                    }
                  >
                    {h.points >= 0 ? "+" : ""}
                    {h.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
