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
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: string;
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
      { href: "/admin/offers", label: "Offers & Banners", icon: Megaphone },
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

type Props = {
  fullName: string | null;
  email: string;
  initials: string;
};

export function AdminSidebar({ fullName, email, initials }: Readonly<Props>) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-white border-r border-gray-100 overflow-hidden">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-gray-100 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900 leading-none tracking-tight">iCrowed</p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-widest">Admin Console</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon, exact, badge }) => {
                const active = exact
                  ? pathname === href
                  : pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                      active
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />
                    )}
                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        active
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      )}
                    />
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <span className="text-[10px] font-semibold bg-indigo-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                        {badge}
                      </span>
                    )}
                    {active && (
                      <ChevronRight className="w-3 h-3 text-indigo-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Back to Store */}
      <div className="shrink-0 border-t border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate leading-none">
              {fullName ?? "Admin"}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{email}</p>
          </div>
        </div>

        <div className="px-3 pb-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Store
          </Link>
        </div>
      </div>
    </aside>
  );
}
