"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/analytics": "Analytics",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/brands": "Brands",
  "/admin/inventory": "Inventory",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/reviews": "Reviews",
  "/admin/offers": "Offers & Banners",
  "/admin/coupons": "Coupons",
  "/admin/email-templates": "Email Templates",
  "/admin/admins": "Admin Users",
  "/admin/audit-log": "Audit Log",
  "/admin/settings": "Settings",
};

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href: string }[] = [];
  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    const label = ROUTE_LABELS[path];
    if (label) crumbs.push({ label, href: path });
    else if (!seg.startsWith("[")) {
      const formatted = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
      crumbs.push({ label: formatted, href: path });
    }
  }
  return crumbs;
}

type Props = {
  fullName: string | null;
  email: string;
  initials: string;
};

export function AdminHeader({ fullName, email, initials }: Props) {
  const crumbs = useBreadcrumbs();
  const pageTitle = crumbs.at(-1)?.label ?? "Admin";

  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0 shadow-sm">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-1.5 min-w-0">
        {crumbs.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
            <span
              className={
                i === crumbs.length - 1
                  ? "text-sm font-semibold text-gray-900 truncate"
                  : "text-sm text-gray-400 truncate hidden sm:block"
              }
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification bell */}
        <button
          type="button"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800 leading-none">
              {fullName ?? "Admin"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{email}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
