import { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Tag,
  Award,
  ShoppingBag,
  BarChart3,
  Megaphone,
  Settings,
  Smartphone,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/brands", label: "Brands", icon: Award },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/inventory", label: "Inventory", icon: BarChart3 },
  { href: "/admin/offers", label: "Offers / Banners", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface)]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-[var(--border)] bg-white flex flex-col overflow-y-auto">
        <div className="h-16 px-4 flex items-center gap-2 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">iCrowed</p>
            <p className="text-[10px] text-[var(--muted)]">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors group"
            >
              <Icon className="w-4 h-4 shrink-0 group-hover:text-[var(--color-primary)] transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-[var(--border)] px-6 flex items-center justify-between shrink-0">
          <h1 className="font-semibold text-base">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--brand-100)] flex items-center justify-center text-sm font-bold text-[var(--brand-700)]">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
