"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  User,
  MapPin,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountNav({
  name,
  email,
  initials,
  tierName,
}: {
  name: string;
  email: string;
  initials: string;
  tierName?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Desktop: sticky glass sidebar */}
      <aside className="hidden lg:block">
        <div className="acct-glass sticky top-24 p-5">
          <div className="flex items-center gap-3 pb-5 border-b border-black/5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-900 to-[var(--brand-700)] text-white font-black flex items-center justify-center shadow-lg shadow-sky-900/20">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-neutral-900 truncate leading-tight">{name}</p>
              <p className="text-xs text-neutral-500 truncate">{email}</p>
              {tierName && (
                <span className="acct-chip acct-chip-blue mt-1.5">{tierName}</span>
              )}
            </div>
          </div>

          <nav className="py-4 space-y-1">
            {LINKS.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(pathname, href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all",
                    active
                      ? "bg-neutral-900 text-white shadow-md shadow-black/10"
                      : "text-neutral-600 hover:bg-sky-50/80 hover:text-[var(--brand-700)]",
                  )}
                >
                  <Icon className={cn("w-4 h-4", active && "text-sky-300")} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-neutral-500 hover:bg-black/5 hover:text-neutral-900 transition-colors border-t border-black/5 pt-4 mt-1"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile: scrolling glass pill tabs */}
      <nav
        aria-label="Account sections"
        className="lg:hidden acct-glass !rounded-full p-1.5 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 flex items-center gap-2 rounded-full px-4 h-10 text-sm font-semibold transition-all",
                active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:text-[var(--brand-700)]",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
