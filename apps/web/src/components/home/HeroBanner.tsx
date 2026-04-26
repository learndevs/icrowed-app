"use client";

import Link from "next/link";
import { ArrowRight, Shield, Truck, RefreshCw, Headphones } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--brand-600)] to-[var(--brand-900)] text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            New arrivals every week
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            The Latest Phones,
            <br />
            <span className="text-[var(--brand-200)]">Unbeatable Prices</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-xl leading-relaxed">
            Shop Sri Lanka&apos;s widest selection of smartphones and accessories. 
            Fast island-wide delivery, genuine warranty, and hassle-free returns.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products">
              <Button size="lg" className="bg-white text-[var(--brand-600)] hover:bg-blue-50">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/offers">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                View Offers
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="relative border-t border-white/10 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Truck, label: "Island-wide Delivery" },
              { icon: Shield, label: "Genuine Products" },
              { icon: RefreshCw, label: "Easy Returns" },
              { icon: Headphones, label: "24/7 Support" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-white/80">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
