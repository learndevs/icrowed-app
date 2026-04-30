import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Heart, Package, User, MapPin, ArrowRight, ShoppingBag, Smartphone } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
  const displayName = fullName || (user.email?.split("@")[0] ?? "Account");
  const initials = fullName
    ? fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : (user.email?.[0] ?? "U").toUpperCase();

  const NAV = [
    {
      href: "/account/orders",
      icon: Package,
      label: "My Orders",
      sub: "Track & view order history",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      accent: "group-hover:bg-indigo-600",
    },
    {
      href: "/wishlist",
      icon: Heart,
      label: "Wishlist",
      sub: "Products you've saved",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-500",
      accent: "group-hover:bg-rose-500",
    },
    {
      href: "/account/profile",
      icon: User,
      label: "Profile",
      sub: "Update name & phone",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
      accent: "group-hover:bg-teal-600",
    },
    {
      href: "/account/addresses",
      icon: MapPin,
      label: "Saved Addresses",
      sub: "Manage delivery addresses",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      accent: "group-hover:bg-amber-600",
    },
  ];

  return (
    <div className="bento-bg min-h-screen">
      <div className="px-3 sm:px-5 lg:px-8 py-6 max-w-350 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Left column: Profile card ── */}
          <div className="lg:col-span-1 flex flex-col gap-4">

            {/* Avatar + identity */}
            <div className="bento-card p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
                <span className="text-white font-black text-2xl">{initials}</span>
              </div>
              <p className="font-black text-gray-900 text-xl leading-tight">{displayName}</p>
              <p className="text-sm text-gray-400 mt-1 truncate w-full">{user.email}</p>

              <div className="w-full mt-5 pt-5 border-t border-gray-100">
                <SignOutButton />
              </div>
            </div>

            {/* Continue Shopping */}
            <Link
              href="/products"
              className="bento-card p-5 flex items-center gap-4 group hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-2xl bg-lime-100 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6 text-lime-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900">Continue Shopping</p>
                <p className="text-xs text-gray-400 mt-0.5">Browse phones & accessories</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-lime-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>

            {/* iCrowed promo card */}
            <div className="bento-card p-5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <p className="font-black text-base leading-tight mb-1">Sri Lanka&apos;s #1<br />Phone Store</p>
              <p className="text-indigo-200 text-xs leading-relaxed">Genuine products · Island-wide delivery</p>
            </div>
          </div>

          {/* ── Right column: Nav cards ── */}
          <div className="lg:col-span-2">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3 px-1">
              Account Settings
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NAV.map(({ href, icon: Icon, label, sub, iconBg, iconColor }) => (
                <Link
                  key={href}
                  href={href}
                  className="bento-card p-5 flex items-center gap-4 group hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${iconBg} ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
