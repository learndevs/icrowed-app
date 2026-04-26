"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, User, Menu, X, Smartphone } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/products", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/offers", label: "Offers" },
];

export default function Header() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/60">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[var(--foreground)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <span>iCrowed</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-[var(--brand-50)] text-[var(--color-primary)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/account"
              aria-label="Account"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            <Link
              href="/cart"
              aria-label={`Cart (${itemCount} items)`}
              className="relative h-10 w-10 flex items-center justify-center rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg hover:bg-[var(--surface)] transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav — fixed overlay so it escapes backdrop-filter stacking context */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-14 bg-black/30 z-[90] md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="fixed top-14 left-0 right-0 z-[100] md:hidden bg-white border-b border-gray-100 shadow-xl">
            <nav className="max-w-[1400px] mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                    pathname.startsWith(link.href)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-800 hover:bg-gray-100"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-100"
              >
                My Account
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
