"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, ShoppingCart, Search, User, Menu, X, Smartphone, LogOut, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/products", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/offers", label: "Offers" },
];

export default function Header() {
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const displayName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? user?.email?.split("@")[0];

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

            {/* User menu */}
            <div className="relative hidden sm:block">
              {user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="h-10 px-3 flex items-center gap-2 rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium"
                    aria-label="Account menu"
                  >
                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center uppercase">
                      {displayName?.[0] ?? "U"}
                    </div>
                    <span className="hidden lg:block max-w-24 truncate">{displayName}</span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-[80]" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-12 z-[90] w-48 bg-white rounded-xl shadow-lg border border-[var(--border)] py-1 overflow-hidden">
                        <div className="px-3 py-2 border-b border-[var(--border)]">
                          <p className="text-xs font-semibold truncate">{displayName}</p>
                          <p className="text-xs text-[var(--muted)] truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[var(--surface)] transition-colors"
                        >
                          <User className="w-4 h-4" /> My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[var(--surface)] transition-colors"
                        >
                          <Package className="w-4 h-4" /> My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[var(--surface)] transition-colors"
                        >
                          <Heart className="w-4 h-4" /> Wishlist
                          {wishlistCount > 0 && (
                            <span className="ml-auto text-[10px] font-bold bg-rose-100 text-rose-600 rounded-full px-1.5 py-0.5">{wishlistCount}</span>
                          )}
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  aria-label="Sign in"
                  className="h-10 px-3 flex items-center gap-2 rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden lg:block">Sign In</span>
                </Link>
              )}
            </div>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
              className="relative h-10 w-10 hidden sm:flex items-center justify-center rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-rose-500 transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
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

      {/* Mobile Nav */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-14 bg-black/30 z-[90] md:hidden"
            onClick={() => setMobileOpen(false)}
          />
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
              {user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-100"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => { setMobileOpen(false); handleSignOut(); }}
                    className="text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-100"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
