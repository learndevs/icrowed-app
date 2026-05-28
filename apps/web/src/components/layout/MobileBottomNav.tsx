"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Grid3X3, Layers, Tag, ShoppingCart, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  itemCount: number;
  onSearchClick: () => void;
}

interface MobileNavLink {
  href: string;
  label: string;
  Icon: LucideIcon;
  active: boolean;
  badge?: number;
}

export function MobileBottomNav({ itemCount, onSearchClick }: MobileBottomNavProps) {
  const pathname = usePathname();
  const mobileNavLinks: MobileNavLink[] = [
    { href: "/", label: "Home", Icon: House, active: pathname === "/" },
    { href: "/products", label: "Products", Icon: Grid3X3, active: pathname.startsWith("/products") },
    { href: "/categories", label: "Categories", Icon: Layers, active: pathname.startsWith("/categories") },
    { href: "/offers", label: "Offers", Icon: Tag, active: pathname.startsWith("/offers") },
    { href: "/cart", label: "Cart", Icon: ShoppingCart, active: pathname.startsWith("/cart"), badge: itemCount },
  ];

  return (
    <div className="fixed inset-x-0 bottom-4 z-[100] flex justify-center px-3 md:hidden">
      <nav className="type-nav relative flex w-full max-w-md items-center justify-between rounded-full border border-white/80 bg-white/45 px-1.5 py-2 backdrop-blur-2xl shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/70 via-white/45 to-gray-100/30" />
        {mobileNavLinks.slice(0, 2).map((link) => (
          <MobileNavItem key={link.label} link={link} />
        ))}
        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Search products"
          className="relative z-10 flex h-11 min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-full px-1 text-gray-700 transition-all hover:text-[#404040]"
        >
          <Search className="h-3.5 w-3.5" strokeWidth={2.2} />
          <span className="text-[8px] font-semibold leading-none">Search</span>
        </button>
        {mobileNavLinks.slice(2).map((link) => (
          <MobileNavItem key={link.label} link={link} />
        ))}
      </nav>
    </div>
  );
}

function MobileNavItem({ link }: { link: MobileNavLink }) {
  return (
    <Link
      href={link.href}
      className={cn(
        "relative z-10 flex h-11 min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-full px-1 transition-all",
        link.active
          ? "bg-[#E6E6E6] text-[#404040] shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
          : "text-gray-700 hover:text-[#404040]",
      )}
      aria-label={link.label}
    >
      <span className="relative">
        <link.Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
        {link.badge !== undefined && link.badge > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-black px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">
            {link.badge > 99 ? "99+" : link.badge}
          </span>
        )}
      </span>
      <span className="text-[8px] font-semibold leading-none">{link.label}</span>
    </Link>
  );
}
