"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, ShoppingCart, Search, User, Smartphone, LogOut, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

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
    <>
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/40 backdrop-blur-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/55 via-white/30 to-gray-100/20" />
      <div className="pointer-events-none absolute -top-16 right-10 h-36 w-36 rounded-full bg-white/70 blur-3xl" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-14 sm:h-16">
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
            {/* Mobile auth link: top bar shows only logo + sign in/account */}
            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "My account" : "Sign in"}
              className="md:hidden h-10 px-3 flex items-center gap-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium"
            >
              <User className="w-5 h-5" />
              <span>{user ? "Account" : "Sign In"}</span>
            </Link>

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
              className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

          </div>
        </div>
      </div>

    </header>
    <MobileBottomNav itemCount={itemCount} />
    </>
  );
}
