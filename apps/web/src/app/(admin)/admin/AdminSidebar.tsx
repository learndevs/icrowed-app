"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  Award,
  ShoppingBag,
  BarChart3,
  Megaphone,
  Ticket,
  Settings,
  Smartphone,
  Users,
  ShieldCheck,
  Activity,
  Mail,
  PieChart,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/analytics", label: "Analytics", icon: PieChart },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Tag },
      { href: "/admin/brands", label: "Brands", icon: Award },
      { href: "/admin/inventory", label: "Inventory", icon: BarChart3 },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/admin/offers", label: "Offers / Banners", icon: Megaphone },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
      { href: "/admin/email-templates", label: "Email Templates", icon: Mail },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/admins", label: "Admin Users", icon: ShieldCheck },
      { href: "/admin/audit-log", label: "Audit Log", icon: Activity },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
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

      <nav className="flex-1 p-3 space-y-4">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1 text-[10px] uppercase tracking-wider font-semibold text-[var(--muted)]">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, exact }) => {
                const active = exact
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group",
                      active
                        ? "bg-[var(--brand-100)] text-[var(--brand-700)] font-medium"
                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        active
                          ? "text-[var(--color-primary)]"
                          : "group-hover:text-[var(--color-primary)]"
                      )}
                    />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
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
  );
}
