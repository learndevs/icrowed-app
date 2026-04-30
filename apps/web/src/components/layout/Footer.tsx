import Link from "next/link";
import { Smartphone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              iCrowed
            </Link>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Sri Lanka&apos;s trusted destination for mobile phones and accessories.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link href="/products" className="hover:text-[var(--foreground)] transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-[var(--foreground)] transition-colors">Categories</Link></li>
              <li><Link href="/offers" className="hover:text-[var(--foreground)] transition-colors">Offers</Link></li>
              <li><Link href="/categories#shop-by-brand" className="hover:text-[var(--foreground)] transition-colors">Brands</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link href="/track" className="hover:text-[var(--foreground)] transition-colors">Track Order</Link></li>
              <li><Link href="/orders" className="hover:text-[var(--foreground)] transition-colors">My Orders</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--foreground)] transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--foreground)] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link href="/about" className="hover:text-[var(--foreground)] transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--foreground)] transition-colors">Terms of Service</Link></li>
              <li><Link href="/returns" className="hover:text-[var(--foreground)] transition-colors">Return Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <p>© {new Date().getFullYear()} iCrowed. All rights reserved.</p>
          <p>Made with ❤️ in Sri Lanka</p>
        </div>
      </div>
    </footer>
  );
}
